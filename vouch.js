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

    const handler = function(useStatus) {
      return function(result) {
        if (useStatus === FULFILLED) {
          this.resolve(result);
        } else if (useStatus === REJECTED) {
          this.reject(result);
        }
      };
    };

    fn.call(null, handler(FULFILLED), handler(REJECTED));
  }
}

Vouch.resolve = function(value) {
  const deferred = thenable();
  deferred._resolve(value);
  return deferred;
};

Vouch.reject = function (reason) {
  const deferred = thenable();
  deferred._reject(reason);
  return deferred;
};

module.exports = Vouch;
