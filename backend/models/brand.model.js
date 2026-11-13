import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

brandSchema.plugin(mongoosePaginate);

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
