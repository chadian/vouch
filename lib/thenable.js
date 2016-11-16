'use strict';
const statusOptions = require('./status');
const PENDING = statusOptions.PENDING;
const FULFILLED = statusOptions.FULFILLED;
const REJECTED = statusOptions.REJECTED;

module.exports = function thenableFactory(previousState) {
  const state = {
    status: PENDING,
    result: undefined,
    then: undefined
  };

  const thenable = {
    then(onFulfilled, onRejected) {
      if (state.status === PENDING) {
        let callFn;
        if (previousState.status === FULFILLED && typeof onFulfilled === 'function') {
          callFn = onFulfilled;
        }

        if (previousState.status === REJECTED && typeof onRejected === 'function') {
          callFn = onRejected;
        }

        if (typeof callFn === 'function') {
          setTimeout(() => {
            try {
              state.result = callFn.call(null, previousState.result);
              state.status = FULFILLED;
            } catch(exception) {
              state.result = exception;
              state.status = REJECTED;
            }
          }, 0);
        } else {
          state.status = previousState.status;
        }
      }

      state.then = thenableFactory(state);
      return state.then;
    }
  };

  return thenable;
};
