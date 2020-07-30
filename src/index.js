// eslint-disable-next-line no-global-assign
Promise = require('bluebird');
const { SERVER } = require('./config');

const server = require('./server');
const database = require('./database');
const scheduler = require('./scheduler');
// //const { createAdmin } = require('./bootstrap');

database.connect();

server.listen(SERVER.port, () => {
  scheduler(server);
  console.info(`Server started on port ${SERVER.port} (${SERVER.env})`);

  // //  createAdmin();
});
const src = server;

module.exports = src;
