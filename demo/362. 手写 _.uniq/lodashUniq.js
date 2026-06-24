/**
 * _.uniq(array)
 *
 * Creates a duplicate-free version of an array in which only the first
 * occurrence of each value is kept, using SameValueZero equality.
 *
 * Approach:
 * - Use a Set to track seen values; push unseen values into the result in
 *   order. Set handles NaN with SameValueZero semantics.
 */

function uniq(array) {
  if (!Array.isArray(array)) return [];
  const seen = new Set();
  const result = [];
  for (const item of array) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log('uniq basic:', JSON.stringify(uniq([2, 1, 2, 3, 1, 4]))); // expected: [2,1,3,4]
console.log('uniq already unique:', JSON.stringify(uniq([1, 2, 3]))); // expected: [1,2,3]
console.log('uniq all same:', JSON.stringify(uniq([7, 7, 7]))); // expected: [7]
console.log('uniq empty:', JSON.stringify(uniq([]))); // expected: []
console.log('uniq with NaN:', JSON.stringify(uniq([1, NaN, 2, NaN, 1]))); // expected: [1,NaN,2]
console.log('uniq with objects (by ref):', JSON.stringify(uniq([{ a: 1 }, { a: 1 }]))); // expected: [{"a":1},{"a":1}] (distinct refs)
console.log('uniq non-array:', JSON.stringify(uniq('abc'))); // expected: []
console.log('uniq preserves order:', JSON.stringify(uniq([5, 3, 5, 1, 3, 2]))); // expected: [5,3,1,2]
