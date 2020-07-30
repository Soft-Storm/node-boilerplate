const express = require('express');
const { validate } = require('express-validation');
const controller = require('./controller');
const {
  register,
  login,
  isLoggedIn,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  editProfile,
  getProfile
} = require('./validation');
const { authorize } = require('../../../middlewares/auth');

const routes = express.Router();

/**
 * @api {post} v1/user/register Register user
 * @apiDescription Register a user account
 * @apiVersion 1.0.0
 * @apiName registerUser
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  firstName   First name
 * @apiParam  {String}  lastName    Last name
 * @apiParam  {String}  email       Email
 * @apiParam  {String}  userName    user_name
 * @apiParam  {String}  password    Password
 *
 * @apiSuccess {CREATED 201} User created, now need to be verified
 *
 * @apiError (Bad Request 400) ValidationError Some parameters may contain invalid values
 * @apiError (Conflict 409)    ValidationError  Email address is already exists
 * @apiError (Conflict 409)    ValidationError  Username address is already exists
 */

routes.route('/register').post(validate(register), controller.register);

/**
 * @api {get} v1/user/email-verification Email Verification
 * @apiDescription User's Email verification
 * @apiVersion 1.0.0
 * @apiName emailVerification
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  token  Email Verification token
 * @apiError (Conflict 409)  ValidationError  Token expires
 * @apiSuccess (No Content 204) No Content Redirected to landing page.
 */

routes.route('/email-verification/:token').get(controller.emailVerification);

/**
 * @api {post} v1/user/login Login user
 * @apiDescription Login a account
 * @apiVersion 1.0.0
 * @apiName loginUser
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  userName       userName
 * @apiParam  {String}  password    Password
 * @apiParam  {String=ios,android,browser}  [clientType]  Client Type
 * @apiParam  {String}  [deviceToken] Device Token
 *
 * @apiSuccess {Object}  token Access Token's object
 *                                    {accessToken: String,
 *                                    refreshToken: String,
 *                                    expiresIn: Number}
 * @apiSuccess {Object}  user      User detail object
 *                                 {_id:String,
 *                                  firstName:String,
 *                                  lastName:String,
 *                                  email: String,
 *                                  userName: String  }
 *
 * @apiError (Bad Request 400) ValidationError Some parameters may contain invalid values
 * @apiError (Conflict 409)     ValidationError  Credentials did not match
 */

routes.route('/login').post(validate(login), controller.login);

/**
 * @api {post} v1/user/is-logged-in Login user
 * @apiDescription Verify if user logged in a account
 * @apiVersion 1.0.0
 * @apiName loginUser
 * @apiGroup User
 * @apiPermission public
 *
 * @apiHeader {String} Authorization Authorization token
 *
 * @apiSuccess {Object}  token Access Token's object
 *                                    {accessToken: String,
 *                                    refreshToken: String,
 *                                    expiresIn: Number}
 * @apiSuccess {ON 200}  user with provided token is logged in
 *
 * @apiError (Bad Request 400) ValidationError Some parameters may contain invalid values
 * @apiError (Conflict 409)     ValidationError  Credentials did not match
 */
routes
  .route('/is-logged-in')
  .get(validate(isLoggedIn), authorize(), controller.isLoggedIn);

/**
 * @api {put} v1/user/refresh-token Refresh token
 * @apiDescription Get new access token
 * @apiVersion 1.0.0
 * @apiName refreshToken
 * @apiGroup User
 * @apiPermission public
 *
 * @apiHeader {String} Authorization Authorization token
 * @apiParam  {String}  refreshToken  Refresh token
 * @apiSuccess {Object}  token  Access Token's object
 *                              {accessToken: String,
 *                              refreshToken: String,
 *                              expiresIn: Number}
 * @apiError (Bad Request 400) ValidationError Some parameters may contain invalid values
 * @apiError (Conflict 409)  ValidationError  Refresh token did not match
 */

routes
  .route('/refresh-token')
  .put(validate(refreshToken), authorize('user', false), controller.refreshToken);

/**
 * @api {put} v1/user/logout Logout user
 * @apiDescription Logout from a account
 * @apiVersion 1.0.0
 * @apiName logoutUser
 * @apiGroup User
 * @apiPermission private
 *
 * @apiParam  {String}  refreshToken  Refresh token
 * @apiHeader {String} Authorization Authorization token
 * @apiSuccess (No Content 204)   User logged out successfully
 * @apiError (Conflict 409)  ValidationError  Refresh token did not match
 */

routes.route('/logout').put(validate(refreshToken), authorize(), controller.logout);

/**
 * @api {POST} v1/user/forgot-password Forgot Password
 * @apiDescription Request reset password
 * @apiVersion 1.0.0
 * @apiName Forgot Password
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String}  email  Registered email
 * @apiError (Conflict 409)  ValidationError  Email not found
 * @apiSuccess (No Content 204) No Content Redirected to landing page.
 */

routes
  .route('/forgot-password')
  .post(validate(forgotPassword), controller.forgotPassword);

/**
 * @api {PUT} v1/user/reset-password Reset Password
 * @apiDescription User can reset password
 * @apiVersion 1.0.0
 * @apiName Reset Password
 * @apiGroup User
 * @apiPermission public
 *
 * @apiParam  {String} token     Access token
 * @apiParam  {String} password  New password for account
 * @apiError (Conflict 409)  ValidationError  Old password and New Password are same.
 * @apiSuccess (No Content 204) No Content
 */

routes
  .route('/reset-password/:token')
  .put(validate(resetPassword), controller.resetPassword);

/**
 * @api {PUT} v1/user/change-password Change Password
 * @apiDescription User can change password
 * @apiVersion 1.0.0
 * @apiName Change Password
 * @apiGroup User
 * @apiPermission public
 *
 * @apiHeader {String} Authorization Authorization token
 *
 * @apiParam  {String} password (minimum 8 , maximum 16)  New password for account
 * @apiParam  {String} oldPassword  (minimum 8 , maximum 16)  Old password for account
 * @apiError (Conflict 409)  ValidationError  Old password does not matched
 * @apiError (Conflict 409)  ValidationError  Old password and New Password are same.
 * @apiSuccess (No Content 204) No Content
 */

routes
  .route('/change-password')
  .put(validate(changePassword), authorize(), controller.changePassword);

/**
 * @api {PUT} v1/user/edit-profile Edit Profile
 * @apiDescription Update profile information
 * @apiVersion 1.0.0
 * @apiName Edit Profile
 * @apiGroup User
 * @apiPermission private
 *
 * @apiHeader {String} Authorization Authorization token
 *
 * @apiParam  {String} firstName First Name of user
 * @apiParam  {String} lastName Last Name of user
 * @apiError (Conflict 409)  ValidationError Invalid data
 * @apiSuccess (No Content 204) No Content
 */

routes
  .route('/edit-profile')
  .put(validate(editProfile), authorize(), controller.editProfile);

/**
 * @api {PUT} v1/user/edit-profile Edit Profile
 * @apiDescription Update profile information
 * @apiVersion 1.0.0
 * @apiName Edit Profile
 * @apiGroup User
 * @apiPermission private
 *
 * @apiHeader {String} Authorization Authorization token
 *
 * @apiParam  {String} userName userName of user
 * @apiError (Conflict 409)  ValidationError Invalid data
 * @apiSuccess (No Content 200) user with provided public data
 */

routes.route('/:userName').get(validate(getProfile), authorize(), controller.getProfile);
module.exports = routes;
