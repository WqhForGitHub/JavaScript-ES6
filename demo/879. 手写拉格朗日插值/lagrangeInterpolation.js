/**
 * 879. 手写拉格朗日插值 (Lagrange Interpolation)
 * --------------------------------------------------------------
 * Given n + 1 distinct points (x_0, y_0), (x_1, y_1), ..., (x_n, y_n),
 * the Lagrange interpolating polynomial L(x) is the unique polynomial
 * of degree at most n that passes through all the points. It is:
 *
 *      L(x) = sum_{i=0}^{n}  y_i * l_i(x)
 *
 * where the basis polynomials are:
 *
 *      l_i(x) = prod_{j != i} (x - x_j) / (x_i - x_j)
 *
 * Note: l_i(x_j) = 1 if j == i, and 0 otherwise (so L(x_i) = y_i).
 *
 * Lagrange interpolation is conceptually simple but can suffer from
 * Runge's phenomenon (oscillation near the edges) for high-degree
 * polynomials on equally spaced points.
 */

"use strict";

/* ------------------------------------------------------------------ *
 * Build the Lagrange interpolating polynomial as a function of x,
 * given arrays of x-values and y-values.
 *
 * The returned function evaluates L(x) for any x.
 * ------------------------------------------------------------------ */
function lagrangeInterpolation(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) {
    throw new TypeError("xs and ys must be arrays");
  }
  if (xs.length !== ys.length) {
    throw new Error("xs and ys must have the same length");
  }
  if (xs.length === 0) {
    throw new Error("Need at least one data point");
  }

  const n = xs.length;

  // Precompute the denominators of each basis polynomial l_i(x):
  //   denom_i = prod_{j != i} (x_i - x_j)
  const denoms = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let d = 1;
    for (let j = 0; j < n; j++) {
      if (j !== i) d *= xs[i] - xs[j];
    }
    denoms[i] = d;
  }

  // Return the evaluator. For each x, sum y_i * l_i(x).
  return function evaluate(x) {
    let total = 0;
    for (let i = 0; i < n; i++) {
      // Compute numerator of l_i(x): prod_{j != i} (x - x_j)
      let num = 1;
      for (let j = 0; j < n; j++) {
        if (j !== i) num *= x - xs[j];
      }
      total += (ys[i] * num) / denoms[i];
    }
    return total;
  };
}

/* ------------------------------------------------------------------ *
 * Convenience: interpolate and evaluate at a single x in one call.
 * ------------------------------------------------------------------ */
function interpolateAt(xs, ys, x) {
  return lagrangeInterpolation(xs, ys)(x);
}

/* ------------------------------------------------------------------ *
 * Test cases
 * ------------------------------------------------------------------ */

// Test 1: interpolate y = x^2 using three points (0,0), (1,1), (2,4).
//         The unique degree-2 polynomial through these is exactly x^2.
console.log("--- Lagrange interpolation of x^2 through (0,0),(1,1),(2,4) ---");
const p1 = lagrangeInterpolation([0, 1, 2], [0, 1, 4]);
for (const x of [0, 0.5, 1, 1.5, 2, 3]) {
  const val = p1(x);
  const expected = x * x;
  console.log(
    `L(${x}) = ${val}, expected ${expected}, diff ${Math.abs(val - expected)}`,
  );
}
console.log(
  "L(1.5) expected 2.25, diff ~0:",
  Math.abs(p1(1.5) - 2.25) < 1e-12,
  "(expected true)",
);

// Test 2: interpolate a line y = 2x + 3 through two points.
console.log("\n--- Lagrange interpolation of 2x+3 through (0,3),(5,13) ---");
const p2 = lagrangeInterpolation([0, 5], [3, 13]);
console.log("L(2) =", p2(2), "(expected 7)");
console.log("L(10) =", p2(10), "(expected 23)");

// Test 3: interpolate the sine function at a few sample points and
//         check it approximates sin well between them.
console.log(
  "\n--- Lagrange interpolation of sin(x) sampled at 0, pi/4, pi/2, 3pi/4, pi ---",
);
const sampleX = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI];
const sampleY = sampleX.map(Math.sin);
const p3 = lagrangeInterpolation(sampleX, sampleY);
for (const x of [Math.PI / 6, Math.PI / 3, Math.PI / 2, Math.PI]) {
  const approx = p3(x);
  const exact = Math.sin(x);
  console.log(
    `L(${x.toFixed(4)}) = ${approx.toFixed(6)}, sin = ${exact.toFixed(6)}, diff ${Math.abs(approx - exact).toExponential(2)}`,
  );
}

// Test 4: error handling
console.log("\n--- Error handling ---");
try {
  lagrangeInterpolation([1, 2], [1]);
} catch (e) {
  console.log("caught:", e.message, "(expected length mismatch error)");
}

// Test 5: interpolation reproduces y_i exactly at sample points
console.log("\n--- Reproduces sample points exactly ---");
const xs5 = [1, 2, 3, 4];
const ys5 = [2, 5, 10, 17]; // y = x^2 + 1
const p5 = lagrangeInterpolation(xs5, ys5);
let allExact = true;
for (let i = 0; i < xs5.length; i++) {
  const v = p5(xs5[i]);
  if (Math.abs(v - ys5[i]) > 1e-10) allExact = false;
  console.log(`L(${xs5[i]}) = ${v}, expected ${ys5[i]}`);
}
console.log(
  "all sample points reproduced exactly:",
  allExact,
  "(expected true)",
);
