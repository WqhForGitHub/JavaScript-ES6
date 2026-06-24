/**
 * 手写节流函数（定时器版）
 * Throttle function using a timer-based approach.
 *
 * Approach:
 * - When the throttled function is invoked, if no timer is currently set,
 *   we start one with the specified `wait` interval.
 * - While the timer is pending, all subsequent calls are ignored.
 * - When the timer fires, we invoke `fn` with the latest arguments and clear the timer,
 *   so the next call after `wait` ms will be allowed again.
 * - Pure timer version means the FIRST call is also delayed by `wait` ms
 *   (no immediate execution), and the LAST call within the window is guaranteed
 *   to fire when the timer triggers (trailing execution).
 *
 * @param {Function} fn - The function to throttle.
 * @param {number} wait - Throttle interval in milliseconds.
 * @returns {Function} Throttled function with a `.cancel()` method.
 */
function throttleTimer(fn, wait = 300) {
  let timer = null;
  let lastArgs = null;

  function throttled(...args) {
    lastArgs = args;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, lastArgs);
      lastArgs = null;
    }, wait);
  }

  throttled.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      lastArgs = null;
    }
  };

  return throttled;
}

// ---------- Test cases ----------
// Use fake timers simulation via counter
let callCount = 0;
const log = throttleTimer((msg) => {
  callCount++;
  console.log(`[invoke] ${msg} (count=${callCount})`);
}, 100);

// Expected: only scheduled; nothing logged synchronously.
log('a'); // expected: no immediate log (timer version delays first call)
console.log('after call a, count =', callCount); // expected: 0

// These calls happen within the wait window; they are ignored except for updating args.
log('b');
log('c');
console.log('after b,c within window, count =', callCount); // expected: 0

// Wait 110ms then check
setTimeout(() => {
  console.log('after 110ms, count =', callCount); // expected: 1, message 'c'
}, 110);
