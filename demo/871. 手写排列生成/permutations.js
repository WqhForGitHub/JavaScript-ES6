/**
 * 871. 手写排列生成 (Permutations)
 * --------------------------------------------------------------
 * Generate all permutations of an array.
 *
 * Two implementations are provided:
 *   1. Recursive backtracking (swap-based, classic Heap-like approach)
 *   2. Iterative (lexicographic / next-permutation algorithm)
 *
 * A permutation of a set is an ordered arrangement of its elements.
 * For an array of length n, there are n! permutations.
 */

"use strict";

/* ------------------------------------------------------------------ *
 * 1) Recursive backtracking (swap-based)
 *    Idea: fix one position at a time by swapping each remaining
 *    element into the current position, recurse, then swap back.
 * ------------------------------------------------------------------ */
function permutationsRecursive(arr) {
  const result = [];
  const a = arr.slice(); // work on a copy so the input is not mutated

  function backtrack(start) {
    if (start === a.length) {
      // push a copy of the current arrangement
      result.push(a.slice());
      return;
    }
    for (let i = start; i < a.length; i++) {
      swap(a, start, i);
      backtrack(start + 1);
      swap(a, start, i); // backtrack
    }
  }

  backtrack(0);
  return result;
}

function swap(arr, i, j) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

/* ------------------------------------------------------------------ *
 * 2) Iterative (lexicographic next-permutation)
 *    1. Start from the sorted array (lexicographically smallest).
 *    2. Repeatedly compute the next permutation until no more.
 * ------------------------------------------------------------------ */
function permutationsIterative(arr) {
  const result = [];
  const a = arr.slice().sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  result.push(a.slice());

  while (true) {
    if (!nextPermutation(a)) break;
    result.push(a.slice());
  }
  return result;
}

function nextPermutation(a) {
  // Step 1: find the largest index i such that a[i] < a[i + 1]
  let i = a.length - 2;
  while (i >= 0 && !(a[i] < a[i + 1])) i--;
  if (i < 0) return false; // this was the last permutation

  // Step 2: find largest index j > i such that a[i] < a[j]
  let j = a.length - 1;
  while (!(a[i] < a[j])) j--;

  // Step 3: swap a[i] and a[j]
  swap(a, i, j);

  // Step 4: reverse the suffix starting at i + 1
  let left = i + 1;
  let right = a.length - 1;
  while (left < right) {
    swap(a, left, right);
    left++;
    right--;
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * Test cases
 * ------------------------------------------------------------------ */
console.log("--- permutationsRecursive([1,2,3]) ---");
const rec = permutationsRecursive([1, 2, 3]);
console.log(rec);
// Expected: 6 permutations of [1,2,3]
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,2,1],[3,1,2]]  (order may differ)
console.log("count =", rec.length, "(expected 6)");

console.log("\n--- permutationsIterative([1,2,3]) ---");
const iter = permutationsIterative([1, 2, 3]);
console.log(iter);
console.log("count =", iter.length, "(expected 6)");
// Iterative version produces lexicographically sorted order:
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

console.log('\n--- permutationsRecursive(["a","b"]) ---');
console.log(permutationsRecursive(["a", "b"]));
// Expected: [["a","b"],["b","a"]]  (order may differ)

console.log("\n--- permutationsRecursive([1]) ---");
console.log(permutationsRecursive([1]));
// Expected: [[1]]

console.log("\n--- permutationsIterative([1,2,3,4]) count ---");
console.log(permutationsIterative([1, 2, 3, 4]).length, "(expected 24)");
