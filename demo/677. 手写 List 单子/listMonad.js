/**
 * @file listMonad.js
 * @description 手写 List 单子
 *
 * The List monad models nondeterministic computation: each step may produce
 * zero or more results, and `chain` explores all combinations (the Cartesian
 * product of branches). It is the list/set comprehension monad.
 *
 * Interface:
 *   - List.of(value)        : singleton list
 *   - List.from(array)      : wrap an array
 *   - map(fn)               : pointwise transform (1-to-1)
 *   - chain(fn)             : bind (1-to-many), flattening results
 *   - ap(listArg)           : apply each wrapped fn to each wrapped value
 *
 * Laws: monad laws with `chain` acting like `flatMap`.
 */

class List {
  constructor(items) {
    this.items = Array.from(items);
  }

  static of(value) {
    return new List([value]);
  }

  static from(arr) {
    return new List(arr);
  }

  static empty() {
    return new List([]);
  }

  map(fn) {
    return new List(this.items.map(fn));
  }

  // flatMap: apply fn (which returns a List) to each element, concat results.
  chain(fn) {
    return new List(this.items.flatMap((x) => fn(x).items));
  }

  ap(listArg) {
    return new List(this.items.flatMap((f) => listArg.items.map((x) => f(x))));
  }

  // Fold / reduce.
  fold(reducer, initial) {
    return this.items.reduce(reducer, initial);
  }

  get length() {
    return this.items.length;
  }

  toArray() {
    return this.items.slice();
  }

  toString() {
    return `List(${JSON.stringify(this.items)})`;
  }
}

// ---------- Test cases ----------

// Singleton and map.
console.log(
  List.of(5)
    .map((x) => x + 1)
    .toString(),
); // List([6])

// Nondeterministic pairing: pairs of [1,2] x [3,4].
const pairs = List.from([1, 2]).chain((a) =>
  List.from([3, 4]).map((b) => [a, b]),
);
console.log(pairs.toString());
// List([[1,3],[1,4],[2,3],[2,4]])

// Pythagorean triples (classic list-comprehension monad example).
const range = (lo, hi) =>
  List.from(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));

const triples = range(1, 10).chain((a) =>
  range(a, 10).chain((b) =>
    range(b, 10).chain((c) =>
      a * a + b * b === c * c ? List.of([a, b, c]) : List.empty(),
    ),
  ),
);
console.log(triples.toString());
// List([[3,4,5],[6,8,10]])

// Applicative: every fn applied to every arg.
const applied = List.of((x) => x + 1).ap(List.from([1, 2, 3]));
console.log(applied.toString()); // List([2,3,4])

// fold to sum.
console.log(List.from([1, 2, 3, 4]).fold((a, b) => a + b, 0)); // 10
