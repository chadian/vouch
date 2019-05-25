import thenable from './lib/thenable';

export default class Vouch {
  static resolve(value: any) {
    const deferred = thenable();
    deferred._fulfill(value);
    return deferred;
  }

  static reject(value: any) {
    const deferred = thenable();
    deferred._reject(value);
    return deferred;
  }

  then: (onFullfilled?: any, onRejected?: any) => any;

  constructor(fn: (resolv:any, reject:any) => any) {
    if (typeof fn !== 'function') {
      return;
    }

    const deferred = thenable();
    this.then = deferred.then;
    fn.call(null, deferred._fulfill, deferred._reject);

    return deferred;
  }
}
