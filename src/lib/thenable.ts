import { PromiseStates } from './states';
import { isVouchable, adopt, pullThen, packageResult } from './utils';
import { inherits } from 'util';
import { ResolveOptions } from 'dns';

type ResolveValue = any;
type ResolveHandler = (value?: ResolveValue) => ResolveValue;

type RejectValue = any;
type RejectHandler = (value?: RejectValue) => ResolveValue;

type FinalPromiseState = PromiseStates.Rejected | PromiseStates.Fulfilled;

type Thenable = {
  then(
    onResolve?: ResolveHandler,
    onReject?: RejectHandler
  ): Thenable
}

function isPending(d: Deferrable): boolean {
  return d.state === PromiseStates.Pending;
}

export class Deferrable implements Thenable {
  private settledValue: any = null;
  private _state: PromiseStates = PromiseStates.Pending;
  private onResolve: ResolveHandler;
  private onReject: RejectHandler;
  private deferrableQueue: Deferrable[] = [];

  // TODO: see if this can go entirely private...
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

      if (settledState === PromiseStates.Fulfilled) {
        deferred.fulfill(settledValue);
      } else {
        deferred.reject(settledValue);
      }
    }
  }

  fulfill(value: ResolveValue) {
    this.settle(value, this.onResolve);
  }

  reject(value: RejectValue) {
    this.settle(value, this.onReject);
  }

  private settle(pastValue: any, settleFunction) {
    setTimeout(() => {
      let settledValue, settledState;

      try {
        settledValue = settleFunction(pastValue);
        settledState = PromiseStates.Fulfilled;
      } catch (e) {
        settledValue = e;
        settledState = PromiseStates.Rejected;
      }

      this.setState(settledValue, settledState);
      this.settleQueue();
    }, 0);
  }

  public finalize(value, state: PromiseStates) {
    this.setState(value, state);
    this.settleQueue();
  }

  private setState(value, state: PromiseStates) {
    if (isPending(this)) {
      this.settledValue = value;
      this._state = state;
    }
  }
}

export default function deferredFactory() {
  const state = {
    status: PromiseStates.Pending,
    result: undefined,
    owed: [],
    value: undefined
  };

  const deferred = {
    __VOUCHABLE__: true,
    _state: state,

    _onFullfilled: () => {},
    _onRejected: () => {},

    // future value
    then: function(onFulfilled, onRejected) {
      const freshThen = deferredFactory();
      freshThen._onFullfilled = onFulfilled;
      freshThen._onRejected = onRejected;

      state.owed.push(freshThen);

      if (state.status !== PromiseStates.Pending) {
        settleUp(state.owed);
      }

      return freshThen;
    },

    // future work
    _fulfill(value) {
      if (value === deferred) {
        deferred._reject(new TypeError('same thenable cannot fulfill itself'));
        return;
      }

      if (state.status !== PromiseStates.Pending) {
        return;
      }

      let result;
      try {
        result = packageResult(value);

        if (result.value && (typeof result.value === 'object' || typeof result.value === 'function') && typeof result.then === 'function') {
          resolution(deferred, result);
          return;
        }
      } catch (e) {
        deferred._reject(e);
        return;
      }

      state.status = PromiseStates.Fulfilled;
      state.value = result.value;
      settleUp(state.owed);
    },

    _reject(reason) {
      if (reason === deferred) {
        deferred._reject(new TypeError('same thenable cannot reject itself'));
        return;
      }

      if (state.status !== PromiseStates.Pending) {
        return;
      }

      state.status = PromiseStates.Rejected;
      state.value = reason;
      settleUp(state.owed);
    }
  };

  // loop through "owed" thens and settle up
  // by resolving the value
  function settleUp(owed) {
    while (owed.length) {
      const deferred = owed.shift();
      settleDefferred(deferred);
    }
  }

  function settleDefferred(deferred) {
    const value = state.value;

    let handler;
    if (state.status === PromiseStates.Fulfilled) {
      if (typeof deferred._onFullfilled !== 'function') {
        deferred._fulfill(value);
        return;
      }

      handler = deferred._onFullfilled;
    }
    else if (state.status === PromiseStates.Rejected) {
      if (typeof deferred._onRejected !== 'function') {
        deferred._reject(value);
        return;
      }

      handler = deferred._onRejected;
    }

    setTimeout(() => {
      try {
        const resolutionValue = handler.call(undefined, value);
        const result = packageResult(resolutionValue);
        resolution(deferred, result);
      } catch (e) {
        deferred._reject(e);
      }
    }, 0);

    return;
  }

  // promise resolution procedure
  function resolution(promise, { value, then }) {
    if (promise === value) {
      promise._reject(new TypeError('same thenable cannot resolve itself'));
      return;
    }
    else if (isVouchable(value)) {
      adopt(value, promise);
      return;
    }
    else if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      if (typeof then === 'function') {
        let called = false;
        const once = (fn) => function(...args) {
          (!called && fn(...args), called = true);
        };

        try {
          then.call(value, once(promise._fulfill), once(promise._reject));
        } catch(e) {
          if (!called) {
            promise._reject(e);
            called = true;
          }
        }
        return;
      }
    }

    promise._fulfill(value);
    return;
  }

  return deferred;
}
