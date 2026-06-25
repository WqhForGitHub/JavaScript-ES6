/**
 * 手写水波纹点击效果
 * Attach Material-style ripple click effects to elements.
 *
 * Approach:
 * - `attachRipple(el, opts)` adds a 'pointerdown' (or 'mousedown' fallback)
 *   listener that creates a <span class="ripple"> absolutely positioned at
 *   the click coordinates, sized to cover the element, then animates scale
 *   from 0 -> 2 with opacity 1 -> 0 via CSS transition / keyframes.
 * - The element must be `position: relative; overflow: hidden;` (we set
 *   inline styles if missing).
 * - On 'pointerup'/'pointerleave' we start the fade-out; the span is removed
 *   on 'transitionend'.
 * - Return a detach function that removes all listeners.
 * - In Node we expose `createRippleSpan(x, y, size)` as a pure helper that
 *   computes the span geometry, so the math can be tested without a DOM.
 *
 * @param {HTMLElement} el
 * @param {{color?:string, duration?:number, className?:string}} [opts]
 * @returns {() => void} detach
 */
function attachRipple(el, opts = {}) {
  if (typeof document === "undefined") return () => {};
  const {
    color = "rgba(255,255,255,0.5)",
    duration = 600,
    className = "ripple",
  } = opts;

  // Ensure the host can clip the ripple.
  const originalPosition = el.style.position;
  const originalOverflow = el.style.overflow;
  const computedPosition =
    typeof window !== "undefined" &&
    typeof window.getComputedStyle === "function"
      ? window.getComputedStyle(el).position
      : el.style.position;
  if (!computedPosition || computedPosition === "static") {
    el.style.position = "relative";
  }
  el.style.overflow = "hidden";

  const spans = [];
  let activeSpan = null;

  function getCoords(e) {
    const rect = el.getBoundingClientRect();
    const x =
      (e.clientX != null ? e.clientX : e.touches?.[0]?.clientX) - rect.left;
    const y =
      (e.clientY != null ? e.clientY : e.touches?.[0]?.clientY) - rect.top;
    return { x, y, rect };
  }

  function onDown(e) {
    const { x, y, rect } = getCoords(e);
    const size = Math.max(rect.width, rect.height) * 2;
    const span = createRippleSpan(x, y, size, { color, duration, className });
    el.appendChild(span);
    spans.push(span);
    activeSpan = span;
    // Force reflow then start the expand animation.
    void span.offsetWidth;
    span.style.transform = "scale(1)";
    span.style.opacity = "0";
  }

  function onUp() {
    if (activeSpan) {
      activeSpan.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    }
  }

  function onTransitionEnd(e) {
    if (e.target && e.target.parentNode) {
      e.target.parentNode.removeChild(e.target);
      const i = spans.indexOf(e.target);
      if (i >= 0) spans.splice(i, 1);
    }
  }

  const downEvent =
    typeof window !== "undefined" && "PointerEvent" in window
      ? "pointerdown"
      : "mousedown";
  const upEvent =
    typeof window !== "undefined" && "PointerEvent" in window
      ? "pointerup"
      : "mouseup";

  el.addEventListener(downEvent, onDown);
  el.addEventListener(upEvent, onUp);
  el.addEventListener("transitionend", onTransitionEnd);

  return function detach() {
    el.removeEventListener(downEvent, onDown);
    el.removeEventListener(upEvent, onUp);
    el.removeEventListener("transitionend", onTransitionEnd);
    el.style.position = originalPosition;
    el.style.overflow = originalOverflow;
    spans.forEach((s) => s.parentNode && s.parentNode.removeChild(s));
    spans.length = 0;
  };
}

/**
 * Pure helper: build a ripple <span> with the correct geometry.
 * Exported for testing in Node.
 */
function createRippleSpan(x, y, size, opts = {}) {
  const {
    color = "rgba(255,255,255,0.5)",
    duration = 600,
    className = "ripple",
  } = opts;
  let span;
  if (typeof document !== "undefined") {
    span = document.createElement("span");
  } else {
    // Node fallback: a plain object shaped like a span.
    span = { tagName: "SPAN", style: {}, classList: { add() {} } };
  }
  span.className = className;
  span.style.position = "absolute";
  span.style.borderRadius = "50%";
  span.style.pointerEvents = "none";
  span.style.backgroundColor = color;
  span.style.width = size + "px";
  span.style.height = size + "px";
  span.style.left = x - size / 2 + "px";
  span.style.top = y - size / 2 + "px";
  span.style.transform = "scale(0)";
  span.style.opacity = "1";
  span.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  return span;
}

// ---------- Test cases ----------
// In Node we test the pure geometry helper.
const span = createRippleSpan(50, 30, 200, { color: "red", duration: 500 });
console.log("span width:", span.style.width); // expected: 200px
console.log("span height:", span.style.height); // expected: 200px
console.log("span left:", span.style.left); // expected: -50px  (50 - 100)
console.log("span top:", span.style.top); // expected: -70px  (30 - 100)
console.log("span bg:", span.style.backgroundColor); // expected: red
console.log("span transform start:", span.style.transform); // expected: scale(0)
console.log("span opacity start:", span.style.opacity); // expected: 1

// Geometry: ripple centred on click point.
const span2 = createRippleSpan(0, 0, 100);
console.log("centered left:", span2.style.left); // expected: -50px
console.log("centered top:", span2.style.top); // expected: -50px

// attachRipple in Node returns a noop detach immediately.
const detach = attachRipple({});
console.log(
  "attachRipple returns detach fn in node:",
  typeof detach === "function",
); // expected: true
detach();

// Simulated browser path.
globalThis.document = {
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      className: "",
      classList: { add() {}, remove() {} },
      appendChild() {},
      addEventListener() {},
      removeEventListener() {},
      get offsetWidth() {
        return 1;
      },
    };
  },
};
const el = {
  style: {},
  addEventListener() {},
  removeEventListener() {},
  getBoundingClientRect() {
    return { width: 100, height: 50, left: 0, top: 0 };
  },
};
const detach2 = attachRipple(el, { color: "blue" });
console.log("browser attach returns detach fn:", typeof detach2 === "function"); // expected: true
detach2();
delete globalThis.document;
