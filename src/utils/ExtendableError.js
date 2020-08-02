/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor({ message, errors, status, isPublic, stack }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    // This is required since bluebird 4 doesn't append it anymore.
    this.isOperational = true;
    this.stack = stack;
  }
}

exports.ExtendableError = ExtendableError;
