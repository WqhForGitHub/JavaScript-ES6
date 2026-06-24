/**
 * 手写判断元素是否在可视区域内
 * Determine whether an element (or part of it) is currently within the viewport.
 *
 * Approach:
 * - Use `el.getBoundingClientRect()` to get viewport-relative coordinates.
 * - The viewport ranges from (0,0) to (viewportWidth, viewportHeight).
 * - "Fully in viewport" requires every edge to be inside:
 *     top >= 0 && left >= 0 && bottom <= vh && right <= vw
 * - "Partially in viewport" (default) only requires horizontal & vertical overlap:
 *     bottom >= 0 && top <= vh && right >= 0 && left <= vw
 * - Provide an optional `threshold` (0..1) that requires at least that fraction
 *   of the element's area to be visible.
 *
 * Browser-only; in Node the helpers return false.
 *
 * @param {Element} el
 * @param {{fully?:boolean, threshold?:number}} [opts]
 * @returns {boolean}
 */
function getViewportSize() {
  if (typeof window === 'undefined') return { w: 0, h: 0 };
  return {
    w: window.innerWidth || document.documentElement.clientWidth || 0,
    h: window.innerHeight || document.documentElement.clientHeight || 0,
  };
}

function isInViewport(el, opts = {}) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return false;
  const rect = el.getBoundingClientRect();
  const { w: vw, h: vh } = getViewportSize();

  if (opts.fully) {
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= vh && rect.right <= vw;
  }

  if (typeof opts.threshold === 'number' && opts.threshold > 0) {
    const visibleW = Math.max(0, Math.min(rect.right, vw) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    const visibleArea = visibleW * visibleH;
    const totalArea = (rect.width || 0) * (rect.height || 0);
    if (totalArea === 0) return false;
    return visibleArea / totalArea >= opts.threshold;
  }

  // Default: any overlap counts as "in viewport".
  return rect.bottom >= 0 && rect.top <= vh && rect.right >= 0 && rect.left <= vw;
}

// ---------- Test cases ----------
// Simulated rect-based tests using fake elements.
function fakeElWithRect(rect) {
  return { getBoundingClientRect: () => rect };
}

// Element fully inside an 800x600 viewport.
const inside = fakeElWithRect({ left: 10, top: 10, right: 100, bottom: 100, width: 90, height: 90 });
// Mock window for the test:
const origWindow = typeof window !== 'undefined' ? window : undefined;
const mockWindow = { innerWidth: 800, innerHeight: 600 };
globalThis.window = mockWindow;
globalThis.document = { documentElement: { clientWidth: 800, clientHeight: 600 } };

console.log('inside default:', isInViewport(inside)); // expected: true
console.log('inside fully:', isInViewport(inside, { fully: true })); // expected: true

// Element partially off-screen to the right.
const partial = fakeElWithRect({ left: 700, top: 10, right: 900, bottom: 100, width: 200, height: 90 });
console.log('partial default:', isInViewport(partial)); // expected: true
console.log('partial fully:', isInViewport(partial, { fully: true })); // expected: false
console.log('partial threshold 0.5:', isInViewport(partial, { threshold: 0.5 })); // expected: true (100px of 200 visible)
console.log('partial threshold 0.6:', isInViewport(partial, { threshold: 0.6 })); // expected: false

// Element completely above the viewport.
const above = fakeElWithRect({ left: 0, top: -200, right: 100, bottom: -100, width: 100, height: 100 });
console.log('above default:', isInViewport(above)); // expected: false
console.log('above fully:', isInViewport(above, { fully: true })); // expected: false

console.log('null element:', isInViewport(null)); // expected: false

// Restore.
if (origWindow === undefined) { delete globalThis.window; delete globalThis.document; }
