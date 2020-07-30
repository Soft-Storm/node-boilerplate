const mongoose = require('mongoose');

const capitalizeFirstLetter = (val) => {
  return val.charAt(0).toUpperCase() + val.toLowerCase().slice(1);
};
const capitalizeEachLetter = (val) => {
  val.replace(/(?:^|\s|["'([{])+\S/g, (match) => {
    match.toUpperCase();
  });
};

exports.generateRandom = (length = 32, alphanumeric = true) => {
  let data = '';

  let keys = '';

  if (alphanumeric) {
    keys = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  } else {
    keys = '0123456789';
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    data += keys.charAt(Math.floor(Math.random() * keys.length));
  }

  return data;
};

const toCamel = (string) => {
  return string.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const isObject = (args) => {
  return args === Object(args) && !Array.isArray(args) && typeof args !== 'function';
};

const keysToCamel = (args) => {
  if (isObject(args)) {
    const n = {};

    Object.keys(args).forEach((k) => {
      if (mongoose.Types.ObjectId.isValid(args[k])) {
        if (k.toLowerCase() === '_id') {
          n[k] = args[k];
        } else {
          n[toCamel(k)] = args[k];
        }
      } else {
        n[toCamel(k)] = keysToCamel(args[k]);
      }
    });

    return n;
  }
  if (Array.isArray(args)) {
    return args.map((i) => {
      return keysToCamel(i);
    });
  }

  return args;
};

exports.keysToCamel = keysToCamel;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.capitalizeEachLetter = capitalizeEachLetter;
