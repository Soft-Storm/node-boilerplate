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

/**
 * @function Api succes response
 * @param {string} typeOrMessage Can be "FETCH","UPDATE","DELETE" or any custom message
 * @param {any} data Any data type array, object etc.
 */
function success(typeOrMessage, data = null) {
  let message = '';

  switch (typeOrMessage) {
    case 'FETCH':
      message = 'Data fetched successfully';
      break;

    case 'UPDATE':
      message = 'Data updated successfully';
      break;

    case 'DELETE':
      message = 'Data deleted successfully';
      break;

    default:
      message = typeOrMessage;
      break;
  }

  return {
    data,
    message
  };
}

module.exports = {
  ExtendableError,
  success
};
