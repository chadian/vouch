module.exports = {
  isVouchable(deferred) {
    if (!deferred) return false;
    return !!deferred.__VOUCHABLE__;
  },

  adopt(adopter, adoptee) {
    if (adopter._state === 'PENDING') {
      adoptee._state.status = PENDING;
    }

    adopter.then(adoptee._fulfill, adoptee._reject);
  }
};
