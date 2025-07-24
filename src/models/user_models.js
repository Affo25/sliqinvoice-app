import mongoose from 'mongoose';



const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: false
    },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: {
      type: String,
      enum: ['superAdmin', 'moderator', 'customers', 'customerUsers'],
      required: true,
    },
    permissions: {
      type: [String], 
      default: [],
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
