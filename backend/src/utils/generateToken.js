import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token (JWT) for a user.
 *
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} role - User role (e.g. 'user', 'admin')
 * @returns {string} Signed JWT string
 */
export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'brainfy_super_secure_jwt_secret_key_2026_xyz',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

/**
 * Standard cookie configuration options for JWT session cookies.
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
});

