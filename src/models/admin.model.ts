import mongoose, { Document, Schema } from "mongoose";

export interface IAdminActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  ip: string;
  timestamp: Date;
}

export interface IAdminSettings extends Document {
  setting: string;
  value: string;
  description: string;
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId;
}

// Schema for admin activities
const AdminActivitySchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: ['create', 'update', 'delete', 'view', 'login', 'logout', 'other']
  },
  details: { 
    type: String, 
    required: true 
  },
  resourceType: { 
    type: String, 
    required: true,
    enum: ['user', 'course', 'setting', 'other']
  },
  resourceId: { 
    type: Schema.Types.ObjectId, 
    required: false 
  },
  ip: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Schema for admin settings
const AdminSettingsSchema: Schema = new Schema({
  setting: { 
    type: String, 
    required: true,
    unique: true
  },
  value: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
});

export const AdminActivity = mongoose.model<IAdminActivity>("AdminActivity", AdminActivitySchema);
export const AdminSettings = mongoose.model<IAdminSettings>("AdminSettings", AdminSettingsSchema); 