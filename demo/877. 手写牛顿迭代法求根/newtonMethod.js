/**
 * 877. 手写牛顿迭代法求根 (Newton's Method for f(x) = 0)
 * --------------------------------------------------------------
 * Newton's method finds a root of f(x) = 0 by iterating
 *
 *      x_{n+1} = x_n - f(x_n) / f'(x_n)
 *
 * starting from an initial guess x_0. The method converges
 * quadratically when the initial guess is close to a simple root
 * and f' is well-behaved (non-zero near the root).
 *
 * Stopping criteria:
 *   - |f(x)| < tolF   (function value close to zero), OR
 *   - |x_{n+1} - x_n| < tolX   (step size very small), OR
 *   - iteration count exceeds maxIter (failure to converge).
 *
 * Returns an object { root, iterations, converged, fValue }.
 */

"use strict";

/* ------------------------------------------------------------------ *
 * Newton's method.
 *
 * Parameters:
 *   f        : the function whose root we seek, f(x)
 *   df       : the derivative f'(x)
 *   x0       : initial guess
 *   options  : { tolX, tolF, maxIter }  (all optional)
 * ------------------------------------------------------------------ */
function newton(f, df, x0, options = {}) {
  const {
    tolX = 1e-12, // step-size tolerance
    tolF = 1e-12, // function-value tolerance
    maxIter = 100, // safety cap on iterations
  } = options;

  let x = x0;
  let fx = f(x);

  for (let i = 0; i < maxIter; i++) {
    // If function value is already tiny, we are done.
    if (Math.abs(fx) < tolF) {
      return { root: x, iterations: i, converged: true, fValue: fx };
    }

    const dfx = df(x);
    if (dfx === 0) {
      // Derivative zero: cannot proceed (would divide by zero).
      return {
        root: x,
        iterations: i,
        converged: false,
        fValue: fx,
        error: "Zero derivative",
      };
    }

    const step = fx / dfx;
    const next = x - step;

    // Step-size convergence test.
    if (Math.abs(next - x) < tolX) {
      return {
        root: next,
        iterations: i + 1,
        converged: true,
        fValue: f(next),
      };
    }

    x = next;
    fx = f(x);
  }

  // Exceeded maxIter without meeting a tolerance.
  return {
    root: x,
    iterations: maxIter,
    converged: false,
    fValue: fx,
    error: "Max iterations reached",
  };
}

/* ------------------------------------------------------------------ *
 * Test cases
 * ------------------------------------------------------------------ */

// Test 1: f(x) = x^2 - 2  => root is sqrt(2) ~ 1.4142135623730951
console.log("--- Newton: solve x^2 - 2 = 0 (root = sqrt(2)) ---");
const f1 = (x) => x * x - 2;
const df1 = (x) => 2 * x;
const result1 = newton(f1, df1, 1.0);
console.log("result:", result1);
console.log("root =", result1.root);
console.log("expected = sqrt(2) =", Math.sqrt(2));
console.log("diff =", Math.abs(result1.root - Math.sqrt(2)), "(expected ~0)");
console.log("converged:", result1.converged, "(expected true)");

// Test 2: f(x) = x^3 - x - 2  => root ~ 1.5213797068045676
console.log("\n--- Newton: solve x^3 - x - 2 = 0 ---");
const f2 = (x) => x * x * x - x - 2;
const df2 = (x) => 3 * x * x - 1;
const result2 = newton(f2, df2, 1.5);
console.log("result:", result2);
console.log("root =", result2.root);
console.log("expected ~", 1.5213797068045676);
console.log("converged:", result2.converged, "(expected true)");

// Test 3: f(x) = sin(x)  => root at x = 0 (near guess 3)
console.log("\n--- Newton: solve sin(x) = 0 (starting from 3) ---");
const f3 = Math.sin;
const df3 = Math.cos;
const result3 = newton(f3, df3, 3);
console.log("result:", result3);
console.log("root =", result3.root, "(expected close to pi ~", Math.PI, ")");
console.log("converged:", result3.converged, "(expected true)");

// Test 4: f(x) = e^x - 2  => root = ln(2) ~ 0.6931471805599453
console.log("\n--- Newton: solve e^x - 2 = 0 (root = ln(2)) ---");
const f4 = (x) => Math.exp(x) - 2;
const df4 = (x) => Math.exp(x);
const result4 = newton(f4, df4, 1.0);
console.log("result:", result4);
console.log("root =", result4.root);
console.log("expected = ln(2) =", Math.log(2));
console.log("diff =", Math.abs(result4.root - Math.log(2)), "(expected ~0)");

// Test 5: failure case - zero derivative at guess
console.log("\n--- Newton: f(x) = x^3 starting at 0 (zero derivative) ---");
const f5 = (x) => x * x * x;
const df5 = (x) => 3 * x * x;
const result5 = newton(f5, df5, 0);
console.log("result:", result5);
console.log(
  "converged:",
  result5.converged,
  "(expected false, zero derivative)",
);
