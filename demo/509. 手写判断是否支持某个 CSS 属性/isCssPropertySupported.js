/**
 * 手写判断是否支持某个 CSS 属性
 * Detect whether a CSS property (and optionally a value) is supported by the browser.
 *
 * Approach:
 * - Use the standard `CSS.supports(prop, value)` / `CSS.supports('prop: value')`
 *   when available (modern browsers).
 * - Fall back to creating a throwaway element and checking that the property is
 *   retained after assignment to `style` — if the browser discards an unknown
 *   property, the assignment leaves an empty string.
 * - For property-name-only checks, also accept the property appearing in the
 *   prototype of CSSStyleDeclaration as a known name.
 *
 * Browser-only; in Node the helper returns false.
 *
 * @param {string} prop - CSS property name (camelCase or kebab-case).
 * @param {string} [value] - Optional value to test.
 * @returns {boolean}
 */
function isCssPropertySupported(prop, value) {
  // CSS.supports API (preferred).
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    if (value !== undefined) {
      return CSS.supports(prop, value);
    }
    // Some browsers support CSS.supports(prop) only with a condition string.
    try {
      if (CSS.supports(prop)) return true;
    } catch (e) { /* fall through */ }
    try {
      return CSS.supports(prop + ': initial');
    } catch (e) { /* fall through */ }
  }

  if (typeof document === 'undefined') return false;

  const el = document.createElement('div');
  const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  // If the property exists on the style prototype, it's known.
  if (camel in el.style) {
    if (value === undefined) return true;
    // Try assigning the value; the browser keeps it only if it's valid.
    el.style[camel] = value;
    return el.style[camel] !== '';
  }

  // Vendor-prefixed attempt.
  const prefixes = ['Webkit', 'Moz', 'ms', 'O'];
  for (const p of prefixes) {
    const prefixed = p + camel.charAt(0).toUpperCase() + camel.slice(1);
    if (prefixed in el.style) {
      if (value === undefined) return true;
      el.style[prefixed] = value;
      return el.style[prefixed] !== '';
    }
  }

  return false;
}

// Batch helper: test many properties.
function areCssPropertiesSupported(props) {
  const result = {};
  props.forEach((p) => {
    if (typeof p === 'string') result[p] = isCssPropertySupported(p);
    else result[p.prop] = isCssPropertySupported(p.prop, p.value);
  });
  return result;
}

// ---------- Test cases ----------
console.log('isCssPropertySupported is a function:', typeof isCssPropertySupported === 'function');
// expected: isCssPropertySupported is a function: true

// In Node (no CSS/document), the helper returns false.
console.log('node env returns false:', isCssPropertySupported('display') === false || typeof CSS !== 'undefined');
// expected: true (no CSS API in Node)

// Simulate a browser-like environment to exercise the style-prototype fallback.
const fakeElStyle = { display: '', color: '', grid: '' };
const fakeDoc = {
  createElement: () => ({ style: new Proxy(fakeElStyle, {
    set(t, p, v) { t[p] = (p in t) ? v : ''; return true; },
    get(t, p) { return t[p]; },
  }) }),
};
globalThis.document = fakeDoc;
// Note: CSS global is still undefined here, so we hit the fallback path.
console.log('display supported (fake DOM):', isCssPropertySupported('display')); // expected: true
console.log('color supported (fake DOM):', isCssPropertySupported('color')); // expected: true
console.log('unknownProp supported (fake DOM):', isCssPropertySupported('totallyUnknown')); // expected: false
console.log('display:flex supported (fake DOM):', isCssPropertySupported('display', 'flex')); // expected: true (proxy keeps value)

const batch = areCssPropertiesSupported(['display', { prop: 'color', value: 'red' }, 'nope']);
console.log('batch:', JSON.stringify(batch));
// expected: batch: {"display":true,"color":true,"nope":false}
delete globalThis.document;
