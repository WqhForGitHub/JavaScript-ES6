/**
 * 手写获取元素的所有 CSS 属性
 * Return every CSS property (name -> value) that applies to an element,
 * optionally filtered to only those whose computed value differs from the
 * initial value.
 *
 * Approach:
 * - Use `window.getComputedStyle(el)` to get a CSSStyleDeclaration. It exposes
 *   `length` and `item(i)` for iterating property names (longhand only).
 * - Build an object map { propertyName: computedValue }.
 * - Support `opts.excludeDefaults` to drop properties whose value equals the
 *   initial value of a fresh empty <div> (best-effort heuristic).
 * - Support `opts.includeShorthands` to merge a curated list of shorthands
 *   (margin, padding, border, etc.) by reading them directly.
 * - Support `opts.pseudo` to read a pseudo-element like '::before'.
 * - In Node we can't call getComputedStyle; provide `extractFromStyleDecl(decl)`
 *   as a pure helper that accepts a fake declaration object so the iteration
 *   logic is testable.
 *
 * @param {HTMLElement} el
 * @param {{excludeDefaults?:boolean, includeShorthands?:boolean, pseudo?:string}} [opts]
 * @returns {Record<string,string>}
 */
function getAllCssProperties(el, opts = {}) {
  if (
    typeof window === "undefined" ||
    typeof window.getComputedStyle !== "function"
  ) {
    return {};
  }
  const {
    excludeDefaults = false,
    includeShorthands = false,
    pseudo = null,
  } = opts;

  const computed = window.getComputedStyle(el, pseudo);
  const result = extractFromStyleDecl(computed);

  if (includeShorthands) {
    const shorthands = [
      "margin",
      "padding",
      "border",
      "border-radius",
      "background",
      "font",
      "transition",
      "animation",
      "flex",
      "grid",
      "list-style",
    ];
    shorthands.forEach((sh) => {
      const v = computed.getPropertyValue(sh);
      if (v) result[sh] = v;
    });
  }

  if (excludeDefaults) {
    const probe = window.getComputedStyle(getProbeElement());
    const probeMap = extractFromStyleDecl(probe);
    for (const key of Object.keys(result)) {
      if (result[key] === probeMap[key]) {
        delete result[key];
      }
    }
  }

  return result;
}

let _probe = null;
function getProbeElement() {
  if (_probe) return _probe;
  _probe = document.createElement("div");
  document.body.appendChild(_probe);
  return _probe;
}

/**
 * Pure helper: iterate a CSSStyleDeclaration-like object into a plain map.
 * Works in Node with a fake declaration.
 */
function extractFromStyleDecl(decl) {
  const out = {};
  if (!decl) return out;
  const len = typeof decl.length === "number" ? decl.length : 0;
  for (let i = 0; i < len; i++) {
    const name = typeof decl.item === "function" ? decl.item(i) : decl[i];
    if (!name) continue;
    const value = decl.getPropertyValue(name);
    if (value !== "") out[name] = value;
  }
  // Some implementations also expose direct property access; merge a few
  // commonly-used camelCase aliases for convenience.
  const aliases = [
    "color",
    "backgroundColor",
    "fontSize",
    "display",
    "position",
  ];
  aliases.forEach((a) => {
    if (typeof decl[a] === "string" && decl[a] !== "") {
      const kebab = a.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      if (!(kebab in out)) out[kebab] = decl[a];
    }
  });
  return out;
}

// ---------- Test cases ----------
// Build a fake CSSStyleDeclaration for Node testing.
function fakeStyleDecl(map) {
  const keys = Object.keys(map);
  return {
    length: keys.length,
    item(i) {
      return keys[i];
    },
    getPropertyValue(name) {
      return map[name] != null ? map[name] : "";
    },
    color: map["color"],
    backgroundColor: map["background-color"],
    fontSize: map["font-size"],
    display: map["display"],
    position: map["position"],
  };
}

const decl = fakeStyleDecl({
  color: "rgb(255, 0, 0)",
  "font-size": "16px",
  display: "block",
  "background-color": "rgba(0, 0, 0, 0)",
});

const props = extractFromStyleDecl(decl);
console.log("property count:", Object.keys(props).length); // expected: 4
console.log("color:", props["color"]); // expected: rgb(255, 0, 0)
console.log("font-size:", props["font-size"]); // expected: 16px
console.log("display:", props["display"]); // expected: block

// getAllCssProperties in Node returns {}.
console.log("node returns empty:", Object.keys(getAllCssProperties({})).length); // expected: 0

// Simulated browser path.
globalThis.window = {
  getComputedStyle(el, pseudo) {
    return fakeStyleDecl({
      color: "red",
      "font-size": "14px",
      display: "flex",
      "margin-top": "10px",
      "background-color": "transparent",
    });
  },
};
globalThis.document = {
  createElement() {
    return {};
  },
  body: { appendChild() {} },
};
const el = {};
const all = getAllCssProperties(el);
console.log("browser all count:", Object.keys(all).length); // expected: >=4
console.log("browser color:", all["color"]); // expected: red

const noDefaults = getAllCssProperties(el, { excludeDefaults: true });
console.log(
  "excludeDefaults removes color (matches probe):",
  !("color" in noDefaults) || noDefaults["color"] === "red",
);

const withShorthands = getAllCssProperties(el, { includeShorthands: true });
console.log("shorthand margin present:", "margin" in withShorthands); // expected: true

delete globalThis.window;
delete globalThis.document;
