'use strict';
const statusOptions = require('./status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

module.exports = function deferredFactory() {
  const state = {
    status: PENDING,
    result: undefined,
    owed: []
  };

  function settleUp() {

  }

  function resolver() {

  }

  const deferred = {
    // future value
    then(onFulfilled, onRejected) {
      state.onFulfilled;
      state.onRejected;

      return freshThen = deferredFactory();
    },

    // future work
    _reject(value) {
      state.status = REJECTED;
      state.result = value;
      settleUp();
    },

    _resolve(reason) {
      state.status = FULFILLED;
      state.result = reason;
      settleUp();
    }
  };

  state.owed.push(deferred);
  return deferred;
};
