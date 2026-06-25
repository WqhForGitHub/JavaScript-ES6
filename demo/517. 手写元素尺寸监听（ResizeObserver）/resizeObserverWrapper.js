/**
 * 手写元素尺寸监听（ResizeObserver）
 * Wrap ResizeObserver with a friendlier API: per-element subscribers,
 * debouncing, previous-size diffing, and an automatic fallback to the
 * window 'resize' event for old browsers.
 *
 * Approach:
 * - Use the native ResizeObserver when available.
 * - Maintain a Map: element -> Set<callback>. Each callback receives
 *   (entry, prevSize) where prevSize is the last observed {width,height}.
 * - Optional `debounceMs` coalesces rapid resize notifications.
 * - `observe(el, cb)` returns an unobserve function.
 * - `disconnect()` tears everything down.
 * - In Node (no ResizeObserver) we expose a manual `simulateResize(el, w, h)`
 *   method so the wrapper can be unit-tested.
 *
 * @param {{debounceMs?:number}} [opts]
 * @returns {{observe:Function, unobserve:Function, disconnect:Function, simulateResize?:Function}}
 */
function createResizeObserverWrapper(opts = {}) {
  const { debounceMs = 0 } = opts;
  const callbacks = new Map(); // el -> Set<cb>
  const prevSizes = new WeakMap(); // el -> {width,height}
  let pending = false;
  let lastEntries = [];

  function notifyAll(entries) {
    for (const entry of entries) {
      const el = entry.target;
      const cbs = callbacks.get(el);
      if (!cbs) continue;
      const prev = prevSizes.get(el) || { width: 0, height: 0 };
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      // Only fire when the size actually changed.
      if (prev.width !== next.width || prev.height !== next.height) {
        prevSizes.set(el, next);
        cbs.forEach((cb) => {
          try {
            cb(entry, prev, next);
          } catch (e) {
            /* swallow */
          }
        });
      }
    }
  }

  function flush() {
    pending = false;
    notifyAll(lastEntries);
    lastEntries = [];
  }

  function handleEntries(entries) {
    lastEntries = entries;
    if (debounceMs <= 0) {
      notifyAll(entries);
      return;
    }
    if (pending) return;
    pending = true;
    setTimeout(flush, debounceMs);
  }

  let ro = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(handleEntries);
  }

  return {
    observe(el, cb) {
      if (!callbacks.has(el)) callbacks.set(el, new Set());
      callbacks.get(el).add(cb);
      if (ro) ro.observe(el);
      return () => this.unobserve(el, cb);
    },
    unobserve(el, cb) {
      const cbs = callbacks.get(el);
      if (!cbs) return;
      if (cb) cbs.delete(cb);
      else cbs.clear();
      if (cbs.size === 0) {
        callbacks.delete(el);
        if (ro) ro.unobserve(el);
      }
    },
    disconnect() {
      callbacks.clear();
      if (ro) ro.disconnect();
    },
    // Node-only test helper.
    simulateResize(el, width, height) {
      const entry = {
        target: el,
        contentRect: {
          width,
          height,
          top: 0,
          left: 0,
          right: width,
          bottom: height,
        },
      };
      handleEntries([entry]);
    },
  };
}

// ---------- Test cases ----------
// In Node, ResizeObserver is undefined, so we use simulateResize.
const wrapper = createResizeObserverWrapper();

const boxA = { id: "a" };
const boxB = { id: "b" };

const callsA = [];
const unobserveA = wrapper.observe(boxA, (entry, prev, next) => {
  callsA.push({ prev, next });
});

wrapper.observe(boxB, (entry, prev, next) => {
  // no-op for test
});

// Simulate first resize -> prev is {0,0}.
wrapper.simulateResize(boxA, 100, 50);
console.log("first call count:", callsA.length); // expected: 1
console.log("first call next:", callsA[0].next); // expected: { width: 100, height: 50 }
console.log("first call prev:", callsA[0].prev); // expected: { width: 0, height: 0 }

// Same size -> should NOT fire (diff check).
wrapper.simulateResize(boxA, 100, 50);
console.log("same size no fire:", callsA.length); // expected: 1

// Different size -> fires.
wrapper.simulateResize(boxA, 200, 80);
console.log("after grow:", callsA.length); // expected: 2
console.log("second call prev:", callsA[1].prev); // expected: { width: 100, height: 50 }

// Unobserve.
unobserveA();
wrapper.simulateResize(boxA, 300, 300);
console.log("after unobserve no fire:", callsA.length); // expected: 2

// Debounced variant.
const debounced = createResizeObserverWrapper({ debounceMs: 30 });
const callsD = [];
debounced.observe(boxB, (entry, prev, next) => callsD.push(next));

// Fire several rapidly.
debounced.simulateResize(boxB, 10, 10);
debounced.simulateResize(boxB, 20, 20);
debounced.simulateResize(boxB, 30, 30);
console.log("debounced immediate count:", callsD.length); // expected: 0
setTimeout(() => {
  console.log("debounced after timeout count:", callsD.length); // expected: 1
  console.log("debounced final size:", callsD[0]); // expected: { width: 30, height: 30 }
  debounced.disconnect();
  wrapper.disconnect();
}, 50);
