/**
 * _.difference(array, [values])
 *
 * Creates an array of `array` values not included in the other given arrays
 * using SameValueZero equality. The order of result values is determined by
 * the order they occur in `array`.
 *
 * Approach:
 * - Build a Set of excluded values from all the `values` arrays for O(1)
 *   lookups (values can be primitives; SameValueZero differs from === only
 *   for NaN, which Set handles correctly).
 * - Filter `array` keeping elements not in the exclusion set.
 */

function difference(array, ...values) {
  if (!Array.isArray(array)) return [];
  const excluded = new Set();
  for (const v of values) {
    if (Array.isArray(v)) {
      for (const item of v) excluded.add(item);
    }
  }
  const result = [];
  for (const item of array) {
    if (!excluded.has(item)) {
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log('difference basic:', JSON.stringify(difference([2, 1, 3, 1], [4, 2]))); // expected: [1,3,1]
console.log('difference multiple:', JSON.stringify(difference([1, 2, 3, 4], [2], [4]))); // expected: [1,3]
console.log('difference none excluded:', JSON.stringify(difference([1, 2, 3]))); // expected: [1,2,3]
console.log('difference all excluded:', JSON.stringify(difference([1, 2, 3], [1, 2, 3]))); // expected: []
console.log('difference with NaN:', JSON.stringify(difference([1, NaN, 2], [NaN]))); // expected: [1,2] (Set uses SameValueZero)
console.log('difference non-array first arg:', JSON.stringify(difference(null, [1]))); // expected: []
console.log('difference preserves order:', JSON.stringify(difference([3, 1, 4, 1, 5], [1, 5]))); // expected: [3,4]
