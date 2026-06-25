/**
 * 手写获取元素的计算样式（getComputedStyle 兼容版）
 * Cross-browser helper to read the computed style of an element.
 *
 * Approach:
 * - Prefer the standard `window.getComputedStyle(el, pseudoElt)`.
 * - Fall back to `el.currentStyle` (legacy IE) when the standard API is missing.
 * - Normalize property access: standard returns values with `getComputedStyle(el).getPropertyValue('background-color')`
 *   OR `getComputedStyle(el).backgroundColor`. IE currentStyle uses camelCase only,
 *   so we convert kebab-case to camelCase before reading.
 * - Returns the computed value as a string (or '' if unavailable).
 *
 * Browser-only; pure-JS shim is provided so it degrades gracefully when run in Node.
 *
 * @param {Element} el - Target element.
 * @param {string} prop - CSS property (kebab-case or camelCase).
 * @param {string} [pseudoElt] - Optional pseudo-element selector.
 * @returns {string} Computed value.
 */
function getComputedStyleCompat(el, prop, pseudoElt) {
  if (!el) return "";

  // Normalize property name to camelCase for fallback access.
  const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const camel =
    /^[A-Z]/.test(prop) || prop.indexOf("-") === -1 ? prop : toCamel(prop);
  const kebab =
    prop.indexOf("-") !== -1
      ? prop
      : prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

  if (
    typeof window !== "undefined" &&
    typeof window.getComputedStyle === "function"
  ) {
    const style = window.getComputedStyle(el, pseudoElt || null);
    // getPropertyValue expects kebab-case; direct index access accepts camelCase.
    return style.getPropertyValue(kebab) || style[camel] || "";
  }

  // Legacy IE fallback.
  if (el.currentStyle) {
    return el.currentStyle[camel] || "";
  }

  // Inline style fallback (not truly "computed").
  return el.style ? el.style[camel] || "" : "";
}

// Batch helper: read multiple properties at once to amortize layout.
function getComputedStylesCompat(el, props, pseudoElt) {
  const result = {};
  if (!el) return result;

  if (
    typeof window !== "undefined" &&
    typeof window.getComputedStyle === "function"
  ) {
    const style = window.getComputedStyle(el, pseudoElt || null);
    props.forEach((p) => {
      const camel =
        /^[A-Z]/.test(p) || p.indexOf("-") === -1
          ? p
          : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const kebab =
        p.indexOf("-") !== -1
          ? p
          : p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      result[p] = style.getPropertyValue(kebab) || style[camel] || "";
    });
    return result;
  }

  if (el.currentStyle) {
    props.forEach((p) => {
      const camel =
        /^[A-Z]/.test(p) || p.indexOf("-") === -1
          ? p
          : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      result[p] = el.currentStyle[camel] || "";
    });
    return result;
  }

  props.forEach((p) => {
    result[p] = "";
  });
  return result;
}

// ---------- Test cases ----------
// Browser example (won't run in Node):
//   const el = document.querySelector('#box');
//   console.log(getComputedStyleCompat(el, 'background-color')); // expected: rgb(...) or rgba(...)
//   console.log(getComputedStyleCompat(el, 'fontSize'));         // expected: e.g. "16px"

// Node: function existence + safe behavior with no DOM.
console.log(
  "getComputedStyleCompat is a function:",
  typeof getComputedStyleCompat === "function",
);
// expected: getComputedStyleCompat is a function: true
console.log(
  "returns empty for null el:",
  getComputedStyleCompat(null, "color") === "",
);
// expected: returns empty for null el: true
console.log(
  "batch helper is a function:",
  typeof getComputedStylesCompat === "function",
);
// expected: batch helper is a function: true

// Verify property name normalization logic.
const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
console.log("kebab -> camel:", toCamel("background-color")); // expected: backgroundColor
console.log("kebab -> camel (multi):", toCamel("border-top-left-radius")); // expected: borderTopLeftRadius
