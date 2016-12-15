'use strict';
const Vouch = require('./vouch');

const adapter = {
  resolved(reason) { return Vouch.resolve(reason); },
  rejected(reason) { return Vouch.reject(reason); },
  deferred() {

    const deferred = {
      resolve: undefined,
      reject: undefined
    };

    deferred.promise = new Vouch(function(resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    return {
      promise: deferred.promise,
      resolve: deferred.resolve,
      reject: deferred.reject
    };
  }
};

describe("Promises/A+ Test Suite", function() {
  require("promises-aplus-tests").mocha(adapter);
});
