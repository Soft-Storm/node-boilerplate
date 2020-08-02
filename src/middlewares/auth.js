const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const User = require('../api/v1/user/model');
const { ApiError } = require('../utils/ApiError');
const { JWT } = require('../config');

const authorize = async (req, res, next, role, isRefresh) => {
  const { authorization } = req.headers;

  const apiError = new ApiError({
    message: 'Unauthorized',
    status: httpStatus.UNAUTHORIZED
  });

  if (!authorization) {
    return next(apiError);
  }
  let tokenResult = '';
  try {
    tokenResult = jwt.decode(authorization, JWT.jwtSecret);
  } catch (e) {
    apiError.message = 'Malformed token';
    return next(apiError);
  }
  if (!tokenResult || !tokenResult.exp || !tokenResult._id) {
    apiError.message = 'Malformed token';

    await User.findOneAndUpdate(
      { 'sessions.access_token': authorization },
      { $pull: { sessions: { access_token: authorization } } }
    );

    return next(apiError);
  }

  if (!isRefresh && tokenResult.exp - DateTime.local().toSeconds() < 0) {
    apiError.message = 'Token expired';
    return next(apiError);
  }

  const user = await User.findOne({
    'sessions.access_token': authorization
  }).lean();
  if (!user) {
    return next(apiError);
  }

  req.user = user;
  return next();
};

exports.authorize = (role = 'user', isRefresh = false) => {
  return (req, res, next) => {
    return authorize(req, res, next, role, isRefresh);
  };
};
