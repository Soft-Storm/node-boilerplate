const userNameRegex = /^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
exports.userNameRegex = userNameRegex;
