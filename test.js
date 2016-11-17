'use strict';

const tests = require('promises-aplus-tests');
const Vouch = require('./vouch');
const thenable = require('./lib/thenable');
var assert = require('assert');

const adapter = {
  resolved(reason) { return Vouch.resolve(reason); },
  rejected(reason) { return Vouch.reject(reason); },
  deferred() {

    const deferred = thenable();

    return {
      promise: deferred,
      resolve: deferred._resolve,
      reject: deferred._reject
    };
  }
};

describe("Promises/A+ Test Suite", function () {
    require("promises-aplus-tests").mocha(adapter);
});
