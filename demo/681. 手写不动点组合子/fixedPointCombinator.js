/**
 * @file fixedPointCombinator.js
 * @description 手写不动点组合子
 *
 * A fixed-point combinator takes a functional `f` and returns a function `g`
 * such that `g === f(g)` -- i.e., `g` is a fixed point of `f`. This is the
 * essence of self-reference/recursion in the lambda calculus, where a
 * function cannot refer to itself by name.
 *
 * JavaScript is call-by-value (strict), so the naive normal-order
 *   Y = f => (x => f(x(x)))(x => f(x(x)))
 * diverges. This file collects several strict-friendly fixed-point combinators
 * and shows they all compute the same fixed point for a given functional:
 *
 *   - Z (applicative-order Y, the most common "Y" in strict JS)
 *   - U combinator, used directly: U g builds a self-referential function
 *   - Turing's Theta combinator, classically derived from U
 *   - ThunkY: a Z-shaped combinator wrapped in a helper for clarity
 *
 * Approach: implement each, then verify factorial and fibonacci agree and
 * that the fixed-point property g === f(g) holds pointwise.
 */

// Applicative-order fixed-point combinator (a.k.a. Z / strict Y).
const Z = (f) => ((x) => f((v) => x(x)(v)))((x) => f((v) => x(x)(v)));

// Turing's U combinator: U f = \x -> f (U f) x  (eta-expanded for strictness).
// Used directly: pass a functional `g = self => ...` that receives its own
// future self as `self`, and U(g) produces the recursive function.
const U = (f) => (x) => f(U(f))(x);

// Turing's Theta combinator (a strict fixed-point combinator derived from U):
//   Theta = A A   where  A = x => f => v => f (x x f) v
const Theta = (
  (x) => (f) => (v) =>
    f(x(x)(f))(v)
)((x) => (f) => (v) => f(x(x)(f))(v));

// A "thunked" Y combinator: same shape as Z, factored through a named helper.
const ThunkY = (f) => {
  const wrap = (x) => f((v) => x(x)(v));
  return wrap(wrap);
};

// ---------- Test cases ----------

const factorialFunctional = (rec) => (n) => (n <= 1 ? 1 : n * rec(n - 1));
const fibFunctional = (rec) => (n) => (n < 2 ? n : rec(n - 1) + rec(n - 2));

const factZ = Z(factorialFunctional);
const factT = ThunkY(factorialFunctional);
const factTheta = Theta(factorialFunctional);
// Direct U usage: the functional takes its own future self as the first arg.
const factU = U((self) => (n) => (n <= 1 ? 1 : n * self(n - 1)));

console.log(factZ(5)); // 120
console.log(factT(5)); // 120
console.log(factTheta(5)); // 120
console.log(factU(5)); // 120

// All four combinators must agree (they are the same fixed point).
console.log(
  [0, 1, 5, 10, 12].every(
    (n) =>
      factZ(n) === factT(n) &&
      factT(n) === factTheta(n) &&
      factTheta(n) === factU(n),
  ),
); // true

// Fibonacci agreement.
const fibZ = Z(fibFunctional);
const fibTheta = Theta(fibFunctional);
console.log(fibZ(10)); // 55
console.log(fibTheta(10)); // 55
console.log(fibZ(15) === fibTheta(15)); // true

// Demonstrate the fixed-point property: g === f(g) pointwise.
const g = Z(factorialFunctional);
const isFixed = [1, 3, 6].every((n) => g(n) === factorialFunctional(g)(n));
console.log(isFixed); // true
