'use strict';

const statusOptions = require('./lib/status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

const thenable = require('./lib/thenable');

class Vouch {
  constructor(fn) {
    if (typeof fn !== 'function') {
      return this;
    }

    return fn.call(null, value => this.resolve(value), reason => this.reject(reason));
  }
}

Vouch.resolve = function(value) {
  return thenable(value, FULFILLED);
};

Vouch.reject = function (reason) {
  return thenable(reason, REJECTED);
};

module.exports = Vouch;
