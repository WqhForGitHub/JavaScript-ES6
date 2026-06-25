/**
 * _.flattenDeep(array)
 *
 * Recursively flattens `array` to its full depth.
 *
 * Approach:
 * - Walk each element; if it is an array, recurse and spread; otherwise push.
 * - Use Array.isArray to detect array-ness at each level.
 */

function flattenDeep(array) {
  if (!Array.isArray(array)) return [];
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      const nested = flattenDeep(item);
      for (const sub of nested) {
        result.push(sub);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log(
  "flattenDeep deeply nested:",
  JSON.stringify(flattenDeep([1, [2, [3, [4]], 5]])),
); // expected: [1,2,3,4,5]
console.log(
  "flattenDeep all arrays:",
  JSON.stringify(flattenDeep([[[[1]]], [[2]], [3]])),
); // expected: [1,2,3]
console.log(
  "flattenDeep already flat:",
  JSON.stringify(flattenDeep([1, 2, 3])),
); // expected: [1,2,3]
console.log("flattenDeep empty:", JSON.stringify(flattenDeep([]))); // expected: []
console.log(
  "flattenDeep mixed types:",
  JSON.stringify(flattenDeep([1, ["a", ["b", [true, null]]], 2])),
); // expected: [1,"a","b",true,null,2]
console.log("flattenDeep non-array:", JSON.stringify(flattenDeep("nope"))); // expected: []
