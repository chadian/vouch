/// <reference types="./src/typings" />

import Vouch from './src/vouch';
import { Deferrable } from './src/lib/thenable';
import { PromiseStates } from './src/lib/states';

const assert = require('assert');
const PromiseAPlusTests = require('promises-aplus-tests');

describe('Deferrable', function() {
it('can resolves onResolve handler with resolved value', function () {
  const deferrable = new Deferrable().then(
    resolve => assert.equal(resolve, 'RESOLVED!')
  );

  deferrable.finalize('RESOLVED!', PromiseStates.Fulfilled);
});

describe('#constructor', function() {
  it('has an initial state of pending', function() {
    const deferrable = new Deferrable();
    assert.equal(deferrable.state, PromiseStates.Pending);
  });
});
});

describe("Quick Vouch Sanity Tests", function() {
  it('has a `then` method', function () {
    const vouch = new Vouch(() => {});
    assert.equal(typeof vouch.then, 'function');
  });

  it('resolves when passed a resolving function', function(done) {
    const willResolve = (resolve/*, reject*/) => resolve('hello');
    const vouch = new Vouch(willResolve);

    vouch.then(
      () => assert.ok(true) || done(),
      () => assert.ok(false) || done()
    );
  });

  it('rejects when passed a rejecting function', function(done) {
    const willReject = (resolve, reject) => reject('hello');
    const vouch = new Vouch(willReject);

    vouch.then(
      () => assert.ok(false) || done(),
      () => assert.ok(true) || done()
    );
  });

  it('resolves with value passed', function(done) {
    const expectedResolvedValue = "SPECIFIC VALUE";
    const willResolve = (resolve) => resolve(expectedResolvedValue);
    const vouch = new Vouch(willResolve);

    vouch.then(resolvedValue => {
      assert.equal(resolvedValue, expectedResolvedValue);
      done();
    },
      () => assert.ok(false)
    );
  });

  it('resolves with value passed through multiple `then` chains', function(done) {
    const expectedResolvedValue = "SPECIFIC VALUE";
    const willResolve = (resolve) => resolve(expectedResolvedValue);
    const passThrough = value => value;
    const vouch = new Vouch(willResolve);

    vouch
      .then(passThrough)
      .then(
        resolvedValue => {
          assert.equal(resolvedValue, expectedResolvedValue);
          done();
        },
        () => assert.ok(false)
      );
  });

  it('resolves after passing through a reject', function(done) {
    const willReject = (resolve, reject) => reject('REJECTED');

    const vouch = new Vouch(willReject);

    vouch
      // should skip
      .then()
      // should be handled with reject handler
      .then(
        resolved => assert(false),
        rejected => assert(rejected === 'REJECTED')
      )
      // should fall back to the success handler
      .then(
        resolved => {
          assert(true);
          done();
        },
        rejected => assert(false)
      );
  });

  it('resolves with final resolution from nested returned thenables', function(done) {
    const willResolve = resolve => resolve();
    const vouch = new Vouch(willResolve)
      .then(function () {
        return {
          then(onFullfill) {
            return onFullfill({
              then(onFullfill) {
                return onFullfill('REACHED THE DEPTHS');
              }
            });
          }
        };
      })
      .then(result => {
        assert.equal(result, 'REACHED THE DEPTHS');
        done();
      });
  });

  it('resolves with the value of a resolved promise', function(done) {
    Vouch.resolve()
      .then(() => Vouch.resolve('RESOLVED'))
      .then(value => assert(value, 'RESOLVED') || done());
  });

  it('eventually resolves with an object with a then function', function(done) {
    let resolve ;
    let eventual = new Vouch(r => {
      resolve = r;
    });

    let mockThen = {
      then(onFullfill) {
        onFullfill('FULFILLED');
      }
    }

    Vouch
      .resolve()
      .then(() => eventual)
      .then(value => {
        console.log('asserting!')
        assert.equal(value, 'FULFILLED');
        done();
      });

    setTimeout(() => resolve(mockThen), 10);
  });

  it('resolves with the value of an eventually resolved promise', function(done) {
    let resolveEventual;
    const eventual = new Promise(r => {
      resolveEventual = r
    });

    Vouch.resolve()
      .then(() => eventual)
      .then(value => {
        assert(value, 'RESOLVED') || done()
      });

    resolveEventual('RESOLVED');
  });

  it('rejects within reject handler if an error is thrown', function(done) {
    const willReject = (resolve, reject) => reject('REJECTED');
    const vouch = new Vouch(willReject);

    vouch
      // this will re-throw the rejected reason
      // continuing the rejection chain
      .then(
        () => assert(false),
        rejected => { throw (rejected); }
      )
      .then(
        () => assert(false),
        rejected => {
          assert.equal(rejected, 'REJECTED');
          done();
        }
      );
  });
});

describe('`Vouch` class', function () {
  describe('`resolve` method', function () {
    it('has a `resolve` method', function () {
      assert.equal(typeof Vouch.resolve, 'function');
    });

    it('result from calling `resolve` has a `then` method', function () {
      assert.equal(typeof Vouch.resolve(true).then, 'function');
    });
  });

  describe('`reject` method', function () {
    it('method exists', function () {
      assert.equal(typeof Vouch.reject, 'function');
    });

    it('has a `then` method after being called', function () {
      assert.equal(typeof Vouch.reject(true).then, 'function');
    });
  });
});

describe("Promises/A+ Test Suite", function () {
  const mochaTestAdapter = {
    resolved: Vouch.resolve,
    rejected: Vouch.reject,

    deferred() {
      const d = new Deferrable();

      return {
        promise: d,
        resolve: value => {
          d.finalize(value, PromiseStates.Fulfilled);
        },
        reject: value => {
          d.finalize(value, PromiseStates.Rejected);
        }
      };
    }
  };

  PromiseAPlusTests.mocha(mochaTestAdapter);
});
