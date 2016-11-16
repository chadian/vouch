'use strict';

const statusOptions = require('./lib/status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

const thenable = require('./lib/thenable');

class Vouch {
  constructor(fn) {
    if (typeof fn !== 'function') {
      return;
    }

    const state = {};
    const handler = function(useStatus) {
      return function(result) {
        state.status = useStatus;
        state.result = result;
      };
    };

    fn.call(null, handler(FULFILLED), handler(REJECTED));
    this.then = thenable(state).then;

    return;
  }
}

Vouch.resolve = function(value) {
  return thenable({ result: value, status: FULFILLED });
};

Vouch.reject = function (reason) {
  return thenable({ result: reason, status: REJECTED });
};

module.exports = Vouch;
