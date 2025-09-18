import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: '24h',
  
  // CORS configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  
  // Security
  bcryptRounds: 12,
} as const;
