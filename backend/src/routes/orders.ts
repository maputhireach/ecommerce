import { Router } from 'express';
import { 
  createOrder, 
  getUserOrders, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Protected routes (authenticated users)
router.post('/', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, getUserOrders);

// Admin only routes
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;
