import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after express-validator chains.
 * If validation errors exist, throws a 400 BadRequest with structured errors.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw ApiError.badRequest('Validation failed', formattedErrors);
  }

  next();
};

/**
 * Validates that a route param is a valid MongoDB ObjectId.
 * Usage: router.get('/:id', validateObjectId('id'), controller)
 */
export const validateObjectId = (paramName = 'id') => (req, _res, next) => {
  const id = req.params[paramName];
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    throw ApiError.badRequest(`Invalid ${paramName}: must be a valid MongoDB ObjectId`);
  }
  next();
};

export default validate;

