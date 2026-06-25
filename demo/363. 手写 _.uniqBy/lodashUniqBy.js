/**
 * _.uniqBy(array, [iteratee=_.identity])
 *
 * Like _.uniq except that `iteratee` is invoked for each element to
 * generate the criterion by which uniqueness is computed. The first element
 * producing a given criterion value is kept. Iteratee may be a function or
 * a property name shorthand.
 *
 * Approach:
 * - Maintain a Set of computed criteria (use the same identity for NaN so
 *   multiple NaN criteria collapse to one entry).
 * - For each element compute the criterion; if not seen, keep the element
 *   and record the criterion.
 */

function uniqBy(array, iteratee = (v) => v) {
  if (!Array.isArray(array)) return [];
  const get =
    typeof iteratee === "function"
      ? iteratee
      : (v) => (v == null ? undefined : v[iteratee]);
  const seen = new Set();
  const result = [];
  for (const item of array) {
    const crit = get(item);
    // Set treats NaN === NaN as true (SameValueZero), matching lodash.
    if (!seen.has(crit)) {
      seen.add(crit);
      result.push(item);
    }
  }
  return result;
}

// --- Tests ---

console.log(
  "uniqBy floor:",
  JSON.stringify(uniqBy([2.1, 1.2, 2.3, 3.4], Math.floor)),
); // expected: [2.1,1.2,3.4]
console.log(
  "uniqBy property:",
  JSON.stringify(uniqBy([{ x: 1 }, { x: 2 }, { x: 1 }, { x: 3 }], "x")),
); // expected: [{"x":1},{"x":2},{"x":3}]
console.log(
  "uniqBy function key:",
  JSON.stringify(
    uniqBy(["apple", "avocado", "banana", "apricot"], (s) => s[0]),
  ),
); // expected: ["apple","banana"]
console.log(
  "uniqBy keeps first:",
  JSON.stringify(
    uniqBy(
      [
        { id: 1, n: "a" },
        { id: 1, n: "b" },
        { id: 2, n: "c" },
      ],
      "id",
    ),
  ),
); // expected: [{"id":1,"n":"a"},{"id":2,"n":"c"}]
console.log("uniqBy empty:", JSON.stringify(uniqBy([]))); // expected: []
console.log("uniqBy default identity:", JSON.stringify(uniqBy([1, 2, 1, 3]))); // expected: [1,2,3]
