import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'piece',
      enum: ['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'set', 'pair', 'meter', 'foot'],
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: 0,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
      default: 0,
    },
    mrp: {
      type: Number,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
      default: 0,
    },
    minStockAlert: {
      type: Number,
      min: 0,
      default: 10,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    image: {
      url: String,
      publicId: String,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },
    expiryDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ quantity: 1 });

productSchema.plugin(mongoosePaginate);

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStockAlert) return 'low-stock';
  return 'in-stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
