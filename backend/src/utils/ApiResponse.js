/**
 * Standardized successful API response wrapper.
 * Flexible constructor supporting both:
 *   - new ApiResponse(statusCode, data, message, pagination)
 *   - new ApiResponse(statusCode, message, data, pagination)
 */
class ApiResponse {
  constructor(statusCode, arg2 = {}, arg3 = 'Success', pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;

    if (typeof arg2 === 'string') {
      // Called as (statusCode, message, data, pagination)
      this.message = arg2;
      this.data = typeof arg3 === 'object' ? arg3 : {};
    } else {
      // Called as (statusCode, data, message, pagination)
      this.data = arg2;
      this.message = typeof arg3 === 'string' ? arg3 : 'Success';
    }

    if (pagination) {
      this.pagination = pagination;
    }
  }

  /**
   * Send JSON response directly via Express response object.
   * @param {import('express').Response} res
   */
  send(res) {
    const payload = {
      success: this.success,
      message: this.message,
      data: this.data,
    };
    if (this.pagination) {
      payload.pagination = this.pagination;
    }
    // Surface convenient top-level aliases so frontends checking res.data.links or res.data.collections succeed
    if (this.data && typeof this.data === 'object' && !Array.isArray(this.data)) {
      if (this.data.links !== undefined) payload.links = this.data.links;
      if (this.data.collections !== undefined) payload.collections = this.data.collections;
      if (this.data.link !== undefined) payload.link = this.data.link;
      if (this.data.collection !== undefined) payload.collection = this.data.collection;
      if (this.data.user !== undefined) payload.user = this.data.user;
      if (this.data.token !== undefined) payload.token = this.data.token;
    }
    return res.status(this.statusCode).json(payload);
  }
}

export default ApiResponse;

