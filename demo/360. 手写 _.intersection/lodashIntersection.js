/**
 * _.intersection([arrays])
 *
 * Creates an array of unique values that are included in all given arrays
 * using SameValueZero equality. The order of result values is determined by
 * the first array.
 *
 * Approach:
 * - The first array drives the order. Filter it to keep only those elements
 *   that appear in every subsequent array (use Set lookups for O(1) tests).
 * - Deduplicate via a Set on the result so each value appears once.
 */

function intersection(...arrays) {
  if (arrays.length === 0) return [];
  const first = arrays[0];
  if (!Array.isArray(first)) return [];
  const restSets = arrays.slice(1).map((arr) => new Set(Array.isArray(arr) ? arr : []));
  const seen = new Set();
  const result = [];
  for (const item of first) {
    if (seen.has(item)) continue; // already added
    let inAll = true;
    for (const s of restSets) {
      if (!s.has(item)) {
        inAll = false;
        break;
      }
    }
    if (inAll) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log('intersection basic:', JSON.stringify(intersection([2, 1, 3], [4, 2, 1], [1, 2]))); // expected: [2,1]
console.log('intersection no overlap:', JSON.stringify(intersection([1, 2], [3, 4]))); // expected: []
console.log('intersection one array:', JSON.stringify(intersection([1, 2, 3]))); // expected: [1,2,3]
console.log('intersection with duplicates:', JSON.stringify(intersection([1, 1, 2, 3], [1, 1, 2]))); // expected: [1,2]
console.log('intersection with NaN:', JSON.stringify(intersection([1, NaN, 2], [NaN, 2, 3]))); // expected: [NaN,2] (SameValueZero via Set)
console.log('intersection empty:', JSON.stringify(intersection())); // expected: []
console.log('intersection preserves first order:', JSON.stringify(intersection([5, 3, 1], [1, 3, 5]))); // expected: [5,3,1]
