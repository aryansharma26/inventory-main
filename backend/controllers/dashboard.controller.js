import Product from '../models/product.model.js';
import Sale from '../models/sale.model.js';
import Purchase from '../models/purchase.model.js';
import Customer from '../models/customer.model.js';
import Supplier from '../models/supplier.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  // Sales stats
  const todaySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);
  const weekSales = await Sale.aggregate([
    { $match: { createdAt: { $gte: weekAgo }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);
  const monthSales = await Sale.aggregate([
    { $match: { createdAt: { $gte: monthAgo }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);
  const yearSales = await Sale.aggregate([
    { $match: { createdAt: { $gte: yearAgo }, status: { $in: ['completed', 'partial'] } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ]);

  // Product stats
  const totalProducts = await Product.countDocuments();
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$quantity', '$minStockAlert'] },
    quantity: { $gt: 0 },
  });
  const outOfStock = await Product.countDocuments({ quantity: 0 });

  // Customer & Supplier stats
  const totalCustomers = await Customer.countDocuments();
  const totalSuppliers = await Supplier.countDocuments();

  // Purchase stats
  const totalPurchases = await Purchase.countDocuments();
  const pendingPurchases = await Purchase.countDocuments({ status: 'pending' });
  const pendingPayments = await Purchase.aggregate([
    { $match: { paymentStatus: { $in: ['pending', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$dueAmount' } } },
  ]);

  // Recent sales
  const recentSales = await Sale.find({ status: { $in: ['completed', 'partial'] } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customer', 'name')
    .select('invoiceNumber total status createdAt');

  // Best selling products (last 30 days)
  const bestSelling = await Sale.aggregate([
    { $match: { createdAt: { $gte: monthAgo }, status: { $in: ['completed', 'partial'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);
  await Product.populate(bestSelling, { path: '_id', select: 'name sku' });

  // Monthly sales chart data (last 12 months)
  const monthlySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: yearAgo }, status: { $in: ['completed', 'partial'] } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        profit: { $sum: { $subtract: ['$total', { $multiply: ['$subtotal', 0.6] }] } }, // estimated profit
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top customers
  const topCustomers = await Customer.find()
    .sort({ totalSpending: -1 })
    .limit(5)
    .select('name totalSpending');

  res.status(200).json(
    new ApiResponse(200, {
      todaySales: todaySales[0] || { count: 0, revenue: 0 },
      weekSales: weekSales[0] || { count: 0, revenue: 0 },
      monthSales: monthSales[0] || { count: 0, revenue: 0 },
      yearSales: yearSales[0] || { count: 0, revenue: 0 },
      totalProducts,
      lowStock,
      outOfStock,
      totalCustomers,
      totalSuppliers,
      totalPurchases,
      pendingPurchases,
      pendingPayments: pendingPayments[0]?.total || 0,
      recentSales,
      bestSelling: bestSelling.map(item => ({ name: item._id?.name || 'Unknown', sku: item._id?.sku, totalSold: item.totalSold, revenue: item.revenue })),
      monthlySales,
      topCustomers,
    }, 'Dashboard stats fetched')
  );
});
