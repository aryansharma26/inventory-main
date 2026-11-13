import Purchase from '../models/purchase.model.js';
import Product from '../models/product.model.js';
import StockHistory from '../models/stockHistory.model.js';
import Supplier from '../models/supplier.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateInvoiceNumber } from '../utils/helpers.js';

export const createPurchase = asyncHandler(async (req, res) => {
  const { supplier, items, notes } = req.body;

  // Calculate totals
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  const purchaseItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new ApiError(404, `Product ${item.product} not found`);

      const itemTotal = item.quantity * item.purchasePrice;
      const taxAmount = itemTotal * (item.tax || 0) / 100;
      const discountAmount = itemTotal * (item.discount || 0) / 100;
      const finalTotal = itemTotal + taxAmount - discountAmount;

      subtotal += itemTotal;
      totalTax += taxAmount;
      totalDiscount += discountAmount;

      return {
        ...item,
        total: finalTotal,
      };
    })
  );

  const total = subtotal + totalTax - totalDiscount;
  const invoiceNumber = await generateInvoiceNumber(Purchase, 'PUR');

  const purchase = await Purchase.create({
    invoiceNumber,
    supplier,
    items: purchaseItems,
    subtotal,
    totalTax,
    totalDiscount,
    total,
    dueAmount: total,
    notes,
    createdBy: req.user._id,
  });

  await purchase.populate('supplier items.product');
  res.status(201).json(new ApiResponse(201, purchase, 'Purchase order created successfully'));
});

export const getAllPurchases = asyncHandler(async (req, res) => {
  const { search, supplier, status, paymentStatus, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
  if (supplier) query.supplier = supplier;
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: 'supplier', select: 'name company' },
      { path: 'items.product', select: 'name sku' },
      { path: 'createdBy', select: 'name' },
    ],
  };

  const purchases = await Purchase.paginate(query, options);
  res.status(200).json(new ApiResponse(200, purchases, 'Purchases fetched successfully'));
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('supplier', 'name company phone email address')
    .populate('items.product', 'name sku unit')
    .populate('createdBy', 'name');

  if (!purchase) throw new ApiError(404, 'Purchase not found');
  res.status(200).json(new ApiResponse(200, purchase, 'Purchase fetched successfully'));
});

export const receivePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.status === 'received') throw new ApiError(400, 'Purchase already received');

  // Update product stock
  for (const item of purchase.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const previousStock = product.quantity;
    product.quantity += item.quantity;
    if (item.purchasePrice) product.purchasePrice = item.purchasePrice;
    if (item.sellingPrice) product.sellingPrice = item.sellingPrice;
    await product.save();

    // Create stock history
    await StockHistory.create({
      product: item.product,
      type: 'purchase',
      quantity: item.quantity,
      previousStock,
      newStock: product.quantity,
      reference: purchase._id,
      referenceModel: 'Purchase',
      reason: `Purchase received: ${purchase.invoiceNumber}`,
      performedBy: req.user._id,
    });
  }

  // Update supplier totals
  const supplier = await Supplier.findById(purchase.supplier);
  if (supplier) {
    supplier.totalPurchases += purchase.total;
    supplier.pendingAmount += purchase.dueAmount;
    await supplier.save();
  }

  purchase.status = 'received';
  purchase.receivedAt = new Date();
  await purchase.save();

  res.status(200).json(new ApiResponse(200, purchase, 'Purchase received successfully'));
});

export const returnPurchase = asyncHandler(async (req, res) => {
  const { items: returnItems } = req.body;
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');

  for (const returnItem of returnItems) {
    const purchaseItem = purchase.items.find(
      (i) => i.product.toString() === returnItem.product
    );
    if (!purchaseItem) continue;

    const returnQty = Math.min(returnItem.quantity, purchaseItem.quantity);
    const product = await Product.findById(returnItem.product);
    if (product) {
      const previousStock = product.quantity;
      product.quantity = Math.max(0, product.quantity - returnQty);
      await product.save();

      await StockHistory.create({
        product: returnItem.product,
        type: 'return',
        quantity: -returnQty,
        previousStock,
        newStock: product.quantity,
        reference: purchase._id,
        referenceModel: 'Purchase',
        reason: `Purchase return: ${purchase.invoiceNumber}`,
        performedBy: req.user._id,
      });
    }

    purchaseItem.quantity -= returnQty;
  }

  purchase.status = 'returned';
  await purchase.save();

  res.status(200).json(new ApiResponse(200, purchase, 'Purchase returned successfully'));
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.status === 'received') {
    throw new ApiError(400, 'Cannot delete a received purchase');
  }
  await Purchase.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Purchase deleted successfully'));
});

export const getPurchaseStats = asyncHandler(async (req, res) => {
  const total = await Purchase.countDocuments();
  const pending = await Purchase.countDocuments({ status: 'pending' });
  const received = await Purchase.countDocuments({ status: 'received' });
  const totalAmount = await Purchase.aggregate([
    { $match: { status: 'received' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const pendingAmount = await Purchase.aggregate([
    { $match: { paymentStatus: { $in: ['pending', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$dueAmount' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      total,
      pending,
      received,
      totalAmount: totalAmount[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
    }, 'Purchase stats fetched')
  );
});
