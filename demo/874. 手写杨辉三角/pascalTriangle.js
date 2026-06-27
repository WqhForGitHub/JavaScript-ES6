/**
 * 874. 手写杨辉三角 (Pascal's Triangle)
 * --------------------------------------------------------------
 * Generate Pascal's triangle up to n rows.
 *
 * Pascal's triangle is built using the recurrence:
 *      T[i][j] = T[i-1][j-1] + T[i-1][j]
 * with the boundary condition that the first and last element of
 * each row is 1.
 *
 * Row i (0-indexed) has i + 1 entries, and entry j of row i equals
 * the binomial coefficient C(i, j).
 *
 * First 5 rows look like:
 *          1
 *         1 1
 *        1 2 1
 *       1 3 3 1
 *      1 4 6 4 1
 */

"use strict";

/* ------------------------------------------------------------------ *
 * Generate Pascal's triangle with n rows.
 * Returns an array of arrays (jagged: row i has i+1 entries).
 * ------------------------------------------------------------------ */
function pascalTriangle(n) {
  if (n <= 0) return [];
  const triangle = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(i + 1);
    row[0] = 1; // first element always 1
    row[i] = 1; // last element always 1
    // fill interior entries using the recurrence
    for (let j = 1; j < i; j++) {
      row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
    triangle.push(row);
  }
  return triangle;
}

/* ------------------------------------------------------------------ *
 * Pretty-print Pascal's triangle (centered).
 * ------------------------------------------------------------------ */
function printPascalTriangle(triangle) {
  if (triangle.length === 0) return;
  const lastRow = triangle[triangle.length - 1];
  // each number printed with a fixed width; width grows with max value
  const maxVal = lastRow[Math.floor(lastRow.length / 2)];
  const cellWidth = String(maxVal).length + 1;
  const rowWidth = lastRow.length * cellWidth;
  for (const row of triangle) {
    const line = row.map((v) => String(v).padStart(cellWidth)).join("");
    console.log(line.padStart((rowWidth + line.length) / 2));
  }
}

/* ------------------------------------------------------------------ *
 * Helper: get a single binomial coefficient C(n, k) for verification.
 * ------------------------------------------------------------------ */
function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let res = 1;
  for (let i = 0; i < k; i++) {
    res = (res * (n - i)) / (i + 1);
  }
  return Math.round(res);
}

/* ------------------------------------------------------------------ *
 * Test cases
 * ------------------------------------------------------------------ */
console.log("--- pascalTriangle(1) ---");
console.log(pascalTriangle(1));
// Expected: [[1]]

console.log("\n--- pascalTriangle(5) ---");
const t5 = pascalTriangle(5);
console.log(t5);
// Expected:
// [[1],
//  [1,1],
//  [1,2,1],
//  [1,3,3,1],
//  [1,4,6,4,1]]

console.log("\n--- Pretty-printed pascalTriangle(7) ---");
printPascalTriangle(pascalTriangle(7));

console.log("\n--- Verify row 6 equals binomial coefficients ---");
const row6 = pascalTriangle(7)[6];
const expected6 = [];
for (let k = 0; k <= 6; k++) expected6.push(binomial(6, k));
console.log("row 6:    ", row6);
console.log("expected: ", expected6);
console.log(
  "match:",
  JSON.stringify(row6) === JSON.stringify(expected6),
  "(expected true)",
);
// Expected: [1,6,15,20,15,6,1]

console.log("\n--- pascalTriangle(0) ---");
console.log(pascalTriangle(0));
// Expected: []

console.log("\n--- pascalTriangle(10) row count & last row ---");
const t10 = pascalTriangle(10);
console.log("rows =", t10.length, "(expected 10)");
console.log("last row =", t10[9]);
// Expected last row: [1,9,36,84,126,126,84,36,9,1]
