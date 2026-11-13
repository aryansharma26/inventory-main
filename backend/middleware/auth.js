import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded._id).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(401, 'Invalid access token');
  }

  req.user = user;
  next();
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized request');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
};
