import Product from '../models/product.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const lowStock = await Product.find({
    $expr: { $lte: ['$quantity', '$minStockAlert'] },
    quantity: { $gt: 0 },
  }).select('name sku quantity minStockAlert').limit(20);

  const outOfStock = await Product.find({
    quantity: 0,
  }).select('name sku').limit(20);

  const expiring = await Product.find({
    expiryDate: { $lte: thirtyDaysFromNow, $gte: today },
  }).select('name sku expiryDate quantity').limit(20);

  const notifications = [
    ...lowStock.map(p => ({ type: 'low-stock', message: `${p.name} is running low (${p.quantity} left)`, product: p._id, createdAt: new Date() })),
    ...outOfStock.map(p => ({ type: 'out-of-stock', message: `${p.name} is out of stock`, product: p._id, createdAt: new Date() })),
    ...expiring.map(p => ({ type: 'expiring', message: `${p.name} expires on ${p.expiryDate.toDateString()}`, product: p._id, createdAt: new Date() })),
  ];

  res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched'));
});
