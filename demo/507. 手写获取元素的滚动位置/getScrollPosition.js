/**
 * 手写获取元素的滚动位置
 * Get the current scroll position of an element (or the document/viewport).
 *
 * Approach:
 * - When called with no element (or `window`/`document`), return the document
 *   scroll position using `window.pageXOffset/pageYOffset` with fallbacks to
 *   `document.documentElement` and `document.body`.
 * - When called with an element, return its `scrollLeft` / `scrollTop`.
 * - Also returns useful derived fields: maxScrollX, maxScrollY, and the fraction
 *   scrolled (progress) along each axis.
 *
 * Browser-only; in Node returns zeros.
 *
 * @param {Element|Window|Document} [target] - Element, window, or document.
 * @returns {{left:number,top:number,maxScrollX:number,maxScrollY:number,progressX:number,progressY:number}}
 */
function getScrollPosition(target) {
  let left = 0,
    top = 0,
    maxScrollX = 0,
    maxScrollY = 0;

  if (!target || target === window || target === document) {
    if (typeof window !== "undefined") {
      left = window.pageXOffset || 0;
      top = window.pageYOffset || 0;
      if (typeof document !== "undefined") {
        const docEl = document.documentElement;
        const body = document.body;
        if (!left)
          left = (docEl && docEl.scrollLeft) || (body && body.scrollLeft) || 0;
        if (!top)
          top = (docEl && docEl.scrollTop) || (body && body.scrollTop) || 0;
        const scrollWidth =
          (docEl && docEl.scrollWidth) || (body && body.scrollWidth) || 0;
        const scrollHeight =
          (docEl && docEl.scrollHeight) || (body && body.scrollHeight) || 0;
        const clientWidth =
          (docEl && docEl.clientWidth) || window.innerWidth || 0;
        const clientHeight =
          (docEl && docEl.clientHeight) || window.innerHeight || 0;
        maxScrollX = Math.max(0, scrollWidth - clientWidth);
        maxScrollY = Math.max(0, scrollHeight - clientHeight);
      }
    }
  } else if (target.nodeType === 1) {
    left = target.scrollLeft || 0;
    top = target.scrollTop || 0;
    maxScrollX = Math.max(
      0,
      (target.scrollWidth || 0) - (target.clientWidth || 0),
    );
    maxScrollY = Math.max(
      0,
      (target.scrollHeight || 0) - (target.clientHeight || 0),
    );
  }

  return {
    left,
    top,
    maxScrollX,
    maxScrollY,
    progressX: maxScrollX > 0 ? left / maxScrollX : 0,
    progressY: maxScrollY > 0 ? top / maxScrollY : 0,
  };
}

// ---------- Test cases ----------
console.log(
  "getScrollPosition is a function:",
  typeof getScrollPosition === "function",
);
// expected: getScrollPosition is a function: true

// No-DOM environment returns zeros.
const pos = getScrollPosition();
console.log("no-DOM pos:", JSON.stringify(pos));
// expected: no-DOM pos: {"left":0,"top":0,"maxScrollX":0,"maxScrollY":0,"progressX":0,"progressY":0}

// Fake an element with scroll state.
const fakeEl = {
  nodeType: 1,
  scrollLeft: 50,
  scrollTop: 200,
  scrollWidth: 1000,
  scrollHeight: 2000,
  clientWidth: 500,
  clientHeight: 400,
};
const elPos = getScrollPosition(fakeEl);
console.log("element pos:", JSON.stringify(elPos));
// expected: element pos: {"left":50,"top":200,"maxScrollX":500,"maxScrollY":1600,"progressX":0.1,"progressY":0.125}
console.log("progressY fraction:", elPos.progressY); // expected: 0.125

// At-bottom element.
const bottom = {
  nodeType: 1,
  scrollLeft: 500,
  scrollTop: 1600,
  scrollWidth: 1000,
  scrollHeight: 2000,
  clientWidth: 500,
  clientHeight: 400,
};
const bp = getScrollPosition(bottom);
console.log("at bottom progress:", bp.progressX, bp.progressY); // expected: 1 1
