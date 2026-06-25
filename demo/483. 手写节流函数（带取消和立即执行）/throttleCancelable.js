/**
 * 手写节流函数（带取消和立即执行）
 * Throttle function with cancel() and flush() (immediate execution).
 *
 * Approach:
 * - Hybrid (timestamp + timer) throttle providing leading + trailing edges.
 * - `cancel()`: clears pending timer and resets `previous` so the next call
 *   is treated as the leading edge.
 * - `flush()`: if a trailing call is pending, executes it immediately and
 *   clears the timer (useful before unmount / navigation).
 *
 * @param {Function} fn - Function to throttle.
 * @param {number} wait - Interval in ms.
 * @param {{leading?:boolean, trailing?:boolean}} options - Leading/trailing toggles.
 * @returns {Function} Throttled function with `.cancel()` and `.flush()`.
 */
function throttleCancelable(fn, wait = 300, options = {}) {
  const { leading = true, trailing = true } = options;
  let previous = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke(time) {
    previous = time;
    timer = null;
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  function throttled(...args) {
    const now = Date.now();
    if (!previous && leading === false) previous = now;
    const remaining = wait - (now - previous);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (leading) invoke(now);
    } else if (!timer && trailing) {
      timer = setTimeout(() => invoke(Date.now()), remaining);
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

  throttled.flush = function () {
    if (timer) {
      clearTimeout(timer);
      // Execute pending trailing call now.
      invoke(Date.now());
    }
  };

  return throttled;
}

// ---------- Test cases ----------
let count = 0;
const log = throttleCancelable(
  (msg) => {
    count++;
    console.log(`invoke: ${msg}, count=${count}`);
  },
  100,
  { leading: true, trailing: true },
);

log("a"); // expected: immediate, count=1
log("b"); // ignored/scheduled
log("c"); // updates args
log.flush(); // expected: immediate trailing, count=2 with 'c'
console.log("after flush, count =", count); // expected: 2

log("d"); // new leading edge since previous was reset by flush? Actually flush keeps previous; here within wait so scheduled.
log.cancel();
console.log("after cancel, count =", count); // expected: still 2 (no trailing fires)
