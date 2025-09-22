import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '../types';

// Interface that extends the User type with Mongoose Document
export interface IUser extends Omit<UserType, 'id'>, Document {}

// User Schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    phone: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password; // Never return password in JSON
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);