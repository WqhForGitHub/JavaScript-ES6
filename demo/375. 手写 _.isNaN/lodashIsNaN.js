/**
 * _.isNaN(value)
 *
 * Checks if `value` is NaN. Unlike the global `isNaN`, lodash's version
 * returns false for undefined and other non-number values that coerce to
 * NaN. It only returns true when value is actually the NaN number (or a
 * Number object wrapping NaN).
 *
 * Approach:
 * - Coerce to a number via `+value` (Number()) but first reject values
 *   whose type tag is not number-like. Lodash checks: if the value is an
 *   object that is not a Number wrapper, return false.
 * - A simpler faithful approach: return true only when `value !== value`
 *   AND value is a number (primitive or Number object).
 */

function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

function isNumber(value) {
  return (
    typeof value === "number" ||
    (isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object Number]")
  );
}

function isNaN(value) {
  // Number objects: unwrap with +value; primitives stay the same.
  return isNumber(value) && value !== +value;
}

// --- Tests ---

console.log("isNaN NaN:", isNaN(NaN)); // true
console.log("isNaN Number(NaN):", isNaN(new Number(NaN))); // true
console.log("isNaN undefined:", isNaN(undefined)); // false
console.log("isNaN null:", isNaN(null)); // false
console.log('isNaN string "NaN":', isNaN("NaN")); // false
console.log("isNaN empty string:", isNaN("")); // false
console.log("isNaN object:", isNaN({})); // false
console.log("isNaN array:", isNaN([1])); // false
console.log("isNaN number 5:", isNaN(5)); // false
console.log("isNaN Infinity:", isNaN(Infinity)); // false
console.log("isNaN true:", isNaN(true)); // false
