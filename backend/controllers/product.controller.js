import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Brand from '../models/brand.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateSKU } from '../utils/helpers.js';

export const createProduct = asyncHandler(async (req, res) => {
  let productData = { ...req.body };

  // Auto-generate SKU if not provided
  if (!productData.sku) {
    productData.sku = await generateSKU(Product, 'PRD');
  }

  // Handle image upload
  if (req.file) {
    const result = await uploadToCloudinary(req.file, 'products');
    productData.image = result;
  }

  const product = await Product.create(productData);
  await product.populate('category brand supplier');

  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (status) query.status = status;
  if (minPrice || maxPrice) {
    query.sellingPrice = {};
    if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
  }

  // Stock status filter
  if (stockStatus) {
    if (stockStatus === 'out-of-stock') {
      query.quantity = 0;
    } else if (stockStatus === 'low-stock') {
      query.$expr = { $lte: ['$quantity', '$minStockAlert'] };
      query.quantity = { $gt: 0 };
    } else if (stockStatus === 'in-stock') {
      query.$expr = { $gt: ['$quantity', '$minStockAlert'] };
    }
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: [
      { path: 'category', select: 'name' },
      { path: 'brand', select: 'name' },
      { path: 'supplier', select: 'name' },
    ],
  };

  const products = await Product.paginate(query, options);
  res.status(200).json(new ApiResponse(200, products, 'Products fetched successfully'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('supplier', 'name');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let updateData = { ...req.body };

  // Handle image upload
  if (req.file) {
    // Delete old image
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }
    const result = await uploadToCloudinary(req.file, 'products');
    updateData.image = result;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('category brand supplier');

  res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Delete image from cloudinary
  if (product.image?.publicId) {
    await deleteFromCloudinary(product.image.publicId);
  }

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const products = await Product.find({ _id: { $in: ids } });

  // Delete images
  for (const product of products) {
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }
  }

  await Product.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, { deleted: ids.length }, 'Products deleted successfully'));
});

export const duplicateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const productObj = product.toObject();
  delete productObj._id;
  delete productObj.createdAt;
  delete productObj.updatedAt;
  productObj.sku = await generateSKU(Product, 'PRD');
  productObj.name = `${productObj.name} (Copy)`;
  productObj.barcode = undefined;
  productObj.quantity = 0;

  const newProduct = await Product.create(productObj);
  await newProduct.populate('category brand supplier');

  res.status(201).json(new ApiResponse(201, newProduct, 'Product duplicated successfully'));
});

export const getProductStats = asyncHandler(async (req, res) => {
  const total = await Product.countDocuments();
  const active = await Product.countDocuments({ status: 'active' });
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$quantity', '$minStockAlert'] },
    quantity: { $gt: 0 },
  });
  const outOfStock = await Product.countDocuments({ quantity: 0 });

  res.status(200).json(
    new ApiResponse(200, { total, active, lowStock, outOfStock }, 'Product stats fetched')
  );
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$quantity', '$minStockAlert'] },
  })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ quantity: 1 })
    .limit(50);

  res.status(200).json(new ApiResponse(200, products, 'Low stock products fetched'));
});
