import { PromiseStates } from './promise-states';
import {
  Deferrable,
  ResolveValue,
  RejectValue,
  ResolveHandler,
  RejectHandler
} from './deferrable';

export class Vouch {
  static resolve(value?: ResolveValue) {
    const deferred = new Deferrable();
    deferred.finalize(value, PromiseStates.Fulfilled);
    return deferred;
  }

  static reject(value?: RejectValue) {
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
