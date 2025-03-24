import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { registerValidation, loginValidation } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

export default router; 