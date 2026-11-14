/**
 * Error type for expected, client-facing failures (validation, auth, not found).
 * Throw it from controllers; the error handler turns it into a JSON response.
 */
export default class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code to send.
   * @param {string} message Message safe to show to the client.
   * @param {Array<object>} [details] Optional field-level details.
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }
}
