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
    __VOUCHABLE__: true,
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

      const result = utils.packageResult(value);

      if (result.value && (typeof result.value === 'object' || typeof result.value === 'function') && typeof result.then === 'function') {
        resolution(deferred, result);
        return;
      }

      state.status = FULFILLED;
      state.value = result.value;
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
      state.value = reason;
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
    const value = state.value;

    let handler;
    if (state.status === FULFILLED) {
      if (typeof deferred._onFullfilled !== 'function') {
        deferred._fulfill(value);
        return;
      }

      handler = deferred._onFullfilled;
    }
    else if (state.status === REJECTED) {
      if (typeof deferred._onRejected !== 'function') {
        deferred._reject(value);
        return;
      }

      handler = deferred._onRejected;
    }

    setTimeout(() => {
      try {
        const resolutionValue = handler.call(undefined, value);
        const result = utils.packageResult(resolutionValue);
        resolution(deferred, result);
      } catch (e) {
        deferred._reject(e);
      }
    }, 0);

    return;
  }

  // promise resolution procedure
  function resolution(promise, { value, then, thenException }) {
    if (promise === value) {
      promise._reject(new TypeError('Cannot be resolved with the same promise'));
      return;
    }
    else if (utils.isVouchable(value)) {
      utils.adopt(value, promise);
      return;
    }
    else if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      if (thenException) {
        promise._reject(thenException);
        return;
      }

      if (typeof then === 'function') {
        let called = false;
        const once = fn => function() { (!called && fn(...arguments), called = true); };

        try {
          then.call(value, once(promise._fulfill), once(promise._reject));
        } catch(e) {
          if (!called) {
            promise._reject(e);
            called = true;
          }
        }
        return;
      }
    }

    promise._fulfill(value);
    return;
  }

  return deferred;
}

module.exports = deferredFactory;
