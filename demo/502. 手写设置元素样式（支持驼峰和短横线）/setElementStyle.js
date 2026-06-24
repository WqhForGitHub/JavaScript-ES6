/**
 * 手写设置元素样式（支持驼峰和短横线）
 * Set CSS styles on an element, accepting both camelCase and kebab-case property names.
 *
 * Approach:
 * - Normalize every property name to camelCase before assigning to `el.style[camel]`,
 *   because the CSSStyleDeclaration interface requires camelCase for JS property access.
 * - Support either an object of styles or a single (prop, value) pair.
 * - Numeric values for length-like properties are suffixed with 'px' unless the
 *   property is in a known unitless allowlist (opacity, zIndex, lineHeight, ...).
 * - Return the element for chaining.
 *
 * @param {Element} el - Target element.
 * @param {string|object} propOrObj - Property name (string) or styles object.
 * @param {string|number} [value] - Value when called as setStyle(el, prop, value).
 * @returns {Element} The element (for chaining).
 */
const UNITLESS_PROPS = new Set([
  'opacity', 'zIndex', 'z-index', 'fontWeight', 'font-weight', 'lineHeight', 'line-height',
  'zoom', 'flex', 'flexGrow', 'flex-grow', 'flexShrink', 'flex-shrink', 'order',
  'animationIterationCount', 'animation-iteration-count', 'columnCount', 'column-count',
]);

function toCamelCase(s) {
  // Handles 'background-color' -> 'backgroundColor'; leaves camelCase untouched.
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function normalizeValue(prop, value) {
  if (value == null || typeof value === 'string') return value == null ? '' : value;
  if (typeof value === 'number') {
    // Check both camel and kebab forms against the unitless set.
    const kebab = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    if (UNITLESS_PROPS.has(prop) || UNITLESS_PROPS.has(kebab)) return String(value);
    return value + 'px';
  }
  return String(value);
}

function setElementStyle(el, propOrObj, value) {
  if (!el || !el.style) return el;
  const apply = (camelProp, rawProp, val) => {
    el.style[camelProp] = normalizeValue(rawProp, val);
  };

  if (typeof propOrObj === 'string') {
    apply(toCamelCase(propOrObj), propOrObj, value);
  } else if (propOrObj && typeof propOrObj === 'object') {
    for (const key in propOrObj) {
      if (Object.prototype.hasOwnProperty.call(propOrObj, key)) {
        apply(toCamelCase(key), key, propOrObj[key]);
      }
    }
  }
  return el;
}

// Convenience: setStyle + getStyle-like read helper using inline style only.
function getElementInlineStyle(el, prop) {
  if (!el || !el.style) return '';
  return el.style[toCamelCase(prop)] || '';
}

// ---------- Test cases ----------
// Build a tiny fake element to verify logic without a DOM.
function fakeEl() {
  const style = {};
  return {
    style,
    set(k, v) { style[k] = v; },
    get style_() { return style; },
  };
}
// Real fake that mimics CSSStyleDeclaration object access.
function fakeDomEl() {
  const store = {};
  return {
    get style() {
      return new Proxy(store, {
        set(target, p, value) { target[p] = value; return true; },
        get(target, p) { return target[p]; },
      });
    },
  };
}

const el = fakeDomEl();
setElementStyle(el, 'background-color', 'red');
console.log('kebab prop set:', el.style.backgroundColor); // expected: red

setElementStyle(el, 'fontSize', 14);
console.log('numeric camel prop:', el.style.fontSize); // expected: 14px

setElementStyle(el, 'opacity', 0.5);
console.log('unitless prop:', el.style.opacity); // expected: 0.5

setElementStyle(el, 'z-index', 100);
console.log('z-index kebab unitless:', el.style.zIndex); // expected: 100

// Object form mixing camelCase + kebab-case.
setElementStyle(el, {
  marginTop: 8,
  'padding-left': '12px',
  lineHeight: 1.5,
});
console.log('object marginTop:', el.style.marginTop); // expected: 8px
console.log('object paddingLeft:', el.style.paddingLeft); // expected: 12px
console.log('object lineHeight:', el.style.lineHeight); // expected: 1.5

console.log('returns element for chaining:', setElementStyle(el, 'color', 'blue') === el); // expected: true
