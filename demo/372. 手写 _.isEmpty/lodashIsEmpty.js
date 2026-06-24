/**
 * _.isEmpty(value)
 *
 * Checks if `value` is an empty object, collection, map, or set. Arrays,
 * strings, and array-like objects are empty if they have a length of 0.
 * Objects are empty if they have no own enumerable string keyed properties.
 * Map and Set are empty if their size is 0. Booleans, numbers, and (in
 * lodash) functions are considered empty; null/undefined are also empty.
 *
 * Approach:
 * - Return true for null/undefined and for non-object primitives (boolean,
 *   number) and functions.
 * - Map/Set: check `.size === 0`.
 * - Array-like (length is a valid index): check `length === 0`.
 * - Otherwise check `Object.keys(value).length === 0`.
 */

function isIndex(value) {
  return typeof value === 'number'
    ? value > -1 && value % 1 === 0 && value <= Number.MAX_SAFE_INTEGER
    : /^(0|[1-9]\d*)$/.test(String(value));
}

function isArrayLike(value) {
  return (
    value != null &&
    typeof value !== 'function' &&
    typeof value.length === 'number' &&
    isIndex(value.length)
  );
}

function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (isArrayLike(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object' || typeof value === 'function') {
    return Object.keys(value).length === 0;
  }
  return true;
}

// --- Tests ---

console.log('isEmpty null:', isEmpty(null)); // true
console.log('isEmpty undefined:', isEmpty(undefined)); // true
console.log('isEmpty true:', isEmpty(true)); // true
console.log('isEmpty number:', isEmpty(1)); // true
console.log('isEmpty empty array:', isEmpty([])); // true
console.log('isEmpty non-empty array:', isEmpty([1])); // false
console.log('isEmpty empty string:', isEmpty('')); // true
console.log('isEmpty non-empty string:', isEmpty('a')); // false
console.log('isEmpty empty object:', isEmpty({})); // true
console.log('isEmpty non-empty object:', isEmpty({ a: 1 })); // false
console.log('isEmpty empty map:', isEmpty(new Map())); // true
console.log('isEmpty non-empty map:', isEmpty(new Map([['a', 1]]))); // false
console.log('isEmpty empty set:', isEmpty(new Set())); // true
console.log('isEmpty non-empty set:', isEmpty(new Set([1]))); // false
console.log('isEmpty empty buffer:', isEmpty(Buffer.alloc(0))); // true
console.log('isEmpty array-like empty:', isEmpty({ length: 0 })); // true
console.log('isEmpty array-like non-empty:', isEmpty({ length: 1, 0: 'a' })); // false
console.log('isEmpty function:', isEmpty(function () {})); // true (no own props)
