const Joi = require('@hapi/joi');
const { userNameRegex } = require('../../../config/constants');

const headers = {
  headers: Joi.object({
    authorization: Joi.string().trim().required().label('Auth Token')
  }).options({ allowUnknown: true })
};

module.exports = {
  // POST /v1/user/register
  register: {
    body: Joi.object({
      firstName: Joi.string().trim().lowercase().min(3).max(16).required(),
      lastName: Joi.string().trim().lowercase().min(3).max(16).required(),
      email: Joi.string().email().lowercase().trim().required(),
      userName: Joi.string().trim().regex(userNameRegex).required(),
      password: Joi.string().min(8).max(16).required().trim()
    })
  },

  // Get /v1/user/email-verification
  verificationToken: { params: { token: Joi.string().required() } },

  // POST /v1/user/login
  login: {
    body: Joi.object({
      clientType: Joi.string()
        .valid('browser', 'ios', 'android')
        .lowercase()
        .trim()
        .optional(),
      deviceToken: Joi.string().optional().trim().default(''),
      userName: Joi.string().trim().regex(userNameRegex).required(),
      password: Joi.string().min(8).max(16).required().trim()
    })
  },

  // POST /v1/user/is-logged-in
  isLoggedIn: {
    ...headers
  },
  // Get /v1/user/refresh-token
  refreshToken: {
    ...headers,
    body: Joi.object({
      refreshToken: Joi.string().required().trim()
    })
  },

  // POST /v1/user/forgot-password
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().required().lowercase().trim()
    })
  },

  // POST /v1/user/reset-password
  resetPassword: {
    params: Joi.object({ token: Joi.string().required() }),
    body: Joi.object({
      password: Joi.string().required().min(8).trim().max(16)
    })
  },

  // POST /v1/user/change-password
  changePassword: {
    ...headers,
    body: Joi.object({
      oldPassword: Joi.string().required().trim().min(8).max(16),
      password: Joi.string().required().trim().min(8).max(16)
    })
  },

  // PUT /v1/user/edit-profile
  editProfile: {
    ...headers,
    body: Joi.object({
      firstName: Joi.string().trim().lowercase().min(3).max(16).required(),
      lastName: Joi.string().trim().lowercase().min(3).max(16).required()
    })
  },

  // GET /v1/user
  getProfile: {
    ...headers,
    params: Joi.object({
      userName: Joi.string().trim().regex(userNameRegex).required()
    })
  }
};
