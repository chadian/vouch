'use strict';

const statusOptions = require('./status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

function deferredFactory() {
  const state = {
    status: PENDING,
    result: undefined,
    owed: []
  };

  // loop through "owed" thens and settle up
  // by resolving the value
  function settleUp() {
    while (state.owed.length) {
      const deferred = state.owed.shift();
      settleDefferred(deferred);
    }
  }

  function settleDefferred(deferred) {
    const result = state.result;

    let resultHandler;
    if (state.status === FULFILLED) {
      if (typeof deferred._onFullfilled !== 'function') {
        deferred._fulfill(result);
      }
      resultHandler = deferred._onFullfilled;
    }
    else if (state.status === REJECTED) {
      if (deferred._onRejected !== 'function') {
        deferred._reject(result);
      }
      resultHandler = deferred._onRejected;
    }

    setTimeout(() => {
      try {
        const resolved = resultHandler.call(undefined, result);
        deferred._fulfill(resolved);
      } catch (e) {
        deferred._reject(e);
      }
    }, 0);

    return;
  }

  // promise resolution procedure
  function resolution(value) {

  }

  const deferred = {
    // future value
    then(onFulfilled, onRejected) {
      const freshThen = deferredFactory();
      freshThen._onFullfilled = onFulfilled;
      freshThen._onRejected = onRejected;
      state.owed.push(freshThen);

      if (state.status !== 'PENDING') {
        // setTimeout(settleUp, 0);
        settleUp();
      }

      return freshThen;
    },

    // future work
    _fulfill(value) {
      if (value === this) {
        deferred._reject(new TypeError());
        return;
      }

      if (state.status !== PENDING) {
        return;
      }

      state.status = FULFILLED;
      state.result = value;
      settleUp();
    },

    _reject(reason) {
      if (state.status !== PENDING) {
        return;
      }

      state.status = REJECTED;
      state.result = reason;
      settleUp();
    }
  };

  return deferred;
}

module.exports = deferredFactory;
