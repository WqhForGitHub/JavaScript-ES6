/**
 * @file churchList.js
 * @description 手写 Church 列表
 *
 * A Church-encoded list represents a list purely with functions, eliminating
 * the need for any built-in data structure. The standard "right fold" encoding
 * is:
 *
 *   list := cons => nil => ...
 *
 * i.e., a list IS its own right fold: given a `cons` step function and a
 * `nil` base value, it produces the result of folding the list from the
 * right.
 *
 *   nil        := c => n => n
 *   cons x xs  := c => n => c(x)(xs(c)(n))
 *
 * Operations:
 *   length, sum, head, map, foldr, foldl, reverse, toList, fromList.
 *
 * Approach: build the encoding, then verify with concrete arrays.
 */

// Constructors. A Church list is a function (c, n) => ... where c is a
// curried step function (x)(acc) and n is the base value.
const nil = (c, n) => n;
const cons = (x, xs) => (c, n) => c(x)(xs(c, n));

// Build a Church list from a JS array (fold from the right).
const fromList = (arr) => arr.reduceRight((acc, x) => cons(x, acc), nil);

// Materialise a Church list into a JS array via foldr.
const toList = (list) => list((x) => (acc) => [x, ...acc], []);

// Length: count 1 per element, starting at 0.
const length = (list) => list((_) => (acc) => acc + 1, 0);

// Sum of numeric list.
const sum = (list) => list((x) => (acc) => x + acc, 0);

// head: first element, or `fallback` for the empty list.
// For cons(x, xs): c(x)(rest) must yield x, so c = x => _ => x (K combinator).
const head = (list, fallback) => list((x) => (_) => x, fallback);

// map: apply f to each element, preserving structure.
const map = (f) => (list) => (c, n) => list((x) => (acc) => c(f(x))(acc), n);

// foldr: right fold. c is curried step (x)(acc), n is base.
const foldr = (c, n) => (list) => list(c, n);

// foldl: left fold derived from foldr.
//   foldl f z xs = foldr (\x g acc -> g (f acc x)) id xs z
const foldl = (f, z) => (list) =>
  list(
    (x) => (g) => (acc) => g(f(acc, x)),
    (acc) => acc,
  )(z);

// reverse: prepend each element onto an empty accumulator (foldl).
// `cons` is uncurried (x, xs), so we call cons(x, acc) directly.
const reverse = (list) => foldl((acc, x) => cons(x, acc), nil)(list);

// ---------- Test cases ----------

const nums = fromList([1, 2, 3, 4, 5]);

console.log(toList(nums)); // [1, 2, 3, 4, 5]
console.log(length(nums)); // 5
console.log(sum(nums)); // 15
console.log(head(nums, null)); // 1
console.log(head(nil, "empty")); // empty

const doubled = map((x) => x * 2)(nums);
console.log(toList(doubled)); // [2, 4, 6, 8, 10]
console.log(sum(doubled)); // 30

// foldr: build a comma-separated string.
const asString = foldr(
  (x) => (acc) => (acc === "" ? `${x}` : `${x},${acc}`),
  "",
)(nums);
console.log(asString); // 1,2,3,4,5

// foldl: compute product.
const product = foldl((acc, x) => acc * x, 1)(nums);
console.log(product); // 120

// reverse.
console.log(toList(reverse(nums))); // [5, 4, 3, 2, 1]
console.log(toList(reverse(nil))); // []
console.log(toList(reverse(fromList([7])))); // [7]

// Nesting lists.
const nested = fromList([fromList([1, 2]), fromList([3, 4])]);
console.log(toList(map(sum)(nested))); // [3, 7]
console.log(toList(map(toList)(nested))); // [[1, 2], [3, 4]]
