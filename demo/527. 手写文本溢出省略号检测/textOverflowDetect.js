/**
 * 手写文本溢出省略号检测
 * Detect whether a text node/element is being clipped by `text-overflow:
 * ellipsis` (or `overflow: hidden`), and optionally compute how many
 * characters fit before truncation.
 *
 * Approach:
 * - `isTextOverflowing(el)` compares `el.scrollWidth` against
 *   `el.clientWidth`. If scrollWidth > clientWidth the text is clipped.
 * - `getOverflowInfo(el)` returns { overflowing, scrollWidth, clientWidth,
 *   diff } for diagnostics.
 * - `fittingLength(el, fullText)` binary-searches the largest prefix of
 *   `fullText` whose measured width (via a clone) fits inside clientWidth,
 *   leaving room for the ellipsis character. Useful for custom truncation.
 * - `truncateToWidth(text, maxWidth, font)` is a pure helper that estimates
 *   the truncation point without a DOM, using canvas measureText when
 *   available (falls back to estimateTextWidth from calcTextWidth-style logic).
 * - Provide Node-testable pure variants.
 *
 * @param {HTMLElement} el
 * @returns {{overflowing:boolean, scrollWidth:number, clientWidth:number, diff:number}}
 */
function getOverflowInfo(el) {
  if (!el || typeof el.scrollWidth !== "number") {
    return { overflowing: false, scrollWidth: 0, clientWidth: 0, diff: 0 };
  }
  const scrollWidth = el.scrollWidth;
  const clientWidth = el.clientWidth;
  return {
    overflowing: scrollWidth > clientWidth,
    scrollWidth,
    clientWidth,
    diff: scrollWidth - clientWidth,
  };
}

function isTextOverflowing(el) {
  return getOverflowInfo(el).overflowing;
}

/**
 * Binary-search the longest prefix of `text` whose measured width fits
 * within `maxWidth` (leaving room for the ellipsis if `withEllipsis` is true).
 */
function truncateToWidth(text, maxWidth, font, withEllipsis = true) {
  if (!text) return "";
  const measure = (s) => measureWidth(s, font);
  if (measure(text) <= maxWidth) return text;

  const ellipsis = withEllipsis ? "\u2026" : "";
  const budget = maxWidth - (withEllipsis ? measure(ellipsis) : 0);
  if (budget <= 0) return ellipsis;

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(text.slice(0, mid)) <= budget) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
    if (lo === hi) break;
  }
  return text.slice(0, lo) + ellipsis;
}

function measureWidth(text, font) {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (ctx) {
      ctx.font = font || "16px sans-serif";
      return ctx.measureText(text).width;
    }
  }
  // Fallback estimator.
  return estimateWidth(text, font);
}

function estimateWidth(text, font) {
  const size = parseFontSize(font);
  let sum = 0;
  for (const ch of text) {
    if (ch === " " || ch === "\t") sum += 0.25;
    else if (/[MW@]/.test(ch)) sum += 0.8;
    else if (/[A-Z]/.test(ch)) sum += 0.65;
    else if (/[il.,;:'!|]/.test(ch)) sum += 0.3;
    else if (/\d/.test(ch)) sum += 0.55;
    else sum += 0.5;
  }
  return sum * size;
}

function parseFontSize(font) {
  if (!font) return 16;
  const m = font.match(/(\d+(?:\.\d+)?)px/);
  return m ? parseFloat(m[1]) : 16;
}

// ---------- Test cases ----------
// getOverflowInfo with a fake element.
const el1 = { scrollWidth: 200, clientWidth: 100 };
console.log("overflow info:", getOverflowInfo(el1));
// expected: { overflowing: true, scrollWidth: 200, clientWidth: 100, diff: 100 }
console.log("is overflowing:", isTextOverflowing(el1)); // expected: true

const el2 = { scrollWidth: 80, clientWidth: 100 };
console.log("fits:", isTextOverflowing(el2)); // expected: false

const el3 = { scrollWidth: 100, clientWidth: 100 };
console.log("exact fit not overflowing:", isTextOverflowing(el3)); // expected: false

// truncateToWidth (pure, Node fallback estimator).
// With 16px font, 'hello world' is ~ 11 chars * 16 * ~0.45 = ~79px.
const truncated = truncateToWidth("hello world this is long", 80, "16px Arial");
console.log("truncated result:", JSON.stringify(truncated)); // expected: short prefix + '…'
console.log("truncated ends with ellipsis:", truncated.endsWith("\u2026")); // expected: true
console.log("truncated shorter than full:", truncated.length < 26); // expected: true

// Already fits -> returned unchanged.
const fits = truncateToWidth("hi", 1000, "16px Arial");
console.log("fits unchanged:", fits); // expected: hi

// Very narrow budget -> just ellipsis.
const tiny = truncateToWidth("hello world", 1, "16px Arial");
console.log("tiny budget:", JSON.stringify(tiny)); // expected: '…'

// No ellipsis variant.
const noEllipsis = truncateToWidth("hello world", 30, "16px Arial", false);
console.log("no ellipsis ends without …:", !noEllipsis.endsWith("\u2026")); // expected: true
console.log("no ellipsis value:", JSON.stringify(noEllipsis)); // expected: short prefix with no ellipsis

// Simulated canvas path.
globalThis.document = {
  createElement(tag) {
    if (tag === "canvas") {
      return {
        getContext() {
          return {
            _font: "",
            set font(v) {
              this._font = v;
            },
            get font() {
              return this._font;
            },
            measureText(t) {
              const size = parseFontSize(this._font);
              return { width: t.length * size * 0.5 };
            },
          };
        },
      };
    }
    return {};
  },
};
// 'abcdef' at 16px = 6 * 16 * 0.5 = 48px. Budget for width=40 minus ellipsis(8) = 32 -> fits 4 chars.
const t = truncateToWidth("abcdef", 40, "16px monospace");
console.log("canvas truncated:", JSON.stringify(t)); // expected: 'abcd…'
console.log("canvas truncated length:", t.length); // expected: 5
delete globalThis.document;
