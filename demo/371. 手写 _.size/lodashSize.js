/**
 * _.size(collection)
 *
 * Gets the size of `collection` by returning its length for array-like
 * values (arrays, strings, and array-like objects with a numeric `length`),
 * the `.size` for Map/Set, or the number of own enumerable string keyed
 * properties for plain objects.
 *
 * Approach:
 * - null/undefined: return 0.
 * - Map/Set: return `.size`.
 * - Array-like (array, string, or object with valid numeric length): return
 *   `length`.
 * - Otherwise (plain object/function): return `Object.keys(value).length`.
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

function size(collection) {
  if (collection == null) return 0;
  if (collection instanceof Map || collection instanceof Set) {
    return collection.size;
  }
  if (isArrayLike(collection)) {
    return collection.length;
  }
  if (typeof collection === 'object' || typeof collection === 'function') {
    return Object.keys(collection).length;
  }
  return 0;
}

// --- Tests ---

console.log('size array:', size([1, 2, 3])); // expected: 3
console.log('size string:', size('pebbles')); // expected: 7
console.log('size object:', size({ a: 1, b: 2 })); // expected: 2
console.log('size map:', size(new Map([['a', 1], ['b', 2]]))); // expected: 2
console.log('size set:', size(new Set([1, 2, 3, 4]))); // expected: 4
console.log('size empty array:', size([])); // expected: 0
console.log('size empty object:', size({})); // expected: 0
console.log('size null:', size(null)); // expected: 0
console.log('size undefined:', size(undefined)); // expected: 0
console.log('size function (props):', size(function (a, b) {})); // expected: 0 (no own props)
console.log('size array-like:', size({ length: 5, 0: 'a' })); // expected: 5 (array-like length)
