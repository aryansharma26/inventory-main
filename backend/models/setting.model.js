import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'My Shop',
    },
    shopAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: String,
    email: String,
    logo: {
      url: String,
      publicId: String,
    },
    gstNumber: String,
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
    },
    invoiceNotes: {
      type: String,
      default: 'Thank you for your business!',
    },
    lowStockAlert: {
      type: Number,
      default: 10,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
