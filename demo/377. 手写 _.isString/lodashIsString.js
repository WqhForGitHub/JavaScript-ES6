/**
 * _.isString(value)
 *
 * Checks if `value` is classified as a String primitive or object.
 *
 * Approach:
 * - Return true for `typeof value === 'string'`.
 * - Also return true for String object wrappers, detected by the
 *   `[object String]` tag.
 */

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function isString(value) {
  return (
    typeof value === 'string' ||
    (isObjectLike(value) && Object.prototype.toString.call(value) === '[object String]')
  );
}

// --- Tests ---

console.log('isString "abc":', isString('abc')); // true
console.log('isString empty:', isString('')); // true
console.log('isString String("abc"):', isString(String('abc'))); // true
console.log('isString new String("abc"):', isString(new String('abc'))); // true
console.log('isString 123:', isString(123)); // false
console.log('isString null:', isString(null)); // false
console.log('isString undefined:', isString(undefined)); // false
console.log('isString true:', isString(true)); // false
console.log('isString array:', isString(['a'])); // false
console.log('isString object:', isString({ toString: () => 'abc' })); // false
console.log('isString template literal:', isString(`template ${1}`)); // true
