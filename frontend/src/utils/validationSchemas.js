import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  unit: z.enum(['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'set', 'pair', 'meter', 'foot']).default('piece'),
  purchasePrice: z.number().min(0, 'Price must be positive').default(0),
  sellingPrice: z.number().min(0, 'Price must be positive').default(0),
  mrp: z.number().min(0).optional(),
  tax: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0).default(0),
  minStockAlert: z.number().min(0).default(10),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

// Supplier schema
export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(100).optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
});

// Customer schema
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
});
