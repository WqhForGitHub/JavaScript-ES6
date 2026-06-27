/**
 * 手写矩阵求逆
 * 说明：使用 Gauss-Jordan（高斯-若尔当）消元法求矩阵的逆。
 *      构造增广矩阵 [A | I]，通过初等行变换化为 [I | A^-1]。
 *      若矩阵奇异（不可逆，等价于行列式为 0），在消元过程中检测到主元为零并抛出错误。
 *      为减小浮点误差，使用部分主元选取（partial pivoting）。
 */

/**
 * 矩阵求逆
 * @param {number[][]} mat 方阵的二维数组
 * @returns {number[][]} 逆矩阵的二维数组
 * @throws {Error} 矩阵非方阵或奇异（不可逆）时抛出
 */
function inverse(mat) {
  if (!Array.isArray(mat) || !Array.isArray(mat[0])) {
    throw new Error("输入必须是二维数组");
  }
  const n = mat.length;
  for (const row of mat) {
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error("矩阵必须是方阵 (n x n)");
    }
  }

  // 构造增广矩阵 [A | I]
  const aug = mat.map((row, i) => {
    const idRow = new Array(n).fill(0);
    idRow[i] = 1;
    return [...row, ...idRow];
  });
  const totalCols = 2 * n;

  // Gauss-Jordan 消元：把左半部分化为单位阵
  for (let col = 0; col < n; col++) {
    // 部分主元：在第 col 列的 col..n-1 行中选绝对值最大者
    let pivotRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > maxVal) {
        maxVal = Math.abs(aug[r][col]);
        pivotRow = r;
      }
    }
    // 主元接近零 -> 奇异矩阵（行列式为 0，不可逆）
    if (maxVal < 1e-12) {
      throw new Error("矩阵奇异，不可逆（行列式为 0）");
    }
    // 交换行
    if (pivotRow !== col) {
      [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
    }

    // 归一化主元行，使主元变为 1
    const pivot = aug[col][col];
    for (let j = 0; j < totalCols; j++) {
      aug[col][j] /= pivot;
    }

    // 消去其它行的第 col 列
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < totalCols; j++) {
        aug[r][j] -= factor * aug[col][j];
      }
    }
  }

  // 取右半部分作为逆矩阵
  return aug.map((row) => row.slice(n));
}

/**
 * 矩阵乘法（验证用）
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
function matMul(a, b) {
  const n = a.length;
  const m = b[0].length;
  const k = b.length;
  const result = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let p = 0; p < k; p++) {
      const v = a[i][p];
      for (let j = 0; j < m; j++) {
        result[i][j] += v * b[p][j];
      }
    }
  }
  return result;
}

/**
 * 判断两个矩阵是否近似相等
 * @param {number[][]} a
 * @param {number[][]} b
 * @param {number} [eps=1e-9]
 * @returns {boolean}
 */
function matEqual(a, b, eps = 1e-9) {
  if (a.length !== b.length || a[0].length !== b[0].length) return false;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      if (Math.abs(a[i][j] - b[i][j]) > eps) return false;
    }
  }
  return true;
}

/**
 * 将矩阵格式化为字符串
 * @param {number[][]} m
 * @returns {string}
 */
function matToString(m) {
  return (
    "[\n" +
    m
      .map(
        (row) => "  [" + row.map((x) => Number(x.toFixed(6))).join(", ") + "]",
      )
      .join(",\n") +
    "\n]"
  );
}

// ===== 测试 =====
console.log("===== 矩阵求逆 测试 =====");

// 测试 1: 2x2 矩阵
const A2 = [
  [4, 7],
  [2, 6],
];
const invA2 = inverse(A2);
console.log("A =", matToString(A2));
console.log("A^-1 =", matToString(invA2));
console.log(
  "A * A^-1 = I ?",
  matEqual(matMul(A2, invA2), [
    [1, 0],
    [0, 1],
  ]),
  " (期望 true)",
);
// 期望逆矩阵约 [[0.6, -0.7], [-0.2, 0.4]]

// 测试 2: 3x3 矩阵
const A3 = [
  [2, 1, 1],
  [1, 3, 2],
  [1, 0, 0],
];
const invA3 = inverse(A3);
console.log("3x3 A^-1 =", matToString(invA3));
console.log(
  "A * A^-1 = I ?",
  matEqual(matMul(A3, invA3), [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]),
  " (期望 true)",
);

// 测试 3: 单位矩阵的逆是自身
const I3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
console.log("I^-1 = I ?", matEqual(inverse(I3), I3), " (期望 true)");

// 测试 4: 对角矩阵
const D2 = [
  [2, 0],
  [0, 4],
];
console.log("diag(2,4)^-1 =", matToString(inverse(D2)));
console.log("期望 = [[0.5, 0], [0, 0.25]]");

// 测试 5: 奇异矩阵（不可逆，行列式为 0）
const S = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
try {
  inverse(S);
  console.log("错误: 奇异矩阵未抛出异常");
} catch (e) {
  console.log("奇异矩阵检测:", e.message);
}

// 测试 6: 非方阵
try {
  inverse([
    [1, 2, 3],
    [4, 5, 6],
  ]);
} catch (e) {
  console.log("非方阵错误:", e.message);
}
