/**
 * _.findIndex(array, [predicate=_.identity], [fromIndex=0])
 *
 * Like _.find but returns the index of the first element for which
 * `predicate` returns truthy, or -1 if none match. Supports the same
 * predicate shorthand forms as _.find (function, object, [key, value],
 * string/number).
 *
 * Approach:
 * - Resolve the predicate shorthand.
 * - Loop from `fromIndex` to the end, returning the index of the first match.
 */

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function deepMatch(actual, expected) {
  if (actual === expected) return true;
  if (typeof actual !== typeof expected) return false;
  if (!isObjectLike(actual) || !isObjectLike(expected)) return actual === expected;
  for (const key of Object.keys(expected)) {
    if (!Object.prototype.hasOwnProperty.call(actual, key)) return false;
    if (!deepMatch(actual[key], expected[key])) return false;
  }
  return true;
}

function getIteratee(predicate) {
  if (typeof predicate === 'function') return predicate;
  if (Array.isArray(predicate)) return (obj) => obj != null && obj[predicate[0]] === predicate[1];
  if (isObjectLike(predicate)) {
    return (obj) => obj != null && deepMatch(obj, predicate);
  }
  if (typeof predicate === 'string' || typeof predicate === 'number') {
    return (obj) => obj != null && obj[predicate];
  }
  return (obj) => obj;
}

function findIndex(array, predicate, fromIndex = 0) {
  if (!Array.isArray(array)) return -1;
  const iteratee = getIteratee(predicate);
  const start = Math.max(fromIndex, 0);
  for (let i = start; i < array.length; i++) {
    if (iteratee(array[i], i, array)) return i;
  }
  return -1;
}

// --- Tests ---

const users = [
  { user: 'barney', age: 36, active: true },
  { user: 'fred', age: 40, active: false },
  { user: 'pebbles', age: 1, active: true },
];

console.log('findIndex predicate:', findIndex(users, (o) => o.age < 40)); // expected: 0
console.log('findIndex object shorthand:', findIndex(users, { age: 1, active: true })); // expected: 2
console.log('findIndex array shorthand:', findIndex(users, ['active', false])); // expected: 1
console.log('findIndex string shorthand:', findIndex(users, 'active')); // expected: 0
console.log('findIndex fromIndex:', findIndex(users, 'active', 1)); // expected: 2
console.log('findIndex none:', findIndex(users, { user: 'nope' })); // expected: -1
console.log('findIndex numbers:', findIndex([10, 20, 30, 40], (n) => n > 25)); // expected: 2
