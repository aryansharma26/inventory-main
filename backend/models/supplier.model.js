import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
        'Please enter a valid email',
      ],
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 'text', company: 'text' });
supplierSchema.plugin(mongoosePaginate);

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
