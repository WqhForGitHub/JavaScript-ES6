/**
 * 手写获取元素在页面中的绝对位置
 * Compute an element's absolute position relative to the whole document
 * (accounting for scroll offsets).
 *
 * Approach:
 * - Use `el.getBoundingClientRect()` to get the box relative to the viewport.
 * - Add `window.pageXOffset / pageYOffset` (scroll position) to translate
 *   viewport coordinates into document/absolute coordinates.
 * - Also account for `document.documentElement.clientLeft/Top` which can be
 *   non-zero when the document has a border (rare, but IE legacy).
 * - Returns `{ left, top, right, bottom, width, height }` in document coordinates.
 *
 * Browser-only; in Node the helper gracefully returns zeros.
 *
 * @param {Element} el - Target element.
 * @returns {{left:number,top:number,right:number,bottom:number,width:number,height:number}}
 */
function getAbsolutePosition(el) {
  const zero = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  if (!el || typeof el.getBoundingClientRect !== "function") return zero;

  const rect = el.getBoundingClientRect();
  const docEl = document.documentElement;
  const scrollLeft =
    window.pageXOffset || docEl.scrollLeft || document.body.scrollLeft || 0;
  const scrollTop =
    window.pageYOffset || docEl.scrollTop || document.body.scrollTop || 0;
  const clientLeft = docEl.clientLeft || 0;
  const clientTop = docEl.clientTop || 0;

  const left = rect.left + scrollLeft - clientLeft;
  const top = rect.top + scrollTop - clientTop;

  return {
    left,
    top,
    right: rect.right + scrollLeft - clientLeft,
    bottom: rect.bottom + scrollTop - clientTop,
    width: rect.width || el.offsetWidth,
    height: rect.height || el.offsetHeight,
  };
}

// Walk-up offsetParent variant: useful when getBoundingClientRect is unreliable.
function getAbsolutePositionByOffset(el) {
  const zero = { left: 0, top: 0 };
  if (!el) return zero;
  let left = 0,
    top = 0;
  let node = el;
  while (node) {
    left += node.offsetLeft || 0;
    top += node.offsetTop || 0;
    node = node.offsetParent;
  }
  return { left, top };
}

// ---------- Test cases ----------
// Browser usage (not run in Node):
//   const pos = getAbsolutePosition(document.querySelector('#box'));
//   console.log(pos.left, pos.top); // absolute document coords

console.log(
  "getAbsolutePosition is a function:",
  typeof getAbsolutePosition === "function",
);
// expected: getAbsolutePosition is a function: true
console.log("handles null:", JSON.stringify(getAbsolutePosition(null)));
// expected: handles null: {"left":0,"top":0,"right":0,"bottom":0,"width":0,"height":0}

// Verify offsetParent-walk variant with a fake DOM tree.
const fake = {
  offsetLeft: 10,
  offsetTop: 20,
  offsetParent: {
    offsetLeft: 100,
    offsetTop: 200,
    offsetParent: {
      offsetLeft: 1000,
      offsetTop: 2000,
      offsetParent: null,
    },
  },
};
const pos = getAbsolutePositionByOffset(fake);
console.log("walked offset sums:", pos.left, pos.top); // expected: 1110 2220
