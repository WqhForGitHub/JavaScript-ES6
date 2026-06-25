/**
 * @file foldable.js
 * @description 手写 Foldable
 *
 * Foldable is a typeclass describing structures that can be "collapsed" into a
 * summary value. The core operation is `reduce` (a.k.a. `foldl`):
 *
 *   reduce :: (b -> a -> b) -> b -> f a -> b
 *
 * From `reduce` we derive a host of useful folds: `foldMap` (collapse with a
 * monoid), `sum`, `product`, `length`, `toArray`, `contains`, `find`, etc.
 * Foldable does NOT require Functor (e.g., a Set is Foldable but its map
 * cannot change the element type freely).
 *
 * Approach: implement a `Foldable` interface via a `foldr`/`reduce` capability
 * for several containers (Array-like, Tree, Maybe, Either) and derive common
 * combinators generically.
 */

// A Foldable is identified by its `reduce` implementation.
const makeFoldable = (reduce) => ({
  reduce,
  // Right fold derived from left fold via continuation-building.
  //   foldr f z xs = foldl (\c x -> \a -> c (f x a)) id xs z
  foldr(f, z, fa) {
    const build = this.reduce(
      (c, x) => (a) => c(f(x, a)),
      (a) => a,
      fa,
    );
    return build(z);
  },
  // Monoidal fold: map each element through a monoid, concat them.
  foldMap(M, f, fa) {
    return this.reduce((acc, x) => M.concat(acc, f(x)), M.empty(), fa);
  },
  sum(fa) {
    return this.reduce((a, b) => a + b, 0, fa);
  },
  product(fa) {
    return this.reduce((a, b) => a * b, 1, fa);
  },
  length(fa) {
    return this.reduce((n) => n + 1, 0, fa);
  },
  toArray(fa) {
    return this.reduce((acc, x) => [...acc, x], [], fa);
  },
  contains(eq, target, fa) {
    return this.reduce((found, x) => found || eq(x, target), false, fa);
  },
  find(pred, fa) {
    return this.reduce(
      (acc, x) => (acc.found ? acc : pred(x) ? { found: true, value: x } : acc),
      { found: false, value: undefined },
      fa,
    ).value;
  },
});

// ---- Foldable instances ----

const ArrayFoldable = makeFoldable((f, z, arr) =>
  arr.reduce((acc, x) => f(acc, x), z),
);

// A binary tree: { value, left, right } (left/right may be null).
const TreeFoldable = makeFoldable(function reduce(f, z, tree) {
  if (tree == null) return z;
  return reduce(f, reduce(f, f(z, tree.value), tree.left), tree.right);
});

// Maybe: Just yields the value, Nothing contributes nothing.
const MaybeFoldable = makeFoldable((f, z, m) =>
  m.tag === "just" ? f(z, m.value) : z,
);

// Either: only Right contributes.
const EitherFoldable = makeFoldable((f, z, e) =>
  e.tag === "right" ? f(z, e.value) : z,
);

// ---------- Tests ----------

console.log(ArrayFoldable.sum([1, 2, 3, 4])); // 10
console.log(ArrayFoldable.product([1, 2, 3, 4])); // 24
console.log(ArrayFoldable.length([1, 2, 3])); // 3
console.log(ArrayFoldable.toArray([1, 2, 3])); // [1, 2, 3]
console.log(ArrayFoldable.contains((a, b) => a === b, 3, [1, 2, 3])); // true
console.log(ArrayFoldable.contains((a, b) => a === b, 9, [1, 2, 3])); // false
console.log(ArrayFoldable.find((x) => x > 2, [1, 2, 3, 4])); // 3

// foldr: build a right-nested string from the right.
console.log(ArrayFoldable.foldr((x, acc) => `${x}->${acc}`, "end", [1, 2, 3]));
// 1->2->3->end

const tree = {
  value: 4,
  left: {
    value: 2,
    left: { value: 1, left: null, right: null },
    right: { value: 3, left: null, right: null },
  },
  right: {
    value: 6,
    left: { value: 5, left: null, right: null },
    right: { value: 7, left: null, right: null },
  },
};
console.log(TreeFoldable.toArray(tree)); // [1, 2, 3, 4, 5, 6, 7] (in-order via reduce shape)
console.log(TreeFoldable.sum(tree)); // 28
console.log(TreeFoldable.length(tree)); // 7
console.log(TreeFoldable.find((x) => x > 5, tree)); // 6

console.log(MaybeFoldable.toArray({ tag: "just", value: 42 })); // [42]
console.log(MaybeFoldable.toArray({ tag: "nothing" })); // []
console.log(MaybeFoldable.sum({ tag: "just", value: 10 })); // 10

console.log(EitherFoldable.toArray({ tag: "right", value: "ok" })); // ['ok']
console.log(EitherFoldable.toArray({ tag: "left", value: "err" })); // []

// foldMap with a monoid (Sum).
const Sum = { empty: () => 0, concat: (x, y) => x + y };
console.log(ArrayFoldable.foldMap(Sum, (x) => x, [1, 2, 3])); // 6
console.log(TreeFoldable.foldMap(Sum, (x) => x, tree)); // 28
