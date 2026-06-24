/**
 * _.zip([arrays])
 *
 * Creates an array of grouped elements, the first of which contains the
 * first elements of the given arrays, the second of which contains the
 * second elements of the given arrays, and so on. When the given arrays are
 * of unequal length, the shorter arrays are padded with undefined so every
 * group has as many entries as there were input arrays.
 *
 * Approach:
 * - Find the maximum length among the input arrays.
 * - For each index i in [0, maxLen), build a group by taking the i-th
 *   element of each input array (undefined if out of range).
 */

function zip(...arrays) {
  if (arrays.length === 0) return [];
  // Filter out non-arrays defensively
  const valid = arrays.filter(Array.isArray);
  const maxLen = valid.reduce((m, a) => Math.max(m, a.length), 0);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const group = [];
    for (const arr of valid) {
      group.push(i < arr.length ? arr[i] : undefined);
    }
    result.push(group);
  }
  return result;
}

// --- Tests ---

console.log('zip equal length:', JSON.stringify(zip(['a', 'b'], [1, 2], [true, false]))); // expected: [["a",1,true],["b",2,false]]
console.log('zip unequal length:', JSON.stringify(zip(['a', 'b', 'c'], [1, 2]))); // expected: [["a",1],["b",2],["c",undefined]]
console.log('zip single array:', JSON.stringify(zip([1, 2, 3]))); // expected: [[1],[2],[3]]
console.log('zip empty:', JSON.stringify(zip())); // expected: []
console.log('zip three arrays:', JSON.stringify(zip([1, 2], [3, 4], [5, 6]))); // expected: [[1,3,5],[2,4,6]]
console.log('zip empty arrays:', JSON.stringify(zip([], []))); // expected: []
console.log('zip with empty inner:', JSON.stringify(zip(['x'], [], ['y']))); // expected: [["x",undefined,"y"]]
