import crypto from 'crypto';
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { sendEmail, getPasswordResetTemplate } from '../utils/email.js';

// Generate tokens and send response
const sendTokens = (user, statusCode, res, message) => {
  const accessToken = generateAccessToken({ _id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ _id: user._id });

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    address: user.address,
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(statusCode, {
        user: userResponse,
        accessToken,
        refreshToken,
      }, message)
    );
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({ name, email, password, phone, role });
  sendTokens(user, 201, res, 'User registered successfully');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokens(user, 200, res, 'Logged in successfully');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken({ _id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ _id: user._id });

  res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })
    .cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed')
    );
});

export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json(
      new ApiResponse(200, null, 'If an account exists, a reset email has been sent')
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: getPasswordResetTemplate(resetUrl, user.name),
    });

    res.status(200).json(
      new ApiResponse(200, null, 'If an account exists, a reset email has been sent')
    );
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, 'Error sending email. Please try again later.');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokens(user, 200, res, 'Password reset successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select('-password -refreshToken');
  res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`)
  );
});
