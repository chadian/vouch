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
    if (state.status === PENDING) {
      return;
    }

    state.owed.forEach(resolver);
  }

  function resolver(deferred) {
    const result = state.result;

    let resultHandler;
    if (state.status === FULFILLED) {
      resultHandler = deferred._onFullfilled;
    }
    else if (state.status === REJECTED) {
      resultHandler = deferred._onRejected;
    }

    try {
      const resolved = resultHandler(result);
      deferred._fulfill(resolved);
    } catch (e) {
      deferred._reject(e);
    }
  }

  const deferred = {
    // future value
    then(onFulfilled, onRejected) {
      const freshThen = deferredFactory();
      freshThen._onFullfilled = onFulfilled;
      freshThen._onRejected = onRejected;
      state.owed.push(freshThen);

      if (state.status !== 'PENDING') {
        settleUp();
      }

      return freshThen;
    },

    // future work
    _fulfill(value) {
      state.status = FULFILLED;
      state.result = value;
      settleUp();
    },

    _reject(reason) {
      state.status = REJECTED;
      state.result = reason;
      settleUp();
    }
  };

  return deferred;
};

module.exports = deferredFactory;
