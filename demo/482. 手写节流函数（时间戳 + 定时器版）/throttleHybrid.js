/**
 * 手写节流函数（时间戳 + 定时器版）
 * Throttle function combining timestamp + timer so we get BOTH
 * leading (immediate first call) AND trailing (last call) execution.
 *
 * Approach:
 * - Track `previous` timestamp of last invocation.
 * - On each call compute `remaining = wait - (now - previous)`.
 * - If `remaining <= 0` (or system time jumped backwards), invoke immediately
 *   (leading edge via timestamp) and update `previous`.
 * - Otherwise, if no timer is set, start a timer for `remaining` ms so the
 *   last call within the window is fired (trailing edge via timer).
 * - Provides `.cancel()` to clear pending timer and reset state.
 *
 * @param {Function} fn - Function to throttle.
 * @param {number} wait - Interval in ms.
 * @returns {Function} Throttled function with `.cancel()`.
 */
function throttleHybrid(fn, wait = 300) {
  let previous = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      // Time window has elapsed -> fire immediately (leading).
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      fn.apply(this, args);
      lastArgs = null;
    } else if (!timer) {
      // Schedule trailing call.
      timer = setTimeout(() => {
        previous = Date.now();
        timer = null;
        fn.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }, remaining);
    }
  }

  throttled.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    previous = 0;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}

// ---------- Test cases ----------
let count = 0;
const t = throttleHybrid((msg) => {
  count++;
  console.log(`invoke: ${msg}, count=${count}`);
}, 100);

t('first'); // expected: fires immediately, count=1 (leading edge)
console.log('right after first call, count =', count); // expected: 1

t('second'); // within window -> scheduled for trailing
t('third');  // updates args; trailing will use 'third'
console.log('within window, count =', count); // expected: 1

setTimeout(() => {
  console.log('after ~100ms, count =', count); // expected: 2 with message 'third'
}, 120);
