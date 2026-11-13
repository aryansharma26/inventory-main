import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'split'],
      default: 'cash',
    },
    paymentDetails: {
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      upi: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'refunded', 'partial'],
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

saleSchema.index({ customer: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ createdAt: -1 });

saleSchema.plugin(mongoosePaginate);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
