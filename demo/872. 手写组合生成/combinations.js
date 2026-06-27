/**
 * 872. 手写组合生成 (Combinations)
 * --------------------------------------------------------------
 * Generate all k-combinations of an array (i.e. C(n, k)).
 *
 * Two implementations are provided:
 *   1. Recursive backtracking (choose / explore / un-choose)
 *   2. Iterative (lexicographic index-based generation)
 *
 * A combination is a selection of items from a collection where
 * order does not matter. For n items taken k at a time, the count
 * is C(n, k) = n! / (k! * (n - k)!).
 */

"use strict";

/* ------------------------------------------------------------------ *
 * 1) Recursive backtracking
 *    Classic "pick or skip" approach: at each step decide whether
 *    to include the element at index `start` in the current combo.
 * ------------------------------------------------------------------ */
function combinationsRecursive(arr, k) {
  const result = [];
  const n = arr.length;

  if (k < 0 || k > n) return result;

  function backtrack(start, current) {
    if (current.length === k) {
      result.push(current.slice());
      return;
    }
    // Prune: if not enough remaining elements to reach k, stop early
    if (current.length + (n - start) < k) return;

    for (let i = start; i < n; i++) {
      current.push(arr[i]); // choose
      backtrack(i + 1, current); // explore
      current.pop(); // un-choose (backtrack)
    }
  }

  backtrack(0, []);
  return result;
}

/* ------------------------------------------------------------------ *
 * 2) Iterative (lexicographic, index-based)
 *    Work with indices [0,1,...,k-1] and repeatedly find the next
 *    index configuration, then map indices to array values.
 *    Algorithm (Gosper's hack style):
 *      - Start with indices 0..k-1.
 *      - To get next: find rightmost index i where idx[i] can be
 *        incremented (idx[i] < n - k + i), increment it, then set
 *        each following index to be one greater than its predecessor.
 * ------------------------------------------------------------------ */
function combinationsIterative(arr, k) {
  const result = [];
  const n = arr.length;
  if (k < 0 || k > n) return result;
  if (k === 0) return [[]];

  // initial indices
  const idx = [];
  for (let i = 0; i < k; i++) idx.push(i);

  while (true) {
    // push current combination
    result.push(idx.map((i) => arr[i]));

    // find the rightmost index that can be incremented
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) break; // no more combinations

    // increment it and reset the following indices
    idx[i]++;
    for (let j = i + 1; j < k; j++) {
      idx[j] = idx[j - 1] + 1;
    }
  }
  return result;
}

/* ------------------------------------------------------------------ *
 * Helper: compute C(n, k) for verification
 * ------------------------------------------------------------------ */
function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let res = 1;
  for (let i = 0; i < k; i++) {
    res = (res * (n - i)) / (i + 1);
  }
  return Math.round(res);
}

/* ------------------------------------------------------------------ *
 * Test cases
 * ------------------------------------------------------------------ */
console.log("--- combinationsRecursive([1,2,3,4], 2) ---");
const c1 = combinationsRecursive([1, 2, 3, 4], 2);
console.log(c1);
console.log("count =", c1.length, "(expected", binomial(4, 2) + ", i.e. 6)");
// Expected: 6 combos: [1,2],[1,3],[1,4],[2,3],[2,4],[3,4]

console.log("\n--- combinationsIterative([1,2,3,4], 2) ---");
const c2 = combinationsIterative([1, 2, 3, 4], 2);
console.log(c2);
console.log("count =", c2.length, "(expected 6)");

console.log("\n--- combinationsRecursive([1,2,3], 0) ---");
console.log(combinationsRecursive([1, 2, 3], 0));
// Expected: [[]]

console.log("\n--- combinationsRecursive([1,2,3], 3) ---");
console.log(combinationsRecursive([1, 2, 3], 3));
// Expected: [[1,2,3]]

console.log("\n--- combinationsIterative([1,2,3,4,5], 3) count ---");
const c3 = combinationsIterative([1, 2, 3, 4, 5], 3);
console.log(c3);
console.log("count =", c3.length, "(expected", binomial(5, 3) + ", i.e. 10)");

console.log('\n--- combinationsRecursive(["a","b","c","d"], 2) ---');
console.log(combinationsRecursive(["a", "b", "c", "d"], 2));
// Expected: 6 combos of letters
