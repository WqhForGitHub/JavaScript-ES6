/**
 * @file yCombinator.js
 * @description 手写 Y 组合子（Y Combinator）
 *
 * The Y combinator is a higher-order function that computes the fixed point of
 * another function, allowing anonymous recursion without explicit self-
 * reference. Given a functional `f` that takes its own "future" self as an
 * argument and returns the actual recursive function, `Y(f)` produces a
 * self-referential function.
 *
 * In a call-by-value (strict) language like JavaScript the naive
 *   Y = f => (x => f(x(x)))(x => f(x(x)))
 * diverges because `x(x)` is evaluated eagerly. The classic fix is to delay
 * the self-application with an extra wrapper:
 *
 *   Y = f => (x => f(v => x(x)(v)))(x => f(v => x(x)(v)));
 *
 * This is sometimes called the strict/applicative-order Y combinator (a.k.a.
 * the Z combinator by some authors). Here we present it as "the Y combinator
 * usable in JavaScript."
 *
 * Approach: derive factorial and Fibonacci by writing them in the form
 * `rec => n => ... rec(n - 1) ...` and handing them to Y.
 */

const Y = (f) => ((x) => f((v) => x(x)(v)))((x) => f((v) => x(x)(v)));

// ---------- Test cases ----------

// Factorial: written without naming itself, recursion provided by Y.
const factorial = Y((rec) => (n) => (n <= 1 ? 1 : n * rec(n - 1)));

console.log(factorial(0)); // 1
console.log(factorial(5)); // 120
console.log(factorial(10)); // 3628800

// Fibonacci.
const fib = Y((rec) => (n) => (n < 2 ? n : rec(n - 1) + rec(n - 2)));
console.log(fib(0)); // 0
console.log(fib(1)); // 1
console.log(fib(10)); // 55
console.log(fib(15)); // 610

// Sum of a list (structural recursion).
const sumList = Y(
  (rec) => (list) => (list.length === 0 ? 0 : list[0] + rec(list.slice(1))),
);
console.log(sumList([1, 2, 3, 4, 5])); // 15
console.log(sumList([])); // 0

// String reverse.
const reverse = Y((rec) => (s) => (s.length <= 1 ? s : rec(s.slice(1)) + s[0]));
console.log(reverse("hello")); // olleh
console.log(reverse("Y combinator")); // rotanimboc Y
