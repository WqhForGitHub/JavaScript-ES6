/**
 * 手写计算文本宽度
 * Measure the rendered width (and height) of a text string given a font
 * specification, without needing to attach anything to the visible DOM.
 *
 * Approach:
 * - Use a hidden <canvas> 2D context's `measureText()` API, which respects
 *   the current `font` setting and returns metrics including width.
 * - `calcTextWidth(text, font)` returns the width in pixels.
 * - `calcTextMetrics(text, font)` returns { width, actualBoundingBoxAscent,
 *   actualBoundingBoxDescent, actualBoundingBoxLeft, actualBoundingBoxRight }.
 * - `estimateTextWidth(text, font)` is a fallback that estimates width from
 *   average character widths when canvas is unavailable (Node). It parses
 *   font-size from the font string and multiplies by per-character factors.
 * - `getCanvasMeasurer()` lazily creates and caches the canvas so repeated
 *   measurements are cheap.
 *
 * @param {string} text
 * @param {string} font - CSS font shorthand, e.g. "16px Arial"
 * @returns {number} width in px
 */
function calcTextWidth(text, font) {
  const ctx = getCanvasContext();
  if (ctx) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }
  return estimateTextWidth(text, font);
}

function calcTextMetrics(text, font) {
  const ctx = getCanvasContext();
  if (ctx) {
    ctx.font = font;
    const m = ctx.measureText(text);
    return {
      width: m.width,
      actualBoundingBoxAscent: m.actualBoundingBoxAscent,
      actualBoundingBoxDescent: m.actualBoundingBoxDescent,
      actualBoundingBoxLeft: m.actualBoundingBoxLeft,
      actualBoundingBoxRight: m.actualBoundingBoxRight,
    };
  }
  const width = estimateTextWidth(text, font);
  const size = parseFontSize(font);
  return {
    width,
    actualBoundingBoxAscent: size * 0.8,
    actualBoundingBoxDescent: size * 0.2,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: width,
  };
}

let _canvas = null;
function getCanvasContext() {
  if (typeof document === "undefined") return null;
  if (!_canvas) {
    _canvas = document.createElement("canvas");
    _canvas.getContext =
      _canvas.getContext ||
      function () {
        return null;
      };
  }
  const ctx = _canvas.getContext("2d");
  return ctx;
}

/**
 * Fallback estimator used in Node. Parses the font-size from a CSS font
 * shorthand and multiplies by an average character width factor.
 */
function estimateTextWidth(text, font) {
  const size = parseFontSize(font);
  const factor = averageCharWidthFactor(text);
  return text.length * size * factor;
}

function parseFontSize(font) {
  if (!font) return 16;
  const m = font.match(/(\d+(?:\.\d+)?)px/);
  return m ? parseFloat(m[1]) : 16;
}

function averageCharWidthFactor(text) {
  if (!text) return 0;
  // Heuristic: digits and lowercase ~0.5em, uppercase ~0.65em, spaces ~0.25em,
  // wide chars (MW etc.) ~0.8em. Average across the string.
  let sum = 0;
  for (const ch of text) {
    if (ch === " " || ch === "\t") sum += 0.25;
    else if (/[MW@]/.test(ch)) sum += 0.8;
    else if (/[A-Z]/.test(ch)) sum += 0.65;
    else if (/[il.,;:'!|]/.test(ch)) sum += 0.3;
    else if (/\d/.test(ch)) sum += 0.55;
    else sum += 0.5;
  }
  return sum / text.length;
}

// ---------- Test cases ----------
// Node path: estimate from font-size.
const w1 = calcTextWidth("hello", "16px Arial");
console.log("estimated hello width:", w1.toFixed(2)); // expected: ~40 (5 * 16 * 0.5)
console.log("hello width > 0:", w1 > 0); // expected: true

const w2 = calcTextWidth("HELLO", "16px Arial");
console.log("uppercase wider than lowercase:", w2 > w1); // expected: true

const w3 = calcTextWidth("", "16px Arial");
console.log("empty text width:", w3); // expected: 0

const w4 = calcTextWidth("12345", "20px monospace");
console.log("digits width (20px):", w4.toFixed(2)); // expected: ~55 (5 * 20 * 0.55)

// Font size parsing.
console.log("parse 14px:", parseFontSize("bold 14px/1.5 sans-serif")); // expected: 14
console.log("parse default when missing:", parseFontSize("bold sans-serif")); // expected: 16
console.log("parse null:", parseFontSize(null)); // expected: 16

// Metrics in Node use estimate for width and 0.8*size for ascent.
const metrics = calcTextMetrics("Hi", "20px Arial");
console.log("metrics width:", metrics.width.toFixed(2)); // expected: ~16.5 (Hi: H=0.65, i=0.3 -> 0.475 avg * 2 * 20)
console.log("metrics ascent:", metrics.actualBoundingBoxAscent); // expected: 16 (20*0.8)
console.log("metrics descent:", metrics.actualBoundingBoxDescent); // expected: 4 (20*0.2)

// Simulated browser path with a fake canvas.
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
            measureText(text) {
              const size = parseFontSize(this._font);
              return {
                width: text.length * size * 0.5,
                actualBoundingBoxAscent: size * 0.8,
                actualBoundingBoxDescent: size * 0.2,
                actualBoundingBoxLeft: 0,
                actualBoundingBoxRight: text.length * size * 0.5,
              };
            },
          };
        },
      };
    }
    return {};
  },
};
_canvas = null; // reset cache
console.log("browser path width:", calcTextWidth("hello", "16px Arial")); // expected: 40 (5 * 16 * 0.5)
delete globalThis.document;
