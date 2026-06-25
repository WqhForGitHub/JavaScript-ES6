/**
 * @file semigroup.js
 * @description 手写半群（Semigroup）
 *
 * A Semigroup is an algebraic structure with a single associative binary
 * operation `concat: (a, a) -> a`. Associativity means:
 *
 *     (a.concat(b)).concat(c)  ===  a.concat(b.concat(c))
 *
 * Semigroups are the basis for combining values of the same type: summing
 * numbers, concatenating strings/arrays, merging records, taking the max,
 * etc.
 *
 * Approach: a tiny `Semigroup` typeclass simulation. Each instance supplies
 * a `concat` function; a generic helper verifies associativity.
 */

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// A registry of semigroup instances keyed by a tag.
const Semigroup = {
  // Sum: combine by addition.
  Sum: {
    concat: (x, y) => x + y,
  },
  // Product: combine by multiplication.
  Product: {
    concat: (x, y) => x * y,
  },
  // String concatenation.
  String: {
    concat: (x, y) => x + y,
  },
  // Array concatenation.
  Array: {
    concat: (x, y) => x.concat(y),
  },
  // Max: take the larger.
  Max: {
    concat: (x, y) => (x >= y ? x : y),
  },
  // Min: take the smaller.
  Min: {
    concat: (x, y) => (x <= y ? x : y),
  },
  // Any (logical OR over booleans).
  Any: {
    concat: (x, y) => x || y,
  },
  // All (logical AND over booleans).
  All: {
    concat: (x, y) => x && y,
  },
};

// Generic fold: reduce a non-empty list with the semigroup's concat.
const sconcat = (S, head, rest) => rest.reduce(S.concat, head);

// Associativity check.
function isAssociative(S, a, b, c) {
  const left = S.concat(S.concat(a, b), c);
  const right = S.concat(a, S.concat(b, c));
  return deepEq(left, right);
}

// ---------- Tests ----------

console.log(Semigroup.Sum.concat(2, 3)); // 5
console.log(Semigroup.Product.concat(2, 3)); // 6
console.log(Semigroup.String.concat("foo", "bar")); // foobar
console.log(Semigroup.Array.concat([1, 2], [3, 4])); // [1, 2, 3, 4]
console.log(Semigroup.Max.concat(5, 9)); // 9
console.log(Semigroup.Min.concat(5, 9)); // 5
console.log(Semigroup.Any.concat(false, true)); // true
console.log(Semigroup.All.concat(false, true)); // false

console.log(sconcat(Semigroup.Sum, 1, [2, 3, 4])); // 10
console.log(sconcat(Semigroup.Array, [1], [[2], [3]])); // [1, 2, 3]

// Associativity must hold for all instances.
const checks = [
  ["Sum", Semigroup.Sum, 1, 2, 3],
  ["Product", Semigroup.Product, 2, 3, 4],
  ["String", Semigroup.String, "a", "b", "c"],
  ["Array", Semigroup.Array, [1], [2], [3]],
  ["Max", Semigroup.Max, 5, 9, 2],
  ["Min", Semigroup.Min, 5, 9, 2],
  ["Any", Semigroup.Any, true, false, true],
  ["All", Semigroup.All, true, false, true],
];
let pass = true;
for (const [name, S, a, b, c] of checks) {
  const ok = isAssociative(S, a, b, c);
  console.log(`[${name}] associative: ${ok}`);
  pass &= ok;
}
console.log("\nAll semigroups associative:", pass === 1); // true
