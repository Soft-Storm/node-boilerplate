const httpStatus = require('http-status');
const { ExtendableError } = require('./ExtendableError');

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class ApiError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor({
    message,
    errors,
    stack,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false
  }) {
    super({
      errors,
      isPublic,
      message,
      stack,
      status
    });
  }
}

exports.ApiError = ApiError;
