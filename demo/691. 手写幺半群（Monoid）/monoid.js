/**
 * @file monoid.js
 * @description 手写幺半群（Monoid）
 *
 * A Monoid is a Semigroup with an identity element (`empty`):
 *
 *   - concat : (a, a) -> a        (associative)
 *   - empty  : a                  (identity: concat(a, empty) === a === concat(empty, a))
 *
 * Having an identity means we can fold over an *empty* list and get a sensible
 * default, and we can partition/parallelise folds freely.
 *
 * Approach: extend the semigroup registry with `empty`, provide a generic
 * `fold` that handles the empty case, and verify both identity laws.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const Monoid = {
  Sum: { empty: () => 0, concat: (x, y) => x + y },
  Product: { empty: () => 1, concat: (x, y) => x * y },
  String: { empty: () => "", concat: (x, y) => x + y },
  Array: { empty: () => [], concat: (x, y) => x.concat(y) },
  Max: { empty: () => -Infinity, concat: (x, y) => (x >= y ? x : y) },
  Min: { empty: () => Infinity, concat: (x, y) => (x <= y ? x : y) },
  Any: { empty: () => false, concat: (x, y) => x || y },
  All: { empty: () => true, concat: (x, y) => x && y },
};

// Fold over a possibly-empty list using the monoid identity as the seed.
const fold = (M, arr) => arr.reduce(M.concat, M.empty());

// Verify left and right identity laws.
function hasIdentity(M, a) {
  return deepEq(M.concat(a, M.empty()), a) && deepEq(M.concat(M.empty(), a), a);
}

// Verify associativity.
function isAssociative(M, a, b, c) {
  return deepEq(M.concat(M.concat(a, b), c), M.concat(a, M.concat(b, c)));
}

// ---------- Tests ----------

console.log(fold(Monoid.Sum, [1, 2, 3, 4])); // 10
console.log(fold(Monoid.Sum, [])); // 0
console.log(fold(Monoid.Product, [2, 3, 4])); // 24
console.log(fold(Monoid.Product, [])); // 1
console.log(fold(Monoid.String, ["a", "b", "c"])); // abc
console.log(fold(Monoid.Array, [[1], [2], [3]])); // [1, 2, 3]
console.log(fold(Monoid.Max, [3, 7, 2, 9, 4])); // 9
console.log(fold(Monoid.Max, [])); // -Infinity
console.log(fold(Monoid.All, [true, true, false])); // false
console.log(fold(Monoid.Any, [false, false, true])); // true

// Laws.
const cases = [
  ["Sum", Monoid.Sum, 5],
  ["Product", Monoid.Product, 7],
  ["String", Monoid.String, "x"],
  ["Array", Monoid.Array, [1]],
  ["Max", Monoid.Max, 42],
  ["Min", Monoid.Min, 42],
  ["Any", Monoid.Any, true],
  ["All", Monoid.All, false],
];
let pass = true;
for (const [name, M, a] of cases) {
  const id = hasIdentity(M, a);
  const asoc = isAssociative(M, a, a, a);
  console.log(`[${name}] identity: ${id}, associative: ${asoc}`);
  pass &= id && asoc;
}
console.log("\nAll monoid laws hold:", pass === 1); // true
