import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),

  // Custom validator to ensure either 'name' or 'fullName' is provided
  body().custom((_, { req }) => {
    const displayName = (req.body.name || req.body.fullName || '').trim();
    if (!displayName) {
      throw new Error('Name or full name is required');
    }
    if (displayName.length < 2 || displayName.length > 50) {
      throw new Error('Name must be between 2 and 50 characters');
    }
    return true;
  }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

export const updateProfileValidator = [
  body().custom((_, { req }) => {
    const displayName = req.body.name || req.body.fullName;
    if (displayName !== undefined) {
      const trimmed = String(displayName).trim();
      if (!trimmed) {
        throw new Error('Name cannot be empty');
      }
      if (trimmed.length < 2 || trimmed.length > 50) {
        throw new Error('Name must be between 2 and 50 characters');
      }
    }
    return true;
  }),
];

