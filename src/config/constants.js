const userNameRegex = /^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
const validateConfig = { keyByField: true };

exports.userNameRegex = userNameRegex;
exports.validateConfig = validateConfig;
