/* eslint-disable max-lines */
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { DateTime } = require('luxon');
const { v4 } = require('uuid');
const User = require('./model');
const { ApiError } = require('../../../utils/ApiError');
const { SERVER } = require('../../../config');
const { JWT } = require('../../../config');
const { generateRandom } = require('../../../utils/methods');
const {
  sendEmail,
  verifyAccountTemplate,
  resetPasswordTemplate
} = require('../../../utils/mail-services');

/**
 * @async
 * Returns a formated object with tokens
 * @param {object} user object
 * @returns {object} access token object
 * @private
 */

async function generateTokenResponse(user) {
  const refreshToken = v4() + user._id;
  const accessToken = user.token();
  // eslint-disable-next-line no-param-reassign
  user.sessions = [
    ...user.sessions,
    {
      refresh_token: refreshToken,
      access_token: accessToken,
      created_at: DateTime.local().toSeconds()
    }
  ];
  user.save();

  const expiresIn = DateTime.local()
    .plus({ seconds: JWT.jwtExpirationInterval })
    .toSeconds();

  return { accessToken, expiresIn, refreshToken };
}

/**
 * Creates a new user if valid details
 * @public
 */

// eslint-disable-next-line consistent-return
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, userName, password } = req.body;

    const isEmailExists = await User.findOne({ email }, { _id: 0 });

    if (isEmailExists) {
      throw new ApiError({
        message: 'Email address already exists',
        status: httpStatus.CONFLICT
      });
    }

    const isUserNameExists = await User.findOne({ user_name: userName }, { _id: 0 });

    if (isUserNameExists) {
      throw new ApiError({
        message: 'Username already exists',
        status: httpStatus.CONFLICT
      });
    }
    const token = generateRandom();

    await new User({
      email,
      first_name: firstName,
      last_name: lastName,
      user_name: userName,
      password,
      'verify_tokens.email': token
    }).save();

    const msg = verifyAccountTemplate(firstName, lastName, email, token);

    res.status(httpStatus.CREATED).json();
    sendEmail(msg);
  } catch (error) {
    return next(error);
  }
};

/**
 * Email Verification
 * @private
 */
exports.emailVerification = async (req, res, next) => {
  try {
    const {
      params: { token }
    } = req;
    const query = { 'verify_tokens.email': token };

    const user = await User.findOne(query);
    if (!user) {
      throw new ApiError({
        message: 'Not an authorized user',
        status: httpStatus.UNAUTHORIZED
      });
    }
    const update = { is_verified: true, 'verify_tokens.email': '' };
    await User.updateOne(query, update);
    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Login with an existing user
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne(
      { user_name: userName },
      {
        _id: 1,
        email: 1,
        user_name: 1,
        first_name: 1,
        is_verified: 1,
        last_name: 1,
        sessions: 1,
        password: 1
      }
    );
    if (!user) {
      throw new ApiError({
        message: 'Credentials did not match',
        status: httpStatus.CONFLICT
      });
    }
    const passwordMatches = await user.passwordMatches(password);

    if (!passwordMatches) {
      throw new ApiError({
        message: 'Credentials did not match',
        status: httpStatus.CONFLICT
      });
    }

    if (!user.is_verified) {
      throw new ApiError({
        message:
          'Your email address is not verified. Please verify your email to continue',
        status: httpStatus.NOT_ACCEPTABLE
      });
    }

    const token = await generateTokenResponse(user);

    res.set('authorization', token.accessToken);
    res.set('x-refresh-token', token.refreshToken);
    res.set('x-token-expiry-time', token.expiresIn);
    res.status(httpStatus.OK);

    return res.json({
      email: user.email,
      userName: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Checks if user is loggedin
 * @public
 */
exports.isLoggedIn = async (req, res) => {
  return res.status(httpStatus.OK).json();
};

/**
 * Refresh token function to get new access token
 * @public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      sessions: { $elemMatch: { refresh_token: refreshToken } }
    });

    if (!user) {
      throw new ApiError({
        message: 'Refresh token did not match',
        status: httpStatus.CONFLICT
      });
    }
    const refreshTokenKey = v4() + user._id;
    const accessTokenKey = user.token();
    await User.updateOne(
      { _id: user._id, 'sessions.refresh_token': refreshToken },
      {
        'sessions.$.access_token': accessTokenKey,
        'sessions.$.refresh_token': refreshTokenKey,
        'sessions.$.updated_at': DateTime.local().toSeconds()
      }
    );

    const expiresIn = DateTime.local()
      .plus({ seconds: JWT.jwtExpirationInterval })
      .toSeconds();

    res.set('authorization', accessTokenKey);
    res.set('x-refresh-token', refreshTokenKey);
    res.set('x-token-expiry-time', expiresIn);
    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Logout
 * @public
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      sessions: { $elemMatch: { refresh_token: refreshToken } }
    });

    if (!user) {
      throw new ApiError({
        message: 'Refresh token did not match',
        status: httpStatus.CONFLICT
      });
    }

    await User.updateOne(
      { _id: user._id, 'sessions.refresh_token': refreshToken },
      { $pull: { sessions: { refresh_token: refreshToken } } }
    );

    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Forgot Password
 * @public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const {
      body: { email }
    } = req;
    const query = { email };

    const user = await User.findOne(query, { _id: 0 });

    if (!user) {
      throw new ApiError({
        message: 'Please enter your registered email address',
        status: httpStatus.BAD_REQUEST
      });
    }
    const token = generateRandom();

    await User.updateOne(query, { 'verify_tokens.reset_password': token });
    const msg = resetPasswordTemplate(user.firstName, user.lastName, email, token);

    sendEmail(msg);

    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset Password
 * @public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const {
      body: { password },
      params: { token }
    } = req;
    const query = { 'verify_tokens.reset_password': token };
    const user = await User.findOne(query);

    if (!user) {
      throw new ApiError({
        message: 'Not an authorized user',
        status: httpStatus.UNAUTHORIZED
      });
    }

    const isPasswordMatches = await user.passwordMatches(password);

    if (isPasswordMatches) {
      throw new ApiError({
        message: 'New password can not same as old password',
        status: httpStatus.CONFLICT
      });
    }

    const rounds = SERVER.env === 'test' ? 1 : 10;
    const hash = await bcrypt.hash(password, rounds);

    await User.updateOne(
      { _id: user._id },
      {
        password: hash,
        'verify_tokens.reset_password': ''
      }
    );
    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Change Password
 * @public
 */
exports.changePassword = async (req, res, next) => {
  try {
    const {
      body: { password, oldPassword },
      user: { _id: userId }
    } = req;

    const query = { _id: userId };
    const user = await User.findOne(query);
    const isPasswordMatches = await user.passwordMatches(oldPassword);
    const isSamePassword = await user.passwordMatches(password);

    if (!isPasswordMatches) {
      throw new ApiError({
        message: 'Old password does not matched',
        status: httpStatus.CONFLICT
      });
    }

    if (isSamePassword) {
      throw new ApiError({
        message: 'New password can not same as old password',
        status: httpStatus.CONFLICT
      });
    }

    const rounds = SERVER.env === 'test' ? 1 : 10;
    const hash = await bcrypt.hash(password, rounds);

    await User.updateOne({ _id: user._id }, { password: hash });

    return res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    return next(error);
  }
};

/**
 * Edit Profile
 * @public
 */

exports.editProfile = async (req, res, next) => {
  try {
    const {
      body: { firstName, lastName },
      user: { _id: userId }
    } = req;

    const updateFields = { first_name: firstName, last_name: lastName };
    const user = await User.findByIdAndUpdate(userId, updateFields, {
      returnOriginal: false
    });
    return res.status(httpStatus.OK).json({
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET Profile
 * @public
 */

exports.getProfile = async (req, res, next) => {
  try {
    const {
      params: { userName }
    } = req;
    const user = await User.findOne(
      {
        $and: [{ user_name: userName }, { role: { $ne: 'admin' } }, { is_verified: true }]
      },
      { _id: 0, email: 1, user_name: 1, first_name: 1, last_name: 1 }
    );
    if (!user) {
      throw new ApiError({ message: 'User not found', status: httpStatus.BAD_REQUEST });
    }
    return res.status(httpStatus.OK).json({
      email: user.email,
      userName: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    return next(error);
  }
};
