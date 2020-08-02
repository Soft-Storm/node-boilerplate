const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const { ExtendableError } = require('../utils/ExtendableError');
const { SERVER } = require('../config');

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
// eslint-disable-next-line no-unused-vars
const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    errors: err.errors,
    message: err.message || httpStatus[err.status],
    stack: err.stack
  };

  if (SERVER.env !== 'development') {
    delete response.stack;
  }
  if (err.status) {
    res.status(err.status);
  } else {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
  }
  res.json(response);
};

exports.handler = handler;

/**
 * If error is not an instanceOf {ExtendableError}, convert it.
 * @public
 */
// eslint-disable-next-line no-unused-vars
exports.converter = (err, req, res, next) => {
  let convertedError = err;
  if (
    !(err instanceof ExtendableError) &&
    !(err instanceof expressValidation.ValidationError)
  ) {
    return next(err);
  } // ! Go crash
  if (err instanceof expressValidation.ValidationError) {
    const { details: message } = err;
    convertedError = new ExtendableError({
      message,
      stack: err.stack,
      errors: err.errors,
      status: httpStatus.BAD_REQUEST
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res) => {
  const err = new ExtendableError({
    message: 'Not Found',
    status: httpStatus.NOT_FOUND
  });

  return handler(err, req, res);
};
