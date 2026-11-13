import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import StockHistory from '../models/stockHistory.model.js';
import Customer from '../models/customer.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateInvoiceNumber } from '../utils/helpers.js';

export const createSale = asyncHandler(async (req, res) => {
  const { customer, items, paymentMethod, paymentDetails, notes } = req.body;

  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  const saleItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new ApiError(404, `Product ${item.product} not found`);
      if (product.quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.quantity}`);
      }

      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = itemTotal * (item.tax || 0) / 100;
      const discountAmount = itemTotal * (item.discount || 0) / 100;
      const finalTotal = itemTotal + taxAmount - discountAmount;

      subtotal += itemTotal;
      totalTax += taxAmount;
      totalDiscount += discountAmount;

      // Deduct stock
      const previousStock = product.quantity;
      product.quantity -= item.quantity;
      await product.save();

      // Create stock history
      await StockHistory.create({
        product: item.product,
        type: 'sale',
        quantity: -item.quantity,
        previousStock,
        newStock: product.quantity,
        reference: null,
        referenceModel: 'Sale',
        reason: 'Sale transaction',
        performedBy: req.user._id,
      });

      return {
        ...item,
        total: finalTotal,
      };
    })
  );

  const total = subtotal + totalTax - totalDiscount;
  const paidAmount = paymentMethod === 'split'
    ? (paymentDetails?.cash || 0) + (paymentDetails?.card || 0) + (paymentDetails?.upi || 0)
    : total;
  const dueAmount = total - paidAmount;

  const invoiceNumber = await generateInvoiceNumber(Sale, 'SAL');

  const sale = await Sale.create({
    invoiceNumber,
    customer: customer || null,
    items: saleItems,
    subtotal,
    totalTax,
    totalDiscount,
    total,
    paidAmount,
    dueAmount,
    paymentMethod,
    paymentDetails: paymentDetails || {},
    notes,
    status: dueAmount > 0 ? 'partial' : 'completed',
    createdBy: req.user._id,
  });

  // Update customer stats
  if (customer) {
    const cust = await Customer.findById(customer);
    if (cust) {
      cust.totalSpending += total;
      cust.dueAmount += dueAmount;
      await cust.save();
    }
  }

  await sale.populate('customer items.product');
  res.status(201).json(new ApiResponse(201, sale, 'Sale completed successfully'));
});

export const getAllSales = asyncHandler(async (req, res) => {
  const { search, customer, status, paymentMethod, page = 1, limit = 20, startDate, endDate } = req.query;

  const query = {};
  if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
  if (customer) query.customer = customer;
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: 'customer', select: 'name phone' },
      { path: 'items.product', select: 'name sku' },
      { path: 'createdBy', select: 'name' },
    ],
  };

  const sales = await Sale.paginate(query, options);
  res.status(200).json(new ApiResponse(200, sales, 'Sales fetched successfully'));
});

export const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate('customer', 'name phone email address')
    .populate('items.product', 'name sku unit')
    .populate('createdBy', 'name');

  if (!sale) throw new ApiError(404, 'Sale not found');
  res.status(200).json(new ApiResponse(200, sale, 'Sale fetched successfully'));
});

export const refundSale = asyncHandler(async (req, res) => {
  const { items: refundItems } = req.body;
  const sale = await Sale.findById(req.params.id);
  if (!sale) throw new ApiError(404, 'Sale not found');
  if (sale.status === 'refunded') throw new ApiError(400, 'Sale already refunded');

  for (const refundItem of refundItems) {
    const saleItem = sale.items.find(
      (i) => i.product.toString() === refundItem.product
    );
    if (!saleItem) continue;

    const refundQty = Math.min(refundItem.quantity, saleItem.quantity);
    const product = await Product.findById(refundItem.product);
    if (product) {
      const previousStock = product.quantity;
      product.quantity += refundQty;
      await product.save();

      await StockHistory.create({
        product: refundItem.product,
        type: 'return',
        quantity: refundQty,
        previousStock,
        newStock: product.quantity,
        reference: sale._id,
        referenceModel: 'Sale',
        reason: `Sale refund: ${sale.invoiceNumber}`,
        performedBy: req.user._id,
      });
    }

    saleItem.quantity -= refundQty;
  }

  sale.status = 'refunded';
  await sale.save();

  res.status(200).json(new ApiResponse(200, sale, 'Sale refunded successfully'));
});

export const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) throw new ApiError(404, 'Sale not found');
  if (sale.status === 'completed') {
    throw new ApiError(400, 'Cannot delete a completed sale. Please refund instead.');
  }
  await Sale.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Sale deleted successfully'));
});

export const getSaleStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const totalSales = await Sale.countDocuments({ status: { $in: ['completed', 'partial'] } });
  const todaySales = await Sale.countDocuments({ createdAt: { $gte: today }, status: { $in: ['completed', 'partial'] } });
  const weekSales = await Sale.countDocuments({ createdAt: { $gte: weekAgo }, status: { $in: ['completed', 'partial'] } });
  const monthSales = await Sale.countDocuments({ createdAt: { $gte: monthAgo }, status: { $in: ['completed', 'partial'] } });

  const totalRevenue = await Sale.aggregate([
    { $match: { status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const todayRevenue = await Sale.aggregate([
    { $match: { createdAt: { $gte: today }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const weekRevenue = await Sale.aggregate([
    { $match: { createdAt: { $gte: weekAgo }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const monthRevenue = await Sale.aggregate([
    { $match: { createdAt: { $gte: monthAgo }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalSales,
      todaySales,
      weekSales,
      monthSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      weekRevenue: weekRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
    }, 'Sale stats fetched')
  );
});
