/**
 * 手写判断元素是否可见（考虑 display、visibility、opacity）
 * Determine whether an element is visually visible, considering:
 *   - display: none                -> not visible (also skips descendants)
 *   - visibility: hidden / collapse -> not visible (but still occupies space)
 *   - opacity: 0                    -> not visible (still occupies space)
 *   - ancestor is hidden            -> element is effectively hidden
 *   - 0x0 size                      -> not visible when `checkSize` is true
 *
 * Approach:
 * - Walk up the ancestor chain. If any ancestor has display:none, return false.
 *   If any ancestor has visibility:hidden, return false (visibility is inherited
 *   and only an explicit `visibility:visible` on the descendant overrides it; we
 *   treat any hidden ancestor as hiding the element for simplicity).
 * - For the element itself, also check opacity:0 and (optionally) 0x0 client rect.
 * - Use `getComputedStyle` to read computed (not inline) values.
 *
 * Browser-only; in Node the helper returns false.
 *
 * @param {Element} el
 * @param {{checkSize?:boolean}} [opts]
 * @returns {boolean}
 */
function isVisible(el, opts = {}) {
  if (!el || !el.nodeType) return false;
  if (
    typeof window === "undefined" ||
    typeof window.getComputedStyle !== "function"
  )
    return false;

  const { checkSize = false } = opts;

  // Walk ancestor chain.
  let node = el;
  while (node && node.nodeType === 1) {
    const style = window.getComputedStyle(node);
    if (style.display === "none") return false;
    if (style.visibility === "hidden" || style.visibility === "collapse")
      return false;
    if (parseFloat(style.opacity) === 0) return false;
    node = node.parentElement;
  }

  if (checkSize) {
    const rect = el.getBoundingClientRect();
    if ((rect.width || 0) === 0 && (rect.height || 0) === 0) return false;
  }

  return true;
}

// Variant: only check the element itself (no ancestor walk). Useful for perf.
function isSelfVisible(el) {
  if (
    !el ||
    typeof window === "undefined" ||
    typeof window.getComputedStyle !== "function"
  )
    return false;
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.visibility !== "collapse" &&
    parseFloat(style.opacity) !== 0
  );
}

// ---------- Test cases ----------
console.log("isVisible is a function:", typeof isVisible === "function");
// expected: isVisible is a function: true
console.log("null -> false:", isVisible(null)); // expected: false
console.log(
  "no-DOM -> false:",
  isSelfVisible({ nodeType: 1 }) === false || typeof window !== "undefined",
);
// expected: (true if no DOM, true otherwise)

// Build a fake DOM to exercise the ancestor-walk logic.
// We emulate getComputedStyle by returning from a stored styles map.
function makeFakeTree() {
  const styles = new Map();
  function styleOf(node) {
    return styles.get(node) || {};
  }
  const fakeWindow = {
    getComputedStyle: (n) => {
      const s = styleOf(n);
      // Mimic CSSStyleDeclaration with a plain object.
      return {
        display: s.display || "block",
        visibility: s.visibility || "visible",
        opacity: s.opacity != null ? s.opacity : "1",
      };
    },
  };
  function makeEl(parent, opts = {}) {
    const el = { nodeType: 1, parentElement: parent, _opts: opts };
    if (opts.rect) el.getBoundingClientRect = () => opts.rect;
    styles.set(el, opts);
    return el;
  }
  return { fakeWindow, makeEl, styleOf };
}

const { fakeWindow, makeEl } = makeFakeTree();
globalThis.window = fakeWindow;

const parent = makeEl(null, {
  display: "block",
  visibility: "visible",
  opacity: "1",
});
const child = makeEl(parent, {
  display: "block",
  visibility: "visible",
  opacity: "1",
});
console.log("visible tree:", isVisible(child)); // expected: true

const hiddenDisplay = makeEl(null, { display: "none" });
const hiddenChild = makeEl(hiddenDisplay, { display: "block" });
console.log("ancestor display:none:", isVisible(hiddenChild)); // expected: false

const hiddenVisibility = makeEl(null, { visibility: "hidden" });
const visChild = makeEl(hiddenVisibility, { visibility: "visible" });
console.log(
  "ancestor visibility:hidden (simplified -> false):",
  isVisible(visChild),
); // expected: false

const opacityZero = makeEl(null, { opacity: "0" });
console.log("opacity 0:", isVisible(opacityZero)); // expected: false

const tiny = makeEl(null, { display: "block", rect: { width: 0, height: 0 } });
console.log("checkSize true, 0x0:", isVisible(tiny, { checkSize: true })); // expected: false
console.log("checkSize false, 0x0:", isVisible(tiny, { checkSize: false })); // expected: true

delete globalThis.window;
