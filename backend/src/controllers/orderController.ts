import { Request, Response } from 'express';
import { mongoService } from '../models/mongoService';
import { CreateOrderRequest, ApiResponse, OrderStatus } from '../types';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress }: CreateOrderRequest = req.body;
    const userId = req.user!.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      } as ApiResponse<null>);
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await mongoService.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} not found`
        } as ApiResponse<null>);
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        } as ApiResponse<null>);
      }

      totalAmount += product.priceUsd * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.priceUsd,
        product
      });
    }

    // Create order
    const order = await mongoService.createOrder({
      userId,
      status: OrderStatus.PENDING,
      totalAmount,
      items: orderItems.map(item => ({
        ...item,
        id: '', // This will be set by the store
        orderId: '' // This will be set by the store
      })),
      shippingAddress
    });

    // Update stock quantities
    for (const item of items) {
      const success = await mongoService.updateProductStock(item.productId, item.quantity);
      if (!success) {
        console.error(`Failed to update stock for product ${item.productId}`);
      }
    }

    // Clear user's cart after successful order
    await mongoService.clearUserCart(userId);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const orders = await mongoService.getOrdersByUserId(userId);
    
    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      } as ApiResponse<null>);
    }

    const updatedOrder = await mongoService.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};
