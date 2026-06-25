/**
 * _.invert(object)
 *
 * Creates an object composed of the inverted keys and values of `object`.
 * The original keys become values and the original values become keys.
 * If `object` contains duplicate values, later entries overwrite earlier
 * ones (matching lodash's behavior).
 *
 * Approach:
 * - Iterate over the object's own enumerable string-keyed properties.
 * - For each [key, value] pair, assign result[value] = key.
 * - Object keys are always coerced to strings, so numbers/booleans used as
 *   values naturally become string keys, just like lodash.
 */

function invert(object) {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[object[key]] = key;
    }
  }
  return result;
}

// --- Tests ---

console.log(invert({ a: 1, b: 2, c: 3 })); // { '1': 'a', '2': 'b', '3': 'c' }
console.log(invert({ name: "tom", age: 18 })); // { tom: 'name', '18': 'age' }
console.log(invert({ a: "x", b: "x" })); // { x: 'b' } (duplicate value -> later wins)
console.log(invert({})); // {}
console.log(invert({ 1: "one", 2: "two" })); // { one: '1', two: '2' }
console.log(invert({ a: true, b: false })); // { 'true': 'a', 'false': 'b' }

// Edge case: array-like object
console.log(invert({ 0: "a", 1: "b", length: 2 })); // { a: '0', b: '1', '2': 'length' }
