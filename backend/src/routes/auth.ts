import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Update current user profile
router.put('/profile', authenticateToken, updateProfile);

export default router;
