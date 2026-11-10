import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getCookieOptions } from '../utils/generateToken.js';
import * as authService from '../services/auth.service.js';

// ─────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const name = (req.body.name || req.body.fullName || '').trim();
  const { email, password } = req.body;

  const { user, token } = await authService.registerUser({ name, email, password });

  // Set HttpOnly cookie
  res.cookie('token', token, getCookieOptions());

  return new ApiResponse(201, { user, token }, 'Account created successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser({ email, password });

  // Set HttpOnly cookie
  res.cookie('token', token, getCookieOptions());

  return new ApiResponse(200, { user, token }, 'Logged in successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return new ApiResponse(200, null, 'Logged out successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return new ApiResponse(200, { user }, 'User fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/auth/profile
// ─────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const name = (req.body.name || req.body.fullName || '').trim();

  const user = await authService.updateProfile(req.user._id, { name });

  return new ApiResponse(200, { user }, 'Profile updated successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/auth/change-password
// ─────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(req.user._id, {
    currentPassword,
    newPassword,
  });

  return new ApiResponse(200, null, result.message).send(res);
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/forgot-password  (stub — no email service yet)
// ─────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (_req, res) => {
  return new ApiResponse(
    200,
    null,
    'If an account with that email exists, a password reset link has been sent.'
  ).send(res);
});

