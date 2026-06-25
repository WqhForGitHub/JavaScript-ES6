/**
 * 手写 requestAnimationFrame 节流
 * Throttle a function to run at most once per animation frame using requestAnimationFrame.
 *
 * Approach:
 * - On each call, store the latest arguments and schedule a rAF if none is pending.
 * - When the frame fires, invoke `fn` with the latest args and clear the scheduled flag.
 * - This guarantees at most one execution per frame (~16.6ms @ 60fps) which is ideal
 *   for scroll/resize/mousemove handlers tied to visual updates.
 * - `.cancel()` removes the pending rAF. Falls back to setTimeout(16) when rAF is
 *   unavailable (e.g. Node or very old browsers).
 *
 * @param {Function} fn - Function to throttle.
 * @returns {Function} Throttled function with `.cancel()`.
 */
function rafThrottle(fn) {
  const raf =
    typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame
      : (cb) => setTimeout(cb, 16);
  const cancelRaf =
    typeof cancelAnimationFrame !== "undefined"
      ? cancelAnimationFrame
      : (id) => clearTimeout(id);

  let scheduled = false;
  let rafId = null;
  let lastArgs = null;
  let lastThis = null;

  function throttled(...args) {
    lastArgs = args;
    lastThis = this;
    if (scheduled) return;
    scheduled = true;
    rafId = raf(() => {
      scheduled = false;
      rafId = null;
      const a = lastArgs;
      const t = lastThis;
      lastArgs = null;
      lastThis = null;
      fn.apply(t, a);
    });
  }

  throttled.cancel = function () {
    if (scheduled) {
      cancelRaf(rafId);
      scheduled = false;
      rafId = null;
      lastArgs = null;
      lastThis = null;
    }
  };

  return throttled;
}

// ---------- Test cases ----------
let calls = 0;
const log = rafThrottle((msg) => {
  calls++;
  console.log("raf invoke:", msg, "count=", calls);
});

// Multiple synchronous calls collapse into one rAF callback.
log("a");
log("b");
log("c");
console.log("synchronously after 3 calls, count =", calls); // expected: 0 (rAF is async)

// After a frame (use setTimeout to allow rAF/timeout fallback to fire).
setTimeout(() => {
  console.log("after frame, count =", calls); // expected: 1, message 'c' (latest args win)
  log.cancel(); // no-op if nothing pending, but tests API exists
}, 50);
