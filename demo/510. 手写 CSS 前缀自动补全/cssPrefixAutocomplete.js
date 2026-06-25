/**
 * 手写 CSS 前缀自动补全
 * Given a CSS property (and optional value), return the first vendor-prefixed or
 * standard form the browser actually supports. Useful for applying experimental
 * properties safely.
 *
 * Approach:
 * - Build a candidate list: standard name + vendor-prefixed variants
 *   (Webkit, Moz, ms, O) in both camelCase (for `style[x]` assignment) and
 *   kebab-case (for `style.setProperty(x, v)`).
 * - Test each candidate by creating a throwaway element and assigning the value
 *   (or 'inherit' if no value supplied). The first candidate whose assignment
 *   "sticks" (returns a non-empty string) is the supported form.
 * - Return `{ prop (camel), propKebab, prefix }` or `null` when nothing supports it.
 *
 * Browser-only; in Node the helper returns null.
 *
 * @param {string} prop - CSS property name.
 * @param {string} [value] - Optional value to validate against.
 * @returns {{prop:string, propKebab:string, prefix:string}|null}
 */
const VENDOR_PREFIXES = ["", "Webkit", "Moz", "ms", "O"];

function toKebab(s) {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}
function toCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function cssPrefixAutocomplete(prop, value) {
  if (typeof document === "undefined") return null;
  const el = document.createElement("div");
  const baseCamel =
    /^[A-Z]/.test(prop) || prop.indexOf("-") === -1 ? prop : toCamel(prop);
  const testValue = value == null ? "inherit" : value;

  for (const prefix of VENDOR_PREFIXES) {
    const camel =
      prefix === ""
        ? baseCamel
        : prefix + baseCamel.charAt(0).toUpperCase() + baseCamel.slice(1);
    if (!(camel in el.style)) continue;
    if (value === undefined) {
      return {
        prop: camel,
        propKebab: toKebab(camel),
        prefix: prefix.toLowerCase(),
      };
    }
    el.style[camel] = "";
    el.style[camel] = testValue;
    if (el.style[camel] !== "") {
      return {
        prop: camel,
        propKebab: toKebab(camel),
        prefix: prefix.toLowerCase(),
      };
    }
  }
  return null;
}

// Helper that applies the supported form to an element.
function applyPrefixedStyle(el, prop, value) {
  const result = cssPrefixAutocomplete(prop, value);
  if (!result) return false;
  el.style[result.prop] = value;
  return true;
}

// ---------- Test cases ----------
// Simulated style prototype containing 'transform' and 'WebkitTransform'.
const supportedCamel = new Set([
  "transform",
  "WebkitTransform",
  "transition",
  "WebkitTransition",
  "color",
]);
const fakeElStyle = {};
const styleProxy = new Proxy(fakeElStyle, {
  has(t, p) {
    return supportedCamel.has(p);
  },
  set(t, p, v) {
    t[p] = supportedCamel.has(p) ? v : "";
    return true;
  },
  get(t, p) {
    return t[p];
  },
});
globalThis.document = {
  createElement: () => ({ style: styleProxy }),
};

console.log(
  "transform (no value):",
  JSON.stringify(cssPrefixAutocomplete("transform")),
);
// expected: {"prop":"transform","propKebab":"transform","prefix":""}
console.log(
  "transform with value:",
  JSON.stringify(cssPrefixAutocomplete("transform", "rotate(30deg)")),
);
// expected: {"prop":"transform","propKebab":"transform","prefix":""}
console.log(
  "unknown property:",
  cssPrefixAutocomplete("definitelyNotAProperty"),
);
// expected: null
console.log(
  "kebab input -> camel:",
  JSON.stringify(cssPrefixAutocomplete("transition", "opacity 1s")),
);
// expected: {"prop":"transition","propKebab":"transition","prefix":""}

// applyPrefixedStyle helper.
const targetEl = { style: styleProxy };
console.log(
  "applyPrefixedStyle transform:",
  applyPrefixedStyle(targetEl, "transform", "scale(2)"),
);
// expected: true
console.log("applied value:", targetEl.style.transform); // expected: scale(2)

delete globalThis.document;
console.log(
  "node env returns null:",
  cssPrefixAutocomplete("anything") === null,
);
// expected: true
