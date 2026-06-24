/**
 * 手写获取元素相对于视口的位置
 * Compute an element's position relative to the browser viewport (no scroll added).
 *
 * Approach:
 * - Use `el.getBoundingClientRect()` which already returns coordinates relative
 *   to the viewport (the top-left of the visible area).
 * - Normalize the result into a plain object: { left, top, right, bottom, width, height }.
 * - For older browsers without width/height on the rect, fall back to offsetWidth/Height.
 * - Provide a convenience `isAboveViewport / isBelowViewport` helper set based on
 *   the returned rect.
 *
 * Browser-only; in Node the helper returns zeros.
 *
 * @param {Element} el
 * @returns {{left:number,top:number,right:number,bottom:number,width:number,height:number}}
 */
function getViewportPosition(el) {
  const zero = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  if (!el || typeof el.getBoundingClientRect !== 'function') return zero;

  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width != null ? rect.width : (el.offsetWidth || 0),
    height: rect.height != null ? rect.height : (el.offsetHeight || 0),
  };
}

function isAboveViewport(rect) { return rect.bottom < 0; }
function isBelowViewport(rect) {
  const vh = (typeof window !== 'undefined' ? window.innerHeight : 0) || 0;
  return rect.top > vh;
}
function isLeftOfViewport(rect) { return rect.right < 0; }
function isRightOfViewport(rect) {
  const vw = (typeof window !== 'undefined' ? window.innerWidth : 0) || 0;
  return rect.left > vw;
}

// ---------- Test cases ----------
console.log('getViewportPosition is a function:', typeof getViewportPosition === 'function');
// expected: getViewportPosition is a function: true
console.log('handles null:', JSON.stringify(getViewportPosition(null)));
// expected: handles null: {"left":0,"top":0,"right":0,"bottom":0,"width":0,"height":0}

// Verify viewport-relationship helpers with synthetic rects.
console.log('isAboveViewport {bottom:-10}:', isAboveViewport({ bottom: -10 })); // expected: true
console.log('isBelowViewport {top:1000} (vh=0):', isBelowViewport({ top: 1000 })); // expected: true
console.log('isLeftOfViewport {right:-5}:', isLeftOfViewport({ right: -5 })); // expected: true
console.log('isRightOfViewport {left:2000} (vw=0):', isRightOfViewport({ left: 2000 })); // expected: true

// Simulate getBoundingClientRect behaviour on a fake element.
const fakeEl = {
  getBoundingClientRect() {
    return { left: 50, top: 80, right: 250, bottom: 180, width: 200, height: 100 };
  },
  offsetWidth: 200,
  offsetHeight: 100,
};
const vp = getViewportPosition(fakeEl);
console.log('fake viewport pos:', JSON.stringify(vp));
// expected: fake viewport pos: {"left":50,"top":80,"right":250,"bottom":180,"width":200,"height":100}
