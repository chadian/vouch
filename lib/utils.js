module.exports = {
  isVouchable(deferred) {
    if (!deferred) return false;
    return typeof deferred.then === 'function' && typeof deferred._state === 'object';
  },

  adopt(adopter, adoptee) {
    if (adopter._state === 'PENDING') {
      adoptee._state.status = PENDING;
    }

    adopter.then(adoptee._fulfill, adoptee._reject);
  }
};
