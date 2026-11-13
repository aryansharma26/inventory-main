import Customer from '../models/customer.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(new ApiResponse(201, customer, 'Customer created successfully'));
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: 1 },
  };

  const customers = await Customer.paginate(query, options);
  res.status(200).json(new ApiResponse(200, customers, 'Customers fetched successfully'));
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.status(200).json(new ApiResponse(200, customer, 'Customer fetched successfully'));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id, req.body, { new: true, runValidators: true }
  );
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.status(200).json(new ApiResponse(200, customer, 'Customer updated successfully'));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.status(200).json(new ApiResponse(200, null, 'Customer deleted successfully'));
});

export const getActiveCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ isActive: true }).sort({ name: 1 }).select('name phone _id');
  res.status(200).json(new ApiResponse(200, customers, 'Active customers fetched'));
});
