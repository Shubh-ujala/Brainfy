import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * protect – Verifies JWT from Authorization header or cookie.
 * Attaches req.user (without password) if valid.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  // 1. Try Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fall back to HttpOnly cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid token. Please log in again.');
  }

  // Fetch user (no password field — select: false in schema)
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  // Attach to request
  req.user = user;
  next();
});

/**
 * restrictTo – Role-based authorization guard.
 * Usage: router.delete('/admin-route', protect, restrictTo('admin'), controller)
 */
export const restrictTo = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  };
