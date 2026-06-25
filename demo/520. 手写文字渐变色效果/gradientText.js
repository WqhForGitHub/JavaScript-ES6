/**
 * 手写文字渐变色效果
 * Apply a CSS gradient to the visible text of an element.
 *
 * Approach:
 * - CSS technique: `background: linear-gradient(...); -webkit-background-clip:
 *   text; background-clip: text; color: transparent;` (plus the `-webkit-text-fill-color:
 *   transparent` fallback).
 * - `applyGradientText(el, gradient, opts)` writes these inline styles and
 *   returns a `clear()` function that restores the original values.
 * - Support linear-gradient and radial-gradient strings.
 * - Provide `makeLinearGradient(colors, angle)` and `makeRadialGradient(colors)`
 *   helpers to build the gradient string from a color array.
 * - Provide `applyGradient(el, colors, angle)` as a one-liner shortcut.
 * - In Node we record the style writes into a plain object so the behaviour
 *   can be verified.
 *
 * @param {HTMLElement} el
 * @param {string} gradient - e.g. "linear-gradient(90deg, #f00, #00f)"
 * @param {{repeat?:boolean}} [opts]
 * @returns {() => void} clear function
 */
function applyGradientText(el, gradient, opts = {}) {
  const { repeat = false } = opts;
  const bg = repeat ? `repeating-${gradient}` : gradient;

  const original = {
    backgroundImage: el.style?.backgroundImage,
    webkitBackgroundClip: el.style?.webkitBackgroundClip,
    backgroundClip: el.style?.backgroundClip,
    color: el.style?.color,
    webkitTextFillColor: el.style?.webkitTextFillColor,
  };

  setStyle(el, "backgroundImage", bg);
  setStyle(el, "webkitBackgroundClip", "text");
  setStyle(el, "backgroundClip", "text");
  setStyle(el, "color", "transparent");
  setStyle(el, "webkitTextFillColor", "transparent");

  return function clear() {
    setStyle(el, "backgroundImage", original.backgroundImage || "");
    setStyle(el, "webkitBackgroundClip", original.webkitBackgroundClip || "");
    setStyle(el, "backgroundClip", original.backgroundClip || "");
    setStyle(el, "color", original.color || "");
    setStyle(el, "webkitTextFillColor", original.webkitTextFillColor || "");
  };
}

function setStyle(el, prop, value) {
  if (el && el.style) el.style[prop] = value;
}

function makeLinearGradient(colors, angle = 90) {
  if (!Array.isArray(colors) || colors.length === 0) {
    return "linear-gradient(0deg, #000, #fff)";
  }
  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
}

function makeRadialGradient(colors) {
  if (!Array.isArray(colors) || colors.length === 0) {
    return "radial-gradient(#000, #fff)";
  }
  return `radial-gradient(${colors.join(", ")})`;
}

function applyGradient(el, colors, angle) {
  return applyGradientText(el, makeLinearGradient(colors, angle));
}

// ---------- Test cases ----------
// Node: use a plain object as a fake element with a `style` bag.
function fakeEl() {
  return { style: {} };
}

const el1 = fakeEl();
const clear1 = applyGradientText(
  el1,
  "linear-gradient(90deg, #ff0000, #0000ff)",
);
console.log("backgroundImage:", el1.style.backgroundImage); // expected: linear-gradient(90deg, #ff0000, #0000ff)
console.log("webkitBackgroundClip:", el1.style.webkitBackgroundClip); // expected: text
console.log("backgroundClip:", el1.style.backgroundClip); // expected: text
console.log("color:", el1.style.color); // expected: transparent
console.log("webkitTextFillColor:", el1.style.webkitTextFillColor); // expected: transparent

clear1();
console.log("after clear backgroundImage:", el1.style.backgroundImage); // expected: ''
console.log("after clear color:", el1.style.color); // expected: ''

// Gradient builders.
console.log("linear:", makeLinearGradient(["#f00", "#0f0", "#00f"], 45));
// expected: linear-gradient(45deg, #f00, #0f0, #00f)
console.log("radial:", makeRadialGradient(["#f00", "#00f"]));
// expected: radial-gradient(#f00, #00f)
console.log("empty linear fallback:", makeLinearGradient([], 0));
// expected: linear-gradient(0deg, #000, #fff)

// Shortcut.
const el2 = fakeEl();
applyGradient(el2, ["#722ed1", "#1890ff"], 180);
console.log("shortcut bg:", el2.style.backgroundImage); // expected: linear-gradient(180deg, #722ed1, #1890ff)

// Repeating variant.
const el3 = fakeEl();
applyGradientText(el3, "linear-gradient(90deg, #000 0 10px, #fff 10px 20px)", {
  repeat: true,
});
console.log("repeating bg:", el3.style.backgroundImage); // expected: repeating-linear-gradient(90deg, #000 0 10px, #fff 10px 20px)
