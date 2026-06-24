/**
 * _.unzip(array)
 *
 * The inverse of _.zip. Given an array of grouped elements, it creates an
 * array regrouping the elements to their pre-zip configuration. When the
 * grouped arrays are of unequal length, the result is padded with undefined
 * so every output array has the same length as the longest group.
 *
 * Approach:
 * - Find the maximum length among the inner arrays (the number of output
 *   arrays to produce).
 * - For each index i, build an output array by taking the i-th element of
 *   every group (undefined if missing).
 */

function unzip(array) {
  if (!Array.isArray(array) || array.length === 0) return [];
  // Treat each element of `array` as a group; coerce non-arrays to [].
  const groups = array.map((g) => (Array.isArray(g) ? g : []));
  const maxLen = groups.reduce((m, g) => Math.max(m, g.length), 0);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const group = [];
    for (const g of groups) {
      group.push(i < g.length ? g[i] : undefined);
    }
    result.push(group);
  }
  return result;
}

// --- Tests ---

console.log('unzip basic:', JSON.stringify(unzip([['a', 1, true], ['b', 2, false]]))); // expected: [["a","b"],[1,2],[true,false]]
console.log('unzip unequal:', JSON.stringify(unzip([['a', 'b', 'c'], [1, 2]]))); // expected: [["a",1],["b",2],["c",undefined]]
console.log('unzip inverse of zip:', JSON.stringify(unzip([['a', 1], ['b', 2]]))); // expected: [["a","b"],[1,2]]
console.log('unzip single group:', JSON.stringify(unzip([[1, 2, 3]]))); // expected: [[1],[2],[3]]
console.log('unzip empty:', JSON.stringify(unzip([]))); // expected: []
console.log('unzip three groups:', JSON.stringify(unzip([[1, 5], [2, 6], [3, 7], [4, 8]]))); // expected: [[1,2,3,4],[5,6,7,8]]
