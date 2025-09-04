import mongoose from 'mongoose';

// Accounts Schema
const AccountSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    cat_name: { 
      type: String, 
      required: true,
      trim: true
    },
    type: { 
      type: String, 
      required: true,
      enum: ['Income', 'Expense', 'Asset', 'Liability', 'Equity'],
      default: 'Expense'
    },
    description: { 
      type: String, 
      trim: true 
    },
    is_active: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Categories Schema
const CategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    is_active: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Transactions Schema
const TransactionSchema = new mongoose.Schema(
  {
    date: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    accountId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Account',
      required: true
    },
    debit: { 
      type: Number, 
      required: true,
      min: 0
    },
    credit: {
      type: Number, 
      required: true,
      min: 0
    },
    balance: { 
      type: Number, 
      required: true
    },
    note: { 
      type: String, 
      trim: true 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: false
    }
  },
  { timestamps: true }
);

// Create indexes for better performance
AccountSchema.index({ name: 1, type: 1 });
CategorySchema.index({ name: 1, parentId: 1 });
TransactionSchema.index({ accountId: 1, date: -1 });
TransactionSchema.index({ createdBy: 1, date: -1 });

// Export models
export const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);