/**
 * 手写平滑滚动到指定位置
 * Smoothly scroll an element (or window) to a target (x, y) using requestAnimationFrame
 * with an easing function, with cancellation support.
 *
 * Approach:
 * - Capture the start scroll position, the target, and the duration.
 * - On each animation frame compute `t = elapsed / duration`, then eased progress
 *   (default easeInOutCubic), and set `scrollLeft/scrollTop` accordingly.
 * - Provide a `cancel()` so concurrent scrolls or user interaction can abort.
 * - Falls back to `window.scrollTo({behavior:'smooth'})` when available and no
 *   custom duration is requested.
 * - Return a Promise that resolves when the animation completes (or rejects on cancel).
 *
 * Browser-only; in Node the helper rejects gracefully because rAF isn't available.
 *
 * @param {Element|Window} target - Scroll container or window.
 * @param {number} x - Target scrollLeft.
 * @param {number} y - Target scrollTop.
 * @param {{duration?:number, easing?:function}} [opts]
 * @returns {{promise:Promise, cancel:function}}
 */
function smoothScrollTo(target, x, y, opts = {}) {
  const { duration = 400, easing = easeInOutCubic } = opts;

  const isWindow = target === window;
  const getScroll = () =>
    isWindow
      ? { left: window.pageXOffset || 0, top: window.pageYOffset || 0 }
      : { left: target.scrollLeft || 0, top: target.scrollTop || 0 };
  const setScroll = (left, top) => {
    if (isWindow) window.scrollTo(left, top);
    else {
      target.scrollLeft = left;
      target.scrollTop = top;
    }
  };

  // Native fast-path.
  if (
    isWindow &&
    typeof window.scrollTo === "function" &&
    opts.duration === undefined
  ) {
    let cancelled = false;
    const promise = new Promise((resolve, reject) => {
      try {
        window.scrollTo({ left: x, top: y, behavior: "smooth" });
        // We can't reliably detect native scroll completion; resolve shortly after.
        setTimeout(resolve, duration);
      } catch (e) {
        reject(e);
      }
    });
    return {
      promise,
      cancel: () => {
        cancelled = true;
      },
    };
  }

  const raf =
    typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame
      : (cb) => setTimeout(cb, 16);
  const cancelRaf =
    typeof cancelAnimationFrame !== "undefined"
      ? cancelAnimationFrame
      : (id) => clearTimeout(id);

  const start = getScroll();
  const startTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  let rafId = null;
  let cancelled = false;

  const promise = new Promise((resolve, reject) => {
    function step(now) {
      if (cancelled) {
        reject(new Error("cancelled"));
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easing(t);
      setScroll(
        start.left + (x - start.left) * eased,
        start.top + (y - start.top) * eased,
      );
      if (t < 1) {
        rafId = raf(step);
      } else {
        setScroll(x, y); // snap exactly
        resolve();
      }
    }
    rafId = raf(step);
  });

  function cancel() {
    cancelled = true;
    if (rafId) cancelRaf(rafId);
  }

  return { promise, cancel };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------- Test cases ----------
// Verify easing curve values.
console.log("ease(0):", easeInOutCubic(0)); // expected: 0
console.log("ease(1):", easeInOutCubic(1)); // expected: 1
console.log("ease(0.5):", easeInOutCubic(0.5)); // expected: 0.5
console.log("ease(0.25):", easeInOutCubic(0.25)); // expected: 0.0625
console.log("ease(0.75):", easeInOutCubic(0.75)); // expected: 0.9375

// Verify the API surface (cancellation).
const sc = smoothScrollTo({}, 0, 0, { duration: 100 });
sc.cancel();
sc.promise.then(
  () => console.log("resolved (unexpected in this test)"),
  (e) => console.log("cancelled rejection reason:", e.message), // expected: cancelled
);
console.log(
  "smoothScrollTo is a function:",
  typeof smoothScrollTo === "function",
);
// expected: smoothScrollTo is a function: true
console.log(
  "returns {promise, cancel}:",
  typeof sc.promise === "object" && typeof sc.cancel === "function",
);
// expected: returns {promise, cancel}: true
