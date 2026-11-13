import Expense from '../models/expense.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(new ApiResponse(201, expense, 'Expense recorded successfully'));
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
  const query = {};
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { date: -1 },
  };

  const expenses = await Expense.paginate(query, options);
  res.status(200).json(new ApiResponse(200, expenses, 'Expenses fetched successfully'));
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');
  res.status(200).json(new ApiResponse(200, expense, 'Expense fetched successfully'));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!expense) throw new ApiError(404, 'Expense not found');
  res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');
  res.status(200).json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

export const getExpenseStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const daily = await Expense.aggregate([
    { $match: { date: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const monthly = await Expense.aggregate([
    { $match: { date: { $gte: monthAgo } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);

  const yearly = await Expense.aggregate([
    { $match: { date: { $gte: yearAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  const total = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      daily: daily[0]?.total || 0,
      monthly,
      yearly,
      total: total[0]?.total || 0,
    }, 'Expense stats fetched')
  );
});
