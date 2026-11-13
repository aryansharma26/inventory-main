import Settings from '../models/setting.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json(new ApiResponse(200, settings, 'Settings fetched successfully'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
  }
  res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
});
