'use strict';

const tests = require('promises-aplus-tests');

const adapter = {
  resolved(reason) { return Promise.resolve(reason); },
  rejected(reason) { return Promise.reject(reason); },
  deferred() {

    const deferred = {
      resolve: undefined,
      reject: undefined
    };

    deferred.promise = new Promise(function(resolve, reject) {
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

tests(adapter, { reporter: "dot" }, function(err) {
  console.log(err);
});
