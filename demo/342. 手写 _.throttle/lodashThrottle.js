/**
 * _.throttle(func, [wait=0], [options={}])
 *
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function always returns the
 * result of the last `func` invocation.
 *
 * Approach:
 * - A throttle is essentially a debounce with `{ leading: true, maxWait: wait }`.
 * - On the leading edge (first call within the window) invoke immediately.
 * - Subsequent calls are queued and only fired once `wait` ms have passed
 *   on the trailing edge.
 * - Support options: { leading: true|false, trailing: true|false }.
 * - Expose `.cancel()`.
 */

function throttle(func, wait = 0, options = {}) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }
  const leading = options.leading !== false;
  const trailing = options.trailing !== false;

  let timerId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
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

  function remainingWait(time) {
    return wait - (time - lastCallTime);
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    return timeSinceLastCall >= wait || timeSinceLastCall < 0;
  }

  function trailingEdge() {
    timerId = null;
    if (trailing && lastArgs) {
      return invokeFunc(Date.now());
    }
    lastArgs = null;
    lastThis = null;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge();
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function throttled(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === null) {
        if (leading) {
          return invokeFunc(time);
        }
        timerId = setTimeout(timerExpired, wait);
      } else if (trailing) {
        // already invoked on leading edge; ensure a trailing timer is set
        if (timerId === null) {
          timerId = setTimeout(timerExpired, remainingWait(time));
        }
      }
      return result;
    }
    if (timerId === null && trailing) {
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    return result;
  }

  throttled.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = 0;
    lastThis = null;
  };

  return throttled;
}

// --- Tests ---

// Test 1: leading invocation fires immediately, trailing fires once
(function () {
  let calls = [];
  const throttled = throttle((x) => calls.push(x), 100);
  throttled('a'); // fires immediately (leading)
  throttled('b'); // ignored, but queued for trailing
  throttled('c'); // ignored, but queued for trailing
  console.log('throttle immediate:', calls); // expected: ['a']
  setTimeout(() => {
    console.log('throttle after wait:', calls); // expected: ['a', 'c']
  }, 200);
})();

// Test 2: cancel suppresses the trailing call
(function () {
  let calls = [];
  const throttled = throttle((x) => calls.push(x), 100);
  throttled('x');
  throttled('y');
  throttled.cancel();
  setTimeout(() => {
    console.log('throttle cancel:', calls); // expected: ['x']
  }, 200);
})();

// Test 3: leading:false delays the first call to the trailing edge
(function () {
  let calls = [];
  const throttled = throttle((x) => calls.push(x), 100, { leading: false });
  throttled('a');
  console.log('throttle no-leading immediate:', calls); // expected: []
  setTimeout(() => {
    console.log('throttle no-leading after wait:', calls); // expected: ['a']
  }, 200);
})();
