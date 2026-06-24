/**
 * _.sample(collection)
 *
 * Gets a random element from `collection`. Works on arrays, strings, and
 * objects (treated as collections of values).
 *
 * Approach:
 * - Convert the collection to an array of values.
 * - If the array is empty, return undefined.
 * - Otherwise pick a random index in [0, length) and return that value.
 */

function sample(collection) {
  if (collection == null) return undefined;

  let arr;
  if (Array.isArray(collection)) {
    arr = collection;
  } else if (typeof collection === 'string') {
    arr = collection.split('');
  } else if (typeof collection[Symbol.iterator] === 'function') {
    arr = Array.from(collection);
  } else {
    arr = Object.values(collection);
  }

  if (arr.length === 0) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// --- Tests ---

const nums = [1, 2, 3, 4, 5];

// Test 1: result is always a member of the array
const r1 = sample(nums);
console.log('sample in array:', nums.includes(r1)); // true

// Test 2: after many samples, every element appears at least once (statistical)
const seen = new Set();
for (let i = 0; i < 500; i++) seen.add(sample(nums));
console.log('sample covers all (probabilistic):', seen.size === 5); // true (very likely)

// Test 3: sample of a string returns a single character
const ch = sample('hello');
console.log('sample string is char:', typeof ch === 'string' && ch.length === 1 && 'hello'.includes(ch)); // true

// Test 4: sample of an object returns one of its values
const objSample = sample({ a: 10, b: 20, c: 30 });
console.log('sample object value:', [10, 20, 30].includes(objSample)); // true

// Test 5: edge cases
console.log('sample empty array:', sample([])); // undefined
console.log('sample null:', sample(null)); // undefined
console.log('sample single:', sample([99])); // 99
console.log('sample empty object:', sample({})); // undefined
