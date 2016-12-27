'use strict';

const statusOptions = require('./lib/status');
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

const thenable = require('./lib/thenable');

class Vouch {
  constructor(fn) {
    if (typeof fn !== 'function') {
      return;
    }

    const deferred = thenable();
    fn.call(null, deferred._fulfill, deferred._reject);
    return deferred;
  }
}

Vouch.resolve = function(value) {
  const deferred = thenable();
  deferred._fulfill(value);
  return deferred;
};

Vouch.reject = function (reason) {
  const deferred = thenable();
  deferred._reject(reason);
  return deferred;
};

module.exports = Vouch;
