/**
 * _.isObject(value)
 *
 * Checks if `value` is the language type of Object. Returns true for plain
 * objects, arrays, functions (functions are objects in JS), regexps, dates,
 * errors, wrappers, etc. Returns false for null and for non-object
 * primitives (string, number, boolean, symbol, bigint, undefined).
 *
 * Approach:
 * - Use `typeof value === 'object'` OR `typeof value === 'function'`, then
 *   exclude null (whose typeof is 'object').
 */

function isObject(value) {
  const type = typeof value;
  return value != null && (type === "object" || type === "function");
}

// --- Tests ---

console.log("isObject {}:", isObject({})); // true
console.log("isObject []:", isObject([])); // true
console.log(
  "isObject function:",
  isObject(function () {}),
); // true
console.log(
  "isObject arrow:",
  isObject(() => {}),
); // true
console.log("isObject date:", isObject(new Date())); // true
console.log("isObject regexp:", isObject(/a/)); // true
console.log("isObject null:", isObject(null)); // false
console.log("isObject undefined:", isObject(undefined)); // false
console.log("isObject string:", isObject("abc")); // false
console.log("isObject number:", isObject(1)); // false
console.log("isObject boolean:", isObject(true)); // false
console.log("isObject symbol:", isObject(Symbol("s"))); // false
console.log("isObject bigint:", isObject(BigInt(1))); // false
console.log("isObject Number wrapper:", isObject(new Number(1))); // true
console.log("isObject String wrapper:", isObject(new String("a"))); // true
