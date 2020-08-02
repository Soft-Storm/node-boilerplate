require('dotenv').config();

module.exports = {
  JWT: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpirationInterval: process.env.JWT_EXPIRATION_INTERVAL
  },
  DB: {
    mongoURI:
      `mongodb://${process.env.MONGO_USER}:` +
      `${process.env.MONGO_USER_SECRET}@${process.env.MONGO_HOST}:` +
      `${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
  },
  SECURITY: {
    whitelist: process.env.WHITE_LIST,
    ddosConfig: {
      limit: process.env.DDOS_CONFIG_LIMIT,
      burst: process.env.DDOS_CONFIG_BURST
    }
  },
  SERVER: {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    baseUrl: `${process.env.BASE_URL}:${process.env.PORT}`,
    website: process.env.WEBSITE,
    logsConfig: {
      date: true,
      url: true,
      method: true,
      headers: true,
      pathParam: true,
      bodyParam: true,
      queryParam: true
    }
  },
  EMAILS: {
    'api-key': process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM_EMAIL
  },
  BOOTSTRAP: {
    email: process.env.BOOTSTRAP_EMAIL,
    first_name: process.env.BOOTSTRAP_FNAME,
    last_name: process.env.BOOTSTRAP_LNAME,
    password: process.env.BOOTSTRAP_PWD,
    user_name: process.env.BOOTSTRAP_UNAME
  }
};
