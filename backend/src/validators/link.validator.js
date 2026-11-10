import { body, query } from 'express-validator';

export const createLinkValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('platform')
    .optional()
    .isIn(['YouTube', 'Twitter/X', 'GitHub', 'LinkedIn', 'Medium', 'Website', 'Other'])
    .withMessage('Invalid platform value'),

  body('collection')
    .optional({ nullable: true })
    .custom((val) => val === null || val === 'none' || val === undefined || /^[a-fA-F0-9]{24}$/.test(val))
    .withMessage('Invalid collection ID'),

  body('collectionId')
    .optional({ nullable: true })
    .custom((val) => val === null || val === 'none' || val === undefined || /^[a-fA-F0-9]{24}$/.test(val))
    .withMessage('Invalid collection ID'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
];

export const updateLinkValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('platform')
    .optional()
    .isIn(['YouTube', 'Twitter/X', 'GitHub', 'LinkedIn', 'Medium', 'Website', 'Other'])
    .withMessage('Invalid platform value'),

  body('collection')
    .optional({ nullable: true })
    .custom((val) => val === null || val === 'none' || val === undefined || /^[a-fA-F0-9]{24}$/.test(val))
    .withMessage('Invalid collection ID'),

  body('collectionId')
    .optional({ nullable: true })
    .custom((val) => val === null || val === 'none' || val === undefined || /^[a-fA-F0-9]{24}$/.test(val))
    .withMessage('Invalid collection ID'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),
];

export const getLinkQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('platform')
    .optional()
    .isIn(['YouTube', 'Twitter/X', 'GitHub', 'LinkedIn', 'Medium', 'Website', 'Other'])
    .withMessage('Invalid platform filter'),

  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'title_asc', 'title_desc'])
    .withMessage('Invalid sort option'),
];

