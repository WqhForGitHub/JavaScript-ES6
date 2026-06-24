/**
 * _.isFunction(value)
 *
 * Checks if `value` is classified as a Function object. Includes regular
 * functions, arrow functions, generator functions, async functions, and
 * class constructors. Lodash also treats some host objects (like RegExp
 * exec in old environments) as functions; here we keep it to the language
 * tag check.
 *
 * Approach:
 * - The most reliable cross-environment test is `typeof value === 'function'`,
 *   which covers all native function subtypes. We additionally guard against
 *   the DOM NodeList/HTMLCollection edge cases by also confirming the
 *   `[object Function]` / Generator / AsyncFunction tag.
 */

function isFunction(value) {
  if (typeof value !== 'function') return false;
  // typeof is reliable for functions in modern environments; the tag check
  // additionally excludes any exotic callable host objects that report
  // 'function' but are not really Function instances.
  const tag = Object.prototype.toString.call(value);
  return (
    tag === '[object Function]' ||
    tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' ||
    tag === '[object AsyncGeneratorFunction]'
  );
}

// --- Tests ---

console.log('isFunction regular:', isFunction(function () {})); // true
console.log('isFunction arrow:', isFunction(() => {})); // true
console.log('isFunction generator:', isFunction(function* () { yield 1; })); // true
console.log('isFunction async:', isFunction(async () => {})); // true
console.log('isFunction class:', isFunction(class Foo {})); // true
console.log('isFunction Math.sin:', isFunction(Math.sin)); // true
console.log('isFunction object:', isFunction({})); // false
console.log('isFunction string:', isFunction('abc')); // false
console.log('isFunction number:', isFunction(1)); // false
console.log('isFunction null:', isFunction(null)); // false
console.log('isFunction undefined:', isFunction(undefined)); // false
console.log('isFunction array:', isFunction([])); // false
console.log('isFunction RegExp:', isFunction(/a/)); // false
