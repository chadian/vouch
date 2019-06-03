import Deferrable from "./Deferrable";
import { PromiseStates } from './PromiseStates';

export class CallOnce {
  private called = false;

  get wasCalled() {
    return this.called;
  }

  track(fn) {
    const trackingInstance = this;
    return function (...args) {
      if (!trackingInstance.wasCalled) {
        fn.call(this, ...args);
        trackingInstance.called = true;
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
