const express = require('express');
const httpStatus = require('http-status');
const userRoutes = require('./user/routes');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => {
  return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'OK' });
});

/**
 * GET v1/user
 */
router.use('/user', userRoutes);

module.exports = router;
