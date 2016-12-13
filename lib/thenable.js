'use strict';

const statusOptions = require('./status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

const utils = require('./utils');

function deferredFactory() {
  const state = {
    status: PENDING,
    result: undefined,
    owed: []
  };

  const deferred = {
    _state: state,

    // future value
    then(onFulfilled, onRejected) {
      const freshThen = deferredFactory();
      freshThen._onFullfilled = onFulfilled;
      freshThen._onRejected = onRejected;

      state.owed.push(freshThen);

      if (state.status !== 'PENDING') {
        settleUp(state.owed);
      }

      return freshThen;
    },

    // future work
    _fulfill(value) {
      if (value === deferred) {
        deferred._reject(new TypeError());
        return;
      }

      if (state.status !== PENDING) {
        return;
      }

      state.status = FULFILLED;
      state.result = value;
      settleUp(state.owed);
    },

    _reject(reason) {
      if (reason === deferred) {
        deferred._reject(new TypeError());
        return;
      }

      if (state.status !== PENDING) {
        return;
      }

      state.status = REJECTED;
      state.result = reason;
      settleUp(state.owed);
    }
  };

  // loop through "owed" thens and settle up
  // by resolving the value
  function settleUp(owed) {
    while (owed.length) {
      const deferred = owed.shift();
      settleDefferred(deferred);
    }
  }

  function settleDefferred(deferred) {
    if (state.status === PENDING) {
      throw 'Attempt to settle a promise not in a pending state, this should never happen.';
    }
    const result = state.result;

    let resultHandler;
    if (state.status === FULFILLED) {
      if (typeof deferred._onFullfilled !== 'function') {
        deferred._fulfill(result);
        return;
      }

      resultHandler = deferred._onFullfilled;
    }
    else if (state.status === REJECTED) {
      if (typeof deferred._onRejected !== 'function') {
        deferred._reject(result);
        return;
      }

      resultHandler = deferred._onRejected;
    }

    setTimeout(() => {
      try {
        resolution(deferred, resultHandler.call(undefined, result));
      } catch (e) {
        deferred._reject(e);
      }
    }, 0);

    return;
  }

  // promise resolution procedure
  function resolution(promise, result) {
    if (promise === result) {
      promise._reject(new TypeError('Cannot be resolved with the same promise'));
      return;
    }
    else if (utils.isVouchable(result)) {
      utils.adopt(result, promise);
      return;
    }
    else if (typeof result === 'object' || typeof result === 'function') {
      const then = result.then;
      if (typeof then === 'function') {
        then.call(result, promise._fulfill, promise._reject);
        return;
      }
    }

    promise._fulfill(result);
    return;
  }

  return deferred;
}

module.exports = deferredFactory;
