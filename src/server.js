const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const Ddos = require('ddos');
const ExpressLogs = require('express-server-logs');
const httpStatus = require('http-status');
const routes = require('./api/v1/router');
const error = require('./middlewares/error');
const { SECURITY } = require('./config');

const ddosInstance = new Ddos(SECURITY.ddosConfig);

const corsOptions = {
  exposedHeaders: 'authorization, x-refresh-token, x-token-expiry-time',
  origin: (origin, callback) => {
    if (!SECURITY.whitelist || SECURITY.whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const server = express();
const xlogs = new ExpressLogs(false);

// npm module for preventing ddos attack. See more https://www.npmjs.com/package/ddos
server.use(ddosInstance.express);

// parse body params and attache them to req.body
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(xlogs.logger);

// gzip compression
server.use(compress());

// secure servers by setting various HTTP headers
server.use(helmet());

// enable CORS - Cross Origin Resource Sharing
server.use(cors(corsOptions));

// mount api v1 routes
server.use('/v1', routes);

// if error is not an instanceOf APIError, convert it.
server.use(error.converter);

// catch 404 and forward to error handler
server.use(error.notFound);

process.on('unhandledRejection', (reason) => {
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason;
});
// eslint-disable-next-line no-unused-vars
server.use((err, _req, res, _next) => {
  console.log(err);
  console.error(`uncaughtException error: ${err}`);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    code: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error.'
  });
  process.exit(1);
});

module.exports = server;
