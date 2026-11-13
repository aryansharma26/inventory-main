import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../utils/ApiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder = 'inventory') => {
  try {
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new ApiError(500, 'Error uploading image to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;
