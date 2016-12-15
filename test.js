'use strict';

const tests = require('promises-aplus-tests');
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

tests(adapter, { reporter: 'nyan' }, function(err) {
  console.log(err);
});
