import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mongoService } from '../models/mongoService';
import { config } from '../config';
import { UserLoginRequest, UserRegisterRequest, ApiResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName }: UserRegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await mongoService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      } as ApiResponse<null>);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    // Create user
    const user = await mongoService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isAdmin: false
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: UserLoginRequest = req.body;

    // Find user by email
    const user = await mongoService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<null>);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse<null>);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};
