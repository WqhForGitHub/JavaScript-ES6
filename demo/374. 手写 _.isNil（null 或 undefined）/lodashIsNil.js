/**
 * _.isNil(value)
 *
 * Checks if `value` is null or undefined.
 *
 * Approach:
 * - A simple equality check against null covers both null and undefined
 *   because `undefined == null` is true in JavaScript (loose equality).
 */

function isNil(value) {
  return value == null;
}

// --- Tests ---

console.log("isNil null:", isNil(null)); // true
console.log("isNil undefined:", isNil(undefined)); // true
console.log("isNil 0:", isNil(0)); // false
console.log("isNil empty string:", isNil("")); // false
console.log("isNil false:", isNil(false)); // false
console.log("isNil NaN:", isNil(NaN)); // false
console.log("isNil object:", isNil({})); // false
console.log("isNil array:", isNil([])); // false
console.log("isNil number:", isNil(123)); // false
console.log("isNil string:", isNil("null")); // false
