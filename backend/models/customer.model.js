import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
    totalSpending: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phone: 'text' });
customerSchema.plugin(mongoosePaginate);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
