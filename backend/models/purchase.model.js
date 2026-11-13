import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const purchaseItemSchema = new mongoose.Schema({
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
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
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
  batchNumber: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    items: [purchaseItemSchema],
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
    status: {
      type: String,
      enum: ['pending', 'received', 'partial', 'returned', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'overdue'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    receivedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

purchaseSchema.plugin(mongoosePaginate);

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
