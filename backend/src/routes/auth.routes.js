import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
} from '../controllers/auth.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js';

const router = Router();

// ─── Rate Limiters ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many failed attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Routes ──────────────────────────────────────
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.post('/forgot-password', strictLimiter, forgotPassword);

// ─── Protected Routes ───────────────────────────────────
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfileValidator, validate, updateProfile);
router.patch('/change-password', protect, changePasswordValidator, validate, changePassword);

export default router;

