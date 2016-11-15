'use strict';
const statusOptions = require('./status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

module.exports = function thenableFactory(result, previousStatus) {
  let status = PENDING;

  const thenable = {
    then(onFulfilled, onRejected) {
      try {
        if (status === PENDING) {
          if (previousStatus === FULFILLED && typeof onFulfilled === 'function') {
            result = onFulfilled.call(null, result);
          }

          if (previousStatus === REJECTED && typeof onRejected === 'function') {
            result = onRejected.call(null, result);
          }

          status = FULFILLED;
        }
      } catch(error) {
        status = REJECTED;
        result = error;
      } finally {
        return thenableFactory(result, status);
      }
    }
  };

  return thenable;
};
