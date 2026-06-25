/**
 * _.chunk(array, [size=1])
 *
 * Creates an array of elements split into groups the length of `size`. If
 * `array` can't be split evenly, the final chunk will be the remaining
 * elements.
 *
 * Approach:
 * - Iterate the array in steps of `size`, slicing out each sub-array.
 * - Guard size to be a positive integer (default 1).
 */

function chunk(array, size = 1) {
  if (!Array.isArray(array)) return [];
  const step = Math.max(size < 0 ? 0 : Math.floor(size), 0);
  if (step === 0) return [];
  const result = [];
  for (let i = 0; i < array.length; i += step) {
    result.push(array.slice(i, i + step));
  }
  return result;
}

// --- Tests ---

console.log("chunk basic:", JSON.stringify(chunk(["a", "b", "c", "d"], 2))); // expected: [["a","b"],["c","d"]]
console.log(
  "chunk uneven:",
  JSON.stringify(chunk(["a", "b", "c", "d", "e"], 2)),
); // expected: [["a","b"],["c","d"],["e"]]
console.log("chunk size 1:", JSON.stringify(chunk([1, 2, 3], 1))); // expected: [[1],[2],[3]]
console.log("chunk larger than array:", JSON.stringify(chunk([1, 2, 3], 5))); // expected: [[1,2,3]]
console.log("chunk empty:", JSON.stringify(chunk([], 3))); // expected: []
console.log("chunk default size:", JSON.stringify(chunk([1, 2, 3]))); // expected: [[1],[2],[3]]
console.log("chunk size 3:", JSON.stringify(chunk([1, 2, 3, 4, 5, 6, 7], 3))); // expected: [[1,2,3],[4,5,6],[7]]
console.log("chunk non-array:", JSON.stringify(chunk(null, 2))); // expected: []
