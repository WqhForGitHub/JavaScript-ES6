/**
 * 手写线性方程组求解（高斯消元法）
 * 说明：求解线性方程组 Ax = b，使用带部分主元选取（partial pivoting）的高斯消元法。
 *      先前向消元化为上三角，再回代求出解。
 *      若无唯一解（系数矩阵奇异 / 主元为零），返回 null。
 */

/**
 * 求解 Ax = b
 * @param {number[][]} A n x n 的系数矩阵
 * @param {number[]} b 长度为 n 的常数向量
 * @returns {number[]|null} 解向量 x；若无唯一解返回 null
 */
function gaussElimination(A, b) {
  if (!Array.isArray(A) || !Array.isArray(A[0]) || !Array.isArray(b)) {
    throw new Error("输入必须是二维数组 A 和一维数组 b");
  }
  const n = A.length;
  if (b.length !== n) throw new Error("A 与 b 维度不匹配");
  for (const row of A) {
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error("系数矩阵必须是方阵 (n x n)");
    }
  }

  // 构造增广矩阵 M = [A | b]（深拷贝，避免修改原数组）
  const M = A.map((row, i) => [...row, b[i]]);

  // ===== 前向消元：化为上三角 =====
  for (let col = 0; col < n; col++) {
    // 部分主元：在 col 列的 col..n-1 行中选绝对值最大者
    let pivotRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxVal) {
        maxVal = Math.abs(M[r][col]);
        pivotRow = r;
      }
    }
    // 主元接近零 -> 系数矩阵奇异，无唯一解
    if (maxVal < 1e-12) {
      return null;
    }
    // 交换行
    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    }
    // 消去下方各行的第 col 列
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }

  // ===== 回代 =====
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }
  return x;
}

/**
 * 验证解：计算 Ax 与 b 的误差是否足够小
 * @param {number[][]} A
 * @param {number[]} x
 * @param {number[]} b
 * @param {number} [eps=1e-9]
 * @returns {boolean}
 */
function verify(A, x, b, eps = 1e-9) {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += A[i][j] * x[j];
    if (Math.abs(s - b[i]) > eps) return false;
  }
  return true;
}

// ===== 测试 =====
console.log("===== 高斯消元法求解线性方程组 测试 =====");

// 测试 1: 2x2
// 2x + y = 5
// x + 3y = 10  => x=1, y=3
const A1 = [
  [2, 1],
  [1, 3],
];
const b1 = [5, 10];
const x1 = gaussElimination(A1, b1);
console.log("2x2 解:", x1, " (期望 [1, 3])");
console.log("验证:", verify(A1, x1, b1), " (期望 true)");

// 测试 2: 3x3
// x + y + z = 6
//   2y + 5z = -4
// 2x + 5y - z = 3  解为 [59/7, -19/7, 2/7]
const A2 = [
  [1, 1, 1],
  [0, 2, 5],
  [2, 5, -1],
];
const b2 = [6, -4, 3];
const x2 = gaussElimination(A2, b2);
console.log(
  "3x3 解:",
  x2.map((v) => Number(v.toFixed(6))),
  " (期望 [8.428571, -2.714286, 0.285714])",
);
console.log("验证:", verify(A2, x2, b2), " (期望 true)");

// 测试 3: 4x4（含小数）
const A3 = [
  [1, 2, 1, -1],
  [3, 2, 4, 4],
  [4, 4, 3, 4],
  [2, 0, 1, 5],
];
const b3 = [5, 16, 22, 15];
const x3 = gaussElimination(A3, b3);
console.log(
  "4x4 解:",
  x3.map((v) => Number(v.toFixed(6))),
);
console.log("验证:", verify(A3, x3, b3), " (期望 true)");

// 测试 4: 对角方程组
const A4 = [
  [2, 0, 0],
  [0, 3, 0],
  [0, 0, 4],
];
const b4 = [4, 9, 16];
const x4 = gaussElimination(A4, b4);
console.log(
  "对角方程组解:",
  x4.map((v) => Number(v.toFixed(6))),
  " (期望 [2, 3, 4])",
);

// 测试 5: 奇异矩阵（无唯一解）-> 返回 null
const A5 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const b5 = [6, 15, 24];
console.log("奇异方程组解:", gaussElimination(A5, b5), " (期望 null)");

// 测试 6: 主元为零但非奇异（需要换行）
// [[0,2,3],[4,5,6],[7,8,10]] x = [5,15,25]
const A6 = [
  [0, 2, 3],
  [4, 5, 6],
  [7, 8, 10],
];
const b6 = [5, 15, 25];
const x6 = gaussElimination(A6, b6);
console.log(
  "需换主元的解:",
  x6.map((v) => Number(v.toFixed(6))),
);
console.log("验证:", verify(A6, x6, b6), " (期望 true)");
