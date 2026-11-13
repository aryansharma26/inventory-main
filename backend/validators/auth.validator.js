import { z } from 'zod';

export const registerValidator = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'staff']).optional().default('staff'),
});

export const loginValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenValidator = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordValidator = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordValidator = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordValidator = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileValidator = z.object({
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
