import { Router } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/auth.controller.js';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerValidator), register);
router.post('/login', authLimiter, validate(loginValidator), login);
router.post('/refresh-token', validate(refreshTokenValidator), refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidator), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidator), resetPassword);

// Protected routes
router.get('/me', verifyJWT, getCurrentUser);
router.patch('/profile', verifyJWT, validate(updateProfileValidator), updateProfile);
router.post('/change-password', verifyJWT, validate(changePasswordValidator), changePassword);

// Admin only routes
router.get('/all', verifyJWT, requireRole('admin'), getAllUsers);
router.patch('/:id/toggle-status', verifyJWT, requireRole('admin'), toggleUserStatus);

export default router;
