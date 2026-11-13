import { z } from 'zod';

export const createCategoryValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

export const updateCategoryValidator = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const createBrandValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

export const updateBrandValidator = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const createProductValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  unit: z.enum(['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'set', 'pair', 'meter', 'foot']).default('piece'),
  purchasePrice: z.number().min(0).default(0),
  sellingPrice: z.number().min(0).default(0),
  mrp: z.number().min(0).optional(),
  tax: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0).default(0),
  minStockAlert: z.number().min(0).default(10),
  supplier: z.string().optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

export const updateProductValidator = z.object({
  name: z.string().min(2).max(200).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  unit: z.enum(['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'set', 'pair', 'meter', 'foot']).optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  tax: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0).optional(),
  minStockAlert: z.number().min(0).optional(),
  supplier: z.string().optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

export const bulkDeleteValidator = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
});

export const createSupplierValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(100).optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional(),
  gstNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const createCustomerValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});
