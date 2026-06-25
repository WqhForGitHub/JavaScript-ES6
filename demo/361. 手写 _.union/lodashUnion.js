/**
 * _.union([arrays])
 *
 * Creates an array of unique values, in order, from all given arrays using
 * SameValueZero equality. The first occurrence of each value across all
 * arrays is kept.
 *
 * Approach:
 * - Concatenate all arrays and dedupe with a Set, preserving first-seen order.
 */

function union(...arrays) {
  const seen = new Set();
  const result = [];
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
  }
  return result;
}

// --- Tests ---

console.log("union basic:", JSON.stringify(union([2], [1, 2], [2, 3]))); // expected: [2,1,3]
console.log("union no overlap:", JSON.stringify(union([1, 2], [3, 4], [5]))); // expected: [1,2,3,4,5]
console.log(
  "union with duplicates:",
  JSON.stringify(union([1, 1, 2], [2, 2, 3], [3, 3, 1])),
); // expected: [1,2,3]
console.log("union with NaN:", JSON.stringify(union([1, NaN], [NaN, 2]))); // expected: [1,NaN,2]
console.log("union empty args:", JSON.stringify(union())); // expected: []
console.log(
  "union mixed valid/invalid:",
  JSON.stringify(union([1, 2], null, [3])),
); // expected: [1,2,3]
console.log(
  "union preserves first order:",
  JSON.stringify(union([3, 1, 2], [2, 1, 3])),
); // expected: [3,1,2]
