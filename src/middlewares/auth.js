const httpStatus = require('http-status');
const jwt = require('jwt-simple');
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
    apiError.message = 'Malformed Token';
    return next(apiError);
  }
  if (!tokenResult || !tokenResult.exp || !tokenResult._id) {
    apiError.message = 'Malformed Token';

    await User.findOneAndUpdate(
      { 'sessions.access_token': authorization },
      { $pull: { sessions: { access_token: authorization } } }
    );

    return next(apiError);
  }

  if (!isRefresh && tokenResult.exp - DateTime.local().toSeconds() < 0) {
    apiError.message = 'Token Expired';

    await User.findOneAndUpdate(
      { 'sessions.access_token': authorization },
      { $pull: { sessions: { access_token: authorization } } }
    );

    return next(apiError);
  }

  const user = await User.findOne({
    'sessions.access_token': authorization
  }).lean();
  if (!user) {
    return next(apiError);
  }

  if (user.status === 'blocked') {
    return next(
      ApiError({
        message: `Your account has been suspended by admin. 
          Please contact us for more information.`,
        status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS
      })
    );
  }

  if (user.status === 'deleted') {
    return next(
      ApiError({
        message: 'You have deleted you account. Please signup again to continue',
        status: httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS
      })
    );
  }

  req.user = user;
  return next();
};

exports.authorize = (role = 'user', isRefresh = false) => {
  return (req, res, next) => {
    return authorize(req, res, next, role, isRefresh);
  };
};
