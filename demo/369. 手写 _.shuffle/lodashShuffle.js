/**
 * _.shuffle(collection)
 *
 * Creates an array of shuffled values, using a version of the Fisher-Yates
 * (a.k.a. Knuth) shuffle. Each element has an equal probability of appearing
 * in any position. Works on arrays and array-like/object collections.
 *
 * Approach:
 * - Copy the collection into an array (handling objects/strings too).
 * - Iterate from the end to the start; at each index i, pick a random index j
 *   in [0, i] and swap elements i and j.
 */

function shuffle(collection) {
  if (collection == null) return [];

  // Build a fresh array of values.
  let arr;
  if (Array.isArray(collection)) {
    arr = collection.slice();
  } else if (typeof collection === "string") {
    arr = collection.split("");
  } else if (typeof collection[Symbol.iterator] === "function") {
    arr = Array.from(collection);
  } else {
    arr = Object.values(collection);
  }

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

// --- Tests ---

// Test 1: shuffled array contains same elements (multiset equal)
const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sh = shuffle(input);
console.log(
  "shuffle same elements:",
  JSON.stringify(sh.slice().sort((a, b) => a - b)) === JSON.stringify(input),
); // true
console.log("shuffle original untouched:", JSON.stringify(input)); // expected: [1,2,3,4,5,6,7,8,9,10]
console.log("shuffle length preserved:", sh.length === input.length); // true

// Test 2: shuffle string
const strSh = shuffle("abc");
console.log(
  "shuffle string length:",
  strSh.length === 3 && strSh.slice().sort().join("") === "abc",
); // true

// Test 3: shuffle object collection
const objSh = shuffle({ a: 1, b: 2, c: 3 });
console.log(
  "shuffle object multiset:",
  JSON.stringify(objSh.slice().sort()) === JSON.stringify([1, 2, 3]),
); // true

// Test 4: edge cases
console.log("shuffle empty:", JSON.stringify(shuffle([]))); // expected: []
console.log("shuffle single:", JSON.stringify(shuffle([42]))); // expected: [42]
console.log("shuffle null:", JSON.stringify(shuffle(null))); // expected: []

// Test 5: distribution sanity (all values appear, length correct)
const big = Array.from({ length: 100 }, (_, i) => i);
const bigSh = shuffle(big);
const allPresent = big.every((v) => bigSh.includes(v));
console.log("shuffle big all present:", allPresent && bigSh.length === 100); // true
