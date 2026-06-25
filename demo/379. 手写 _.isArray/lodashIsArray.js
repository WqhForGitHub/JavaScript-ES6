/**
 * _.isArray(value)
 *
 * Checks if `value` is classified as an Array object.
 *
 * Approach:
 * - In modern environments `Array.isArray` is the canonical, reliable check
 *   and correctly returns false for array-like objects, arguments objects
 *   (which are not arrays), and NodeLists. We delegate to it.
 */

function isArray(value) {
  return Array.isArray(value);
}

// --- Tests ---

console.log("isArray []:", isArray([])); // true
console.log("isArray [1,2,3]:", isArray([1, 2, 3])); // true
console.log("isArray new Array():", isArray(new Array(3))); // true
console.log("isArray Array.from:", isArray(Array.from("abc"))); // true
console.log("isArray object:", isArray({})); // false
console.log(
  "isArray array-like object:",
  isArray({ length: 2, 0: "a", 1: "b" }),
); // false
console.log(
  "isArray arguments:",
  isArray(
    (function () {
      return arguments;
    })(),
  ),
); // false
console.log("isArray string:", isArray("abc")); // false
console.log("isArray number:", isArray(1)); // false
console.log("isArray null:", isArray(null)); // false
console.log("isArray undefined:", isArray(undefined)); // false
console.log("isArray Map:", isArray(new Map())); // false
console.log("isArray Set:", isArray(new Set())); // false
console.log("isArray Int8Array:", isArray(new Int8Array(2))); // false (typed arrays are not Arrays)
