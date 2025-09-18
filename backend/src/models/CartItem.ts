import mongoose, { Schema, Document } from 'mongoose';
import { CartItem as CartItemType } from '../types';

// Interface that extends the CartItem type with Mongoose Document
export interface ICartItem extends Omit<CartItemType, 'id' | 'userId' | 'productId'>, Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
}

// CartItem Schema
const cartItemSchema = new Schema<ICartItem>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  product: {
    type: mongoose.Schema.Types.Mixed, // Store product snapshot
    required: true
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better performance
cartItemSchema.index({ userId: 1 });
cartItemSchema.index({ productId: 1 });
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true }); // Prevent duplicate items

export const CartItemModel = mongoose.model<ICartItem>('CartItem', cartItemSchema);