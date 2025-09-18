import { Request, Response } from 'express';
import { mongoService } from '../models/mongoService';
import { AddToCartRequest, ApiResponse } from '../types';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItems = await mongoService.getCartByUserId(userId);
    
    res.json({
      success: true,
      data: cartItems,
      message: 'Cart retrieved successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity }: AddToCartRequest = req.body;
    const userId = req.user!.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and valid quantity are required'
      } as ApiResponse<null>);
    }

    // Check if product exists and has sufficient stock
    const product = await mongoService.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      } as ApiResponse<null>);
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stockQuantity}`
      } as ApiResponse<null>);
    }

    const cartItem = await mongoService.addToCart(userId, productId, quantity);
    
    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get cart item to verify ownership
    const cartItems = await mongoService.getCartByUserId(userId);
    const cartItem = cartItems.find(item => item.id === id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      } as ApiResponse<null>);
    }

    const success = await mongoService.removeFromCart(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      } as ApiResponse<null>);
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to remove item from cart'
      } as ApiResponse<null>);
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await mongoService.clearUserCart(userId);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};
