/**
 * @file zCombinator.js
 * @description 手写 Z 组合子
 *
 * The Z combinator is the strict/call-by-value variant of the Y combinator.
 * In a normal-order (lazy) lambda calculus, Y is simply:
 *     Y = f => (x => f(x(x)))(x => f(x(x)))
 * but in JavaScript the eager evaluation of `x(x)` causes infinite recursion.
 * The Z combinator introduces an eta-expansion `v => x(x)(v)` to delay the
 * self-application so the recursion only unfolds one step at a time.
 *
 *     Z = f => (x => f(v => x(x)(v)))(x => f(v => x(x)(v)));
 *
 * This is the form practically usable for anonymous recursion in JavaScript.
 * The difference from "Y" as commonly shown in JS tutorials is purely naming;
 * both denote the applicative-order fixed-point combinator.
 *
 * Approach: derive recursive functions (factorial, fibonacci, mutual parity,
 * Ackermann) by passing a "rec" placeholder to Z.
 */

const Z = (f) => ((x) => f((v) => x(x)(v)))((x) => f((v) => x(x)(v)));

// ---------- Test cases ----------

// Factorial without naming itself.
const factorial = Z((rec) => (n) => (n <= 1 ? 1 : n * rec(n - 1)));
console.log(factorial(0)); // 1
console.log(factorial(5)); // 120
console.log(factorial(12)); // 479001600

// Fibonacci.
const fib = Z((rec) => (n) => (n < 2 ? n : rec(n - 1) + rec(n - 2)));
console.log(fib(20)); // 6765

// Ackermann (deeply recursive -- validates that Z only unfolds one step).
const ackermann = Z((rec) => (m) => (n) => {
  if (m === 0) return n + 1;
  if (n === 0) return rec(m - 1)(1);
  return rec(m - 1)(rec(m)(n - 1));
});
console.log(ackermann(2)(3)); // 9
console.log(ackermann(3)(3)); // 61

// Cleaner mutual recursion: write isEven that references itself through Z's rec.
const isEvenClean = Z((rec) => (n) => {
  if (n === 0) return true;
  if (n === 1) return false;
  return rec(n - 2);
});
console.log(isEvenClean(10)); // true
console.log(isEvenClean(7)); // false
