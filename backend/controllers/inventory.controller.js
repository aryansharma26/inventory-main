import Product from '../models/product.model.js';
import StockHistory from '../models/stockHistory.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getInventory = asyncHandler(async (req, res) => {
  const { search, category, stockStatus, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  if (stockStatus) {
    if (stockStatus === 'out-of-stock') query.quantity = 0;
    else if (stockStatus === 'low-stock') {
      query.$expr = { $lte: ['$quantity', '$minStockAlert'] };
      query.quantity = { $gt: 0 };
    } else if (stockStatus === 'in-stock') {
      query.$expr = { $gt: ['$quantity', '$minStockAlert'] };
    }
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: 1 },
    populate: [
      { path: 'category', select: 'name' },
      { path: 'brand', select: 'name' },
    ],
  };

  const products = await Product.paginate(query, options);
  res.status(200).json(new ApiResponse(200, products, 'Inventory fetched successfully'));
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, type } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const previousStock = product.quantity;
  const newStock = quantity;
  product.quantity = Math.max(0, newStock);
  await product.save();

  await StockHistory.create({
    product: productId,
    type: type || 'adjustment',
    quantity: newStock - previousStock,
    previousStock,
    newStock: product.quantity,
    reason,
    performedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, product, 'Stock adjusted successfully'));
});

export const getStockHistory = asyncHandler(async (req, res) => {
  const { product, type, page = 1, limit = 20 } = req.query;
  const query = {};
  if (product) query.product = product;
  if (type) query.type = type;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: 'product', select: 'name sku' },
      { path: 'performedBy', select: 'name' },
    ],
  };

  const history = await StockHistory.paginate(query, options);
  res.status(200).json(new ApiResponse(200, history, 'Stock history fetched successfully'));
});

export const getInventoryStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalStock = await Product.aggregate([
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$quantity', '$minStockAlert'] },
    quantity: { $gt: 0 },
  });
  const outOfStock = await Product.countDocuments({ quantity: 0 });
  const totalValue = await Product.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalProducts,
      totalStock: totalStock[0]?.total || 0,
      lowStock,
      outOfStock,
      totalValue: totalValue[0]?.total || 0,
    }, 'Inventory stats fetched')
  );
});
