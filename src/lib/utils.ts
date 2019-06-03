import Deferrable from "./Deferrable";
import { PromiseStates } from './PromiseStates';

export class CallOnce {
  get called() {
    return this._called;
  }

  private _called = false

  track(fn) {
    const trackingInstance = this;
    return function (...args) {
      if (!trackingInstance.called) {
        fn.call(this, ...args);
        trackingInstance._called = true;
      }
    }
  }
}

// TODO: If node environment use process.nextTick
// microtasks but the browser doesn't expose a way
// of scheduling these, so we'll use `setTimeout`
// which gives us a task.
export const runTask = (fn: () => any) => setTimeout(fn, 0);

export function isPending(d: Deferrable): boolean {
  return d.state === PromiseStates.Pending;
}

export function extractThen(potentialThenable): { then?: any, error?: any } {
  let result = { then: undefined, error: undefined };

  try {
    result.then = potentialThenable.then;
  } catch (e) {
    result.error = e;
  }

  return result;
}

// In the case we have a non-null object, or a function,
// then it could be a thenable (something containing a `.then` property)
export function isPotentialThenable(value): boolean {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}
