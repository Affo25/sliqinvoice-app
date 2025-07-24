import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true },
    contact_email: { type: String, required: true, unique: true },
    contact_phone: { type: String },
    password: { type: String, required: true },
    address: { type: String },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    subscription_status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
    },
    permissions: {
      type: [String], // Array of string-based permissions
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
