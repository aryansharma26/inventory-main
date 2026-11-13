import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'adjustment', 'return', 'transfer', 'damage'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['Purchase', 'Sale'],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

stockHistorySchema.index({ product: 1, createdAt: -1 });
stockHistorySchema.index({ type: 1 });

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);
export default StockHistory;
