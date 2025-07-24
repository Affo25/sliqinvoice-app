// models/Module.js

import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String, required: true },
    link: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export default mongoose.models.Module || mongoose.model('module', ModuleSchema);
