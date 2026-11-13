import Category from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw new ApiError(409, 'Category with this name already exists');
  }

  const category = await Category.create({ name, description });
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: 1 },
  };

  const categories = await Category.paginate(query, options);
  res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.status(200).json(new ApiResponse(200, category, 'Category fetched successfully'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true }
  );
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

export const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).select('name _id');
  res.status(200).json(new ApiResponse(200, categories, 'Active categories fetched'));
});
