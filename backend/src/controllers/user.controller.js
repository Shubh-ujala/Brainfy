import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';

// ─────────────────────────────────────────────────────────
// GET /api/users/me
// ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return new ApiResponse(200, { user }, 'Profile fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/users/me
// ─────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const name = (req.body.name || req.body.fullName || '').trim();

  const user = await authService.updateProfile(req.user._id, { name });

  return new ApiResponse(200, { user }, 'Profile updated successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/users/change-password
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
// DELETE /api/users/me
// ─────────────────────────────────────────────────────────
export const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user._id);

  // Clear auth cookie on account deletion
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  return new ApiResponse(200, null, 'Account deleted successfully.').send(res);
});

