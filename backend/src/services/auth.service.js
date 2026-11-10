import User from '../models/User.js';
import Link from '../models/Link.js';
import Collection from '../models/Collection.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Maps a User document to a safe response object.
 * Adds fullName alias because the frontend expects `fullName`.
 */
const toUserResponse = (user) => {
  const obj = user.toJSON(); // password is stripped by schema transform
  return {
    ...obj,
    fullName: obj.name, // frontend compatibility
  };
};

// ─────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);

  return { user: toUserResponse(user), token };
};

// ─────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // Must select password explicitly (select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password))) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = generateToken(user._id, user.role);

  return { user: toUserResponse(user), token };
};

// ─────────────────────────────────────────────────────────
// Get Current User
// ─────────────────────────────────────────────────────────
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found.');

  return toUserResponse(user);
};

// ─────────────────────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────────────────────
export const updateProfile = async (userId, { name }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true, runValidators: true }
  );

  if (!user) throw ApiError.notFound('User not found.');

  return toUserResponse(user);
};

// ─────────────────────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────────────────────
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found.');

  const isMatch = await user.isPasswordMatch(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  user.password = newPassword; // pre-save hook hashes it
  await user.save();

  return { message: 'Password updated successfully.' };
};

// ─────────────────────────────────────────────────────────
// Delete Account
// ─────────────────────────────────────────────────────────
export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found.');

  // Cleanup all user data
  await Promise.all([
    Link.deleteMany({ user: userId }),
    Collection.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId),
  ]);

  return { message: 'Account deleted successfully.' };
};

