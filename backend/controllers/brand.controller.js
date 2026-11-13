import Brand from '../models/brand.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBrand = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw new ApiError(409, 'Brand with this name already exists');
  }

  const brand = await Brand.create({ name, description });
  res.status(201).json(new ApiResponse(201, brand, 'Brand created successfully'));
});

export const getAllBrands = asyncHandler(async (req, res) => {
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

  const brands = await Brand.paginate(query, options);
  res.status(200).json(new ApiResponse(200, brands, 'Brands fetched successfully'));
});

export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  res.status(200).json(new ApiResponse(200, brand, 'Brand fetched successfully'));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true }
  );
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  res.status(200).json(new ApiResponse(200, brand, 'Brand updated successfully'));
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Brand deleted successfully'));
});

export const getActiveBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).select('name _id');
  res.status(200).json(new ApiResponse(200, brands, 'Active brands fetched'));
});
