/**
 * _.isNumber(value)
 *
 * Checks if `value` is classified as a Number primitive or object. NaN is
 * considered a number. String-formatted numbers (like "123") are NOT
 * numbers.
 *
 * Approach:
 * - Return true for `typeof value === 'number'`.
 * - Also return true for Number object wrappers, detected by the
 *   `[object Number]` tag.
 */

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function isNumber(value) {
  return (
    typeof value === 'number' ||
    (isObjectLike(value) && Object.prototype.toString.call(value) === '[object Number]')
  );
}

// --- Tests ---

console.log('isNumber 3:', isNumber(3)); // true
console.log('isNumber Number(3):', isNumber(Number(3))); // true
console.log('isNumber new Number(3):', isNumber(new Number(3))); // true
console.log('isNumber NaN:', isNumber(NaN)); // true
console.log('isNumber Infinity:', isNumber(Infinity)); // true
console.log('isNumber string "3":', isNumber('3')); // false
console.log('isNumber null:', isNumber(null)); // false
console.log('isNumber undefined:', isNumber(undefined)); // false
console.log('isNumber true:', isNumber(true)); // false
console.log('isNumber object:', isNumber({ valueOf: () => 3 })); // false
console.log('isNumber array:', isNumber([3])); // false
