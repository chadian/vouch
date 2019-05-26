import thenable from './lib/thenable';
import { Deferrable } from './lib/thenable';
import { PromiseStates } from './lib/states';

type ResolveValue = any;
type ResolveHandler = (value?: ResolveValue) => ResolveValue;

type RejectValue = any;
type RejectHandler = (value?: RejectValue) => ResolveValue;

export default class Vouch {
  static resolve(value: ResolveValue) {
    const deferred = new Deferrable();
    deferred.finalize(value, PromiseStates.Fulfilled);
    return deferred;
  }

  static reject(value: RejectValue) {
    const deferred = new Deferrable();
    deferred.finalize(value, PromiseStates.Rejected);
    return deferred;
  }

  constructor(fn: (resolve?: ResolveHandler, reject?: RejectHandler) => any) {
    if (typeof fn !== 'function') {
      return;
    }

    const deferred = new Deferrable();
    const then = deferred.then.bind(deferred);
    const fulfill = (value) => deferred.finalize(value, PromiseStates.Fulfilled);
    const reject = (value) => deferred.finalize(value, PromiseStates.Rejected);

    fn.call(null, fulfill, reject);

    this.then = then;
  }

  then: (onFullfilled?: any, onRejected?: any) => any;
}
