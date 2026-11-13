import mongoose from 'mongoose';

export const generateSKU = async (model, prefix = 'PRD') => {
  const count = await model.countDocuments();
  const timestamp = Date.now().toString(36).toUpperCase();
  const sequence = (count + 1).toString().padStart(5, '0');
  return `${prefix}-${timestamp}-${sequence}`;
};

export const generateInvoiceNumber = async (model, prefix = 'INV') => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await model.countDocuments({
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    },
  });
  const sequence = (count + 1).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${sequence}`;
};

export const isValidObjectId = (id) => mongoose.isValidObjectId(id);
