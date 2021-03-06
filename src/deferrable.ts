import {
  CallOnce,
  runTask,
  isPending,
  extractThen,
  isPotentialThenable
} from './utils';

import { PromiseStates } from './promise-states';

export type ResolveValue = any;
export type ResolveHandler = (value?: ResolveValue) => ResolveValue;
export type RejectValue = any;
export type RejectHandler = (value?: RejectValue) => ResolveValue;
type FinalPromiseState = PromiseStates.Rejected | PromiseStates.Fulfilled;

type Thenable = {
  then(
    onResolve?: ResolveHandler,
    onReject?: RejectHandler
  ): Thenable
}

export class Deferrable implements Thenable {
  private settledValue: any = null;
  private _state: PromiseStates = PromiseStates.Pending;
  private onResolve: ResolveHandler;
  private onReject: RejectHandler;
  private deferrableQueue: Deferrable[] = [];

  get state(): PromiseStates {
    return this._state;
  }

  then(onResolve?: ResolveHandler, onReject?: RejectHandler) {
    const deferrable = new Deferrable();
    deferrable.onResolve = onResolve;
    deferrable.onReject = onReject;

    this.deferrableQueue.push(deferrable);

    if (!isPending(this)) {
      this.settleQueue();
    }

    return deferrable;
  }

  private settleQueue() {
    const deferrableQueue = this.deferrableQueue;
    const settledValue = this.settledValue;
    const settledState = this.state as FinalPromiseState;

    while (deferrableQueue.length) {
      const deferred = deferrableQueue.shift();
      deferred.settle(settledValue, settledState);
    }
  }

  private settle(pastValue: any, pastState: FinalPromiseState) {
    const settleWith = pastState === PromiseStates.Fulfilled
      ? this.onResolve
      : this.onReject;

    if (typeof settleWith !== 'function') {
      this.finalize(pastValue, pastState);
      return;
    }

    runTask(() => {
      try {
        const settledValue = settleWith(pastValue);
        this.resolution(settledValue);
      } catch (e) {
        this.finalize(e, PromiseStates.Rejected);
      }
    });
  }

  public finalize(value, state: FinalPromiseState) {
    this.transition(value, state);
    this.settleQueue();
  }

  private transition(value, state: PromiseStates) {
    // since every Deferred starts off as pending and can
    // only be moved to final state once we ensure that
    // we're in a pending state to be able to move forward
    if (isPending(this)) {
      this.settledValue = value;
      this._state = state;
    }
  }

  private adopt(d: Deferrable) {
    if (isPending(d)) {
      const fulfill = (value) => this.resolution(value);
      const reject = (value) => this.resolution(value, PromiseStates.Rejected);
      d.then(fulfill, reject);
    } else {
      this.resolution(d.settledValue, d.state as FinalPromiseState);
    }
  }

  private resolution(value: ResolveValue, state: FinalPromiseState = PromiseStates.Fulfilled) {
    if (value === this) {
      const error = new TypeError('Sorry, a promise cannot be resolved with itself');
      this.finalize(error, PromiseStates.Rejected);
      return;
    }

    if (value instanceof Deferrable) {
      this.adopt(value);
      return;
    }

    if (isPotentialThenable(value)) {
      let { then, error } = extractThen(value);

      if (error) {
        this.resolution(error, PromiseStates.Rejected);
        return;
      }

      if (typeof then === 'function') {
        const callOnce = new CallOnce();
        const fulfill = callOnce.track((value) => this.resolution(value));
        const reject = callOnce.track((value) => this.finalize(value, PromiseStates.Rejected));

        try {
          then.call(value, fulfill, reject);
        } catch (e) {
          if (!callOnce.called) {
            reject(e);
          }
        }

        return;
      }
    }

    this.finalize(value, state);
  }
}
