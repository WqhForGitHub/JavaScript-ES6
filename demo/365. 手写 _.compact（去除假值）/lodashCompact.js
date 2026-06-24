/**
 * _.compact(array)
 *
 * Creates an array with all falsey values removed. The values false, null,
 * 0, "", undefined, and NaN are falsey.
 *
 * Approach:
 * - Filter the array with the truthy check `if (item)` so all six falsey
 *   values (including NaN) are dropped.
 */

function compact(array) {
  if (!Array.isArray(array)) return [];
  const result = [];
  for (const item of array) {
    if (item) {
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log('compact mixed:', JSON.stringify(compact([0, 1, false, 2, '', 3, null, undefined, NaN]))); // expected: [1,2,3]
console.log('compact all truthy:', JSON.stringify(compact([1, 2, 3, 'a', true]))); // expected: [1,2,3,"a",true]
console.log('compact all falsey:', JSON.stringify(compact([0, false, null, '', undefined, NaN]))); // expected: []
console.log('compact empty:', JSON.stringify(compact([]))); // expected: []
console.log('compact keeps zero-string "0":', JSON.stringify(compact(['0', 'false']))); // expected: ["0","false"] (non-empty strings are truthy)
console.log('compact non-array:', JSON.stringify(compact(null))); // expected: []
console.log('compact keeps objects:', JSON.stringify(compact([{}, [], 0, { a: 1 }]))); // expected: [{},[],{"a":1}]
