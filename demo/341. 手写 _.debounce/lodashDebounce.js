/**
 * _.debounce(func, [wait=0], [options={}])
 *
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. Useful for rate-limiting events that fire in quick succession
 * (e.g. window resize, input keystrokes).
 *
 * Approach:
 * - Keep a timer id (and store the latest invocation time so we can honor a
 *   `maxWait` if provided).
 * - On every call, clear the pending timer and start a new one of `wait` ms.
 * - When the timer finally fires, call `func` with the most recent args and
 *   `this` binding.
 * - Support `leading` (invoke on the leading edge) and `trailing` (invoke on
 *   the trailing edge) options.
 * - Expose a `.cancel()` method to clear any pending invocation.
 */

function debounce(func, wait = 0, options = {}) {
  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  const leading = options.leading === true;
  const trailing = options.trailing !== false;
  const maxWait =
    "maxWait" in options ? Math.max(+options.maxWait || 0, +wait || 0) : null;

  let timerId = null;
  let lastCallTime = null;
  let lastInvokeTime = 0;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    if (leading) {
      return invokeFunc(time);
    }
    if (maxWait !== null) {
      timerId = startTimer(maxDelayed, maxWait - (time - lastCallTime));
    }
    return result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    if (maxWait === null) return timeWaiting;
    return Math.min(timeWaiting, maxWait - timeSinceLastInvoke);
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== null && timeSinceLastInvoke >= maxWait)
    );
  }

  function trailingEdge(time) {
    timerId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function maxDelayed() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(maxDelayed, remainingWait(time));
  }

  function startTimer(pendingFunc, waitTime) {
    return setTimeout(pendingFunc, waitTime);
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== null) {
        timerId = startTimer(maxDelayed, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === null) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
      if (lastArgs) {
        return invokeFunc(Date.now());
      }
    }
    return result;
  };

  return debounced;
}

// --- Tests ---

// Test 1: trailing invocation only (default)
(function () {
  let calls = [];
  const debounced = debounce((x) => calls.push(x), 100);
  debounced("a");
  debounced("b");
  debounced("c");
  setTimeout(() => {
    console.log("debounce trailing calls:", calls); // expected: ['c']
  }, 200);
})();

// Test 2: leading option invokes immediately
(function () {
  let calls = [];
  const debounced = debounce((x) => calls.push(x), 100, {
    leading: true,
    trailing: false,
  });
  debounced("a");
  debounced("b");
  console.log("debounce leading immediate:", calls); // expected: ['a']
  setTimeout(() => {
    console.log("debounce leading after wait:", calls); // expected: ['a']
  }, 200);
})();

// Test 3: cancel prevents the trailing call
(function () {
  let calls = [];
  const debounced = debounce((x) => calls.push(x), 100);
  debounced("x");
  debounced.cancel();
  setTimeout(() => {
    console.log("debounce cancel:", calls); // expected: []
  }, 200);
})();
