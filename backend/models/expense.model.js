import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['rent', 'electricity', 'salary', 'internet', 'transport', 'miscellaneous'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

expenseSchema.index({ category: 1, date: -1 });
expenseSchema.plugin(mongoosePaginate);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
