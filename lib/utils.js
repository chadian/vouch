
module.exports = { isVouchable, adopt, pullThen, packageResult };

function isVouchable(deferred) {
  if (!deferred) return false;
  return !!deferred.__VOUCHABLE__;
}

function adopt(adopter, adoptee) {
  if (adopter._state === 'PENDING') {
    adoptee._state.status = PENDING;
  }

  adopter.then(adoptee._fulfill, adoptee._reject);
}

function pullThen(result) {
  if (result !== null && (typeof result === 'function' || typeof result === 'object')) {
    const then = result.then;
    return then;
  }

  return null;
}

function packageResult(value) {
  let then;
  let thenException;
  then = pullThen(value);

  return { value, then };
}
