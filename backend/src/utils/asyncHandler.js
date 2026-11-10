/**
 * Wraps asynchronous route handlers and middleware to catch errors
 * and forward them to the Express centralized error handler.
 *
 * @param {Function} requestHandler - Asynchronous Express route handler (req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

