import { Router } from 'express';
import { 
  getCart, 
  addToCart, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:id', removeFromCart);
router.delete('/clear', clearCart);

export default router;
