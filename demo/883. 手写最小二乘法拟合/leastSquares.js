/**
 * 最小二乘法线性拟合 (Linear Least Squares)
 *
 * 给定一组数据点 (xi, yi)，拟合直线 y = a*x + b，
 * 使得残差平方和 Σ (yi - (a*xi + b))² 最小。
 *
 * 由正规方程解得:
 *   a = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
 *   b = (Σy - a·Σx) / n
 *
 * 同时可计算判定系数 R² 衡量拟合优度。
 */

/**
 * 线性最小二乘拟合 y = a*x + b
 * @param {number[]} xs - x 坐标数组
 * @param {number[]} ys - y 坐标数组
 * @returns {{a: number, b: number, r2: number}}
 *   a  - 斜率
 *   b  - 截距
 *   r2 - 判定系数 R² (越接近 1 拟合越好)
 */
function linearLeastSquares(xs, ys) {
  const n = xs.length;
  if (n !== ys.length || n === 0) {
    throw new Error("xs 与 ys 长度须相同且非空");
  }

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumX2 += xs[i] * xs[i];
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) throw new Error("所有 x 相同，无法拟合斜率");

  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;

  // 计算 R²
  const meanY = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = a * xs[i] + b;
    ssTot += (ys[i] - meanY) ** 2;
    ssRes += (ys[i] - pred) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, r2 };
}

// ---- 测试 ----

// 测试 1: 带噪声的线性数据 y ≈ 2x + 1
const data = [
  [0, 1.1],
  [1, 2.9],
  [2, 5.2],
  [3, 6.8],
  [4, 9.1],
  [5, 10.8],
  [6, 13.2],
  [7, 14.9],
  [8, 17.1],
  [9, 18.8],
];
const xs1 = data.map((p) => p[0]);
const ys1 = data.map((p) => p[1]);
const fit1 = linearLeastSquares(xs1, ys1);
console.log("测试1 - 带噪声数据 y ≈ 2x + 1:");
console.log(`  拟合: y = ${fit1.a.toFixed(4)}*x + ${fit1.b.toFixed(4)}`);
console.log(`  R² = ${fit1.r2.toFixed(6)}  (期望 a≈2, b≈1, R²≈1)`);

// 测试 2: 完美线性数据 y = 2x + 1
const fit2 = linearLeastSquares([1, 2, 3, 4], [3, 5, 7, 9]);
console.log("\n测试2 - 完美数据 y = 2x + 1:");
console.log(
  `  a = ${fit2.a}, b = ${fit2.b}, R² = ${fit2.r2}  (期望 a=2, b=1, R²=1)`,
);

// 测试 3: 水平线 y = 5
const fit3 = linearLeastSquares([1, 2, 3, 4, 5], [5, 5, 5, 5, 5]);
console.log("\n测试3 - 水平线 y = 5:");
console.log(
  `  a = ${fit3.a}, b = ${fit3.b}, R² = ${fit3.r2}  (期望 a=0, b=5, R²=1)`,
);

// 测试 4: 较大噪声数据
const xs4 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ys4 = [1, 4, 3, 8, 5, 12, 7, 16, 9, 20]; // y=x+1 加较大噪声
const fit4 = linearLeastSquares(xs4, ys4);
console.log("\n测试4 - 大噪声数据:");
console.log(`  拟合: y = ${fit4.a.toFixed(4)}*x + ${fit4.b.toFixed(4)}`);
console.log(`  R² = ${fit4.r2.toFixed(6)}`);
