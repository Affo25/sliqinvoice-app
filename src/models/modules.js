// models/Module.js

import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema(
  {
    module_id: { type: String, unique: true },
    name: { type: String, required: true },
    module_key: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    description: { type: String },
    created_time: { type: Date, default: Date.now },
    updated_time: { type: Date, default: Date.now }
  },
  { 
    timestamps: false // We're using custom timestamp fields
  }
);

// Auto-generate module_id and update timestamps before saving
ModuleSchema.pre('save', function(next) {
  this.updated_time = new Date();
  
  // Auto-generate module_id if not provided
  if (!this.module_id) {
    // Generate module_id based on module_key and timestamp
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const keyPrefix = this.module_key.toUpperCase().substring(0, 3); // First 3 chars of module_key
    this.module_id = `${keyPrefix}${timestamp}`;
  }
  
  next();
});

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema);
