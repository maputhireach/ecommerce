import mongoose, { Schema, Document } from 'mongoose';
import { Order as OrderType, OrderItem as OrderItemType, OrderStatus } from '../types';

// Interface for OrderItem with Mongoose Document
export interface IOrderItem extends Omit<OrderItemType, 'id' | 'orderId'>, Document {
  orderId: mongoose.Types.ObjectId;
}

// Interface for Order with Mongoose Document
export interface IOrder extends Omit<OrderType, 'id' | 'userId' | 'items'>, Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
}

// OrderItem Schema (embedded in Order)
const orderItemSchema = new Schema({
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
  priceAtTime: {
    type: Number,
    required: true,
    min: 0
  },
  product: {
    type: mongoose.Schema.Types.Mixed, // Store product snapshot
    required: true
  }
}, { _id: true });

// Order Schema
const orderSchema = new Schema<IOrder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  items: [orderItemSchema]
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      // Transform items
      if (ret.items) {
        ret.items = ret.items.map((item: any) => ({
          ...item,
          id: item._id,
          orderId: ret.id
        }));
      }
      return ret;
    }
  }
});

// Indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);