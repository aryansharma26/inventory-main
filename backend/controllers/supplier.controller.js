import Supplier from '../models/supplier.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(new ApiResponse(201, supplier, 'Supplier created successfully'));
});

export const getAllSuppliers = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: 1 },
  };

  const suppliers = await Supplier.paginate(query, options);
  res.status(200).json(new ApiResponse(200, suppliers, 'Suppliers fetched successfully'));
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.status(200).json(new ApiResponse(200, supplier, 'Supplier fetched successfully'));
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id, req.body, { new: true, runValidators: true }
  );
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.status(200).json(new ApiResponse(200, supplier, 'Supplier updated successfully'));
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.status(200).json(new ApiResponse(200, null, 'Supplier deleted successfully'));
});

export const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 }).select('name company _id');
  res.status(200).json(new ApiResponse(200, suppliers, 'Active suppliers fetched'));
});
