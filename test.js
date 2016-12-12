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
      resolve: deferred._fulfill,
      reject: deferred._reject
    };
  }
};

describe("Promises/A+ Test Suite", function() {
  require("promises-aplus-tests").mocha(adapter);
});

describe('`new Vouch()` instance', function() {
  it('has a `then` method', function() {
    const vouch = new Vouch(() => {});
    assert.equal(typeof vouch.then, 'function');
  });

  it('resolves when passed a resolving function', function(done) {
    const willResolve = (resolve/*, reject*/) => resolve('hello');
    const vouch = new Vouch(willResolve);

    vouch.then(
      () => {
        assert.ok(true);
        done();
      },
      () => assert.ok(false)
    );
  });

  it('resolves with value passed', function(done) {
    const expectedResolvedValue = "SPECIFIC VALUE";
    const willResolve = (resolve/*, reject*/) => resolve(expectedResolvedValue);
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
    const willResolve = (resolve/*, reject*/) => resolve(expectedResolvedValue);
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

  it('rejects when passed a rejecting function', function(done) {
    const willReject = (resolve, reject) => reject();
    const vouch = new Vouch(willReject);

    vouch.then(() => assert.ok(false), () => assert.ok(true) || done());
  });

  it('rejects within reject handler if an error is thrown', function(done) {
    const willReject = (resolve, reject) => reject('REJECTED');
    const vouch = new Vouch(willReject);

    vouch
      // this will re-throw the rejected reason
      // continuing the rejection chain
      .then(
        () => assert(false),
        rejected => { throw(rejected); }
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

describe('`Vouch` class', function() {
  describe('`resolve` method', function() {
    it('has a `resolve` method', function() {
      assert.equal(typeof Vouch.resolve, 'function');
    });

    it('result from calling `resolve` has a `then` method', function() {
      assert.equal(typeof Vouch.resolve(true).then, 'function');
    });
  });

  describe('`reject` method', function() {
    it('method exists', function() {
      assert.equal(typeof Vouch.reject, 'function');
    });

    it('has a `then` method after being called', function() {
      assert.equal(typeof Vouch.reject(true).then, 'function');
    });
  });
});
