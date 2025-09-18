import { Request, Response } from 'express';
import { mongoService } from '../models/mongoService';
import { CreateProductRequest, UpdateProductRequest, ApiResponse } from '../types';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await mongoService.getAllProducts();
    
    res.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await mongoService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: CreateProductRequest = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.priceUsd || !productData.stockQuantity) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and stock quantity are required'
      } as ApiResponse<null>);
    }
    
    const product = await mongoService.createProduct({
      ...productData,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateProductRequest = req.body;
    
    const updatedProduct = await mongoService.updateProduct(id, updates);
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting isActive to false
    const updatedProduct = await mongoService.updateProduct(id, { isActive: false });
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};
