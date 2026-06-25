/**
 * @file churchEncoding.js
 * @description 手写 Church 编码（丘奇数）
 *
 * Church numerals encode the natural numbers as higher-order functions:
 *   n := f => x => f^n(x)
 * That is, the numeral `n` is the function that applies `f` to `x` exactly
 * `n` times. Arithmetic is then definable purely by composition.
 *
 *   zero  = f => x => x
 *   succ  = n => f => x => f(n(f)(x))
 *   add   = m => n => f => x => m(f)(n(f)(x))      (or n(succ) style)
 *   mult  = m => n => f => m(n(f))                 (compose f n times, m times)
 *   pow   = m => n => n(m)                          (n-fold self application)
 *   pred  = n => f => x => n(g => h => h(g(f)))(_ => x)(u => u)
 *
 * Approach: encode, decode, and test all the basic operations.
 */

// Encode an integer n as a Church numeral.
const church = (n) => (f) => (x) => {
  let acc = x;
  for (let i = 0; i < n; i++) acc = f(acc);
  return acc;
};

// Decode a Church numeral back to a plain integer using inc.
const unchurch = (c) => c((x) => x + 1)(0);

const zero = (f) => (x) => x;
const succ = (n) => (f) => (x) => f(n(f)(x));
const add = (m) => (n) => (f) => (x) => m(f)(n(f)(x));
const mult = (m) => (n) => (f) => m(n(f));
const pow = (m) => (n) => n(m);

// Predecessor (classic, works for n >= 0; pred(0) = 0).
const pred = (n) => (f) => (x) => n((g) => (h) => h(g(f)))((_) => x)((u) => u);

const one = succ(zero);
const two = succ(one);
const three = succ(two);
const four = succ(three);

// ---------- Test cases ----------

console.log(unchurch(zero)); // 0
console.log(unchurch(one)); // 1
console.log(unchurch(two)); // 2
console.log(unchurch(church(10))); // 10

console.log(unchurch(add(two)(three))); // 5
console.log(unchurch(add(church(20))(church(22)))); // 42

console.log(unchurch(mult(two)(three))); // 6
console.log(unchurch(mult(four)(four))); // 16
console.log(unchurch(mult(church(6))(church(7)))); // 42

console.log(unchurch(pow(two)(three))); // 8  (2^3)
console.log(unchurch(pow(three)(two))); // 9  (3^2)
console.log(unchurch(pow(two)(church(10)))); // 1024

console.log(unchurch(pred(three))); // 2
console.log(unchurch(pred(one))); // 0
console.log(unchurch(pred(zero))); // 0 (by convention)

// IsZero: zero returns the true branch, others the false branch.
//   isZero n = n (const false) true
const True = (a) => (b) => a;
const False = (a) => (b) => b;
const isZero = (n) => n((_) => False)(True);
console.log(isZero(zero)("zero")("nonzero")); // 'zero'
console.log(isZero(three)("zero")("nonzero")); // 'nonzero'
console.log(isZero(church(0))("zero")("nonzero")); // 'zero'
