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

export const runTask = (fn: () => any) => setTimeout(fn, 0);
