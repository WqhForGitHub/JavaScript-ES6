/**
 * _.flatten(array)
 *
 * Flattens `array` a single level deep. Non-array values pass through, and
 * array elements are spread one level into the result.
 *
 * Approach:
 * - Use reduce + concat for a concise single-level flatten, or a for loop.
 * - Guard against null/undefined input.
 */

function flatten(array) {
  if (!Array.isArray(array)) return [];
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      for (const sub of item) {
        result.push(sub);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log('flatten one level:', JSON.stringify(flatten([1, [2, [3, [4]], 5]]))); // expected: [1,2,[3,[4]],5]
console.log('flatten already flat:', JSON.stringify(flatten([1, 2, 3]))); // expected: [1,2,3]
console.log('flatten nested arrays:', JSON.stringify(flatten([[1], [2, 3], [4, 5, 6]]))); // expected: [1,2,3,4,5,6]
console.log('flatten empty:', JSON.stringify(flatten([]))); // expected: []
console.log('flatten with nulls:', JSON.stringify(flatten([1, [null, undefined], 2]))); // expected: [1,null,undefined,2]
console.log('flatten non-array:', JSON.stringify(flatten(null))); // expected: []
