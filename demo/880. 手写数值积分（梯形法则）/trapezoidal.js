/**
 * 手写数值积分（梯形法则）
 *
 * 梯形法则（Trapezoidal Rule）：数值积分方法，用梯形面积近似曲线下面积。
 *
 * 将区间 [a, b] 分成 n 个等长小区间，每个小区间上用梯形近似积分。
 * 步长 h = (b - a) / n
 *
 * 公式：
 * ∫_a^b f(x) dx ≈ h/2 * [f(x_0) + 2*f(x_1) + 2*f(x_2) + ... + 2*f(x_{n-1}) + f(x_n)]
 *              = h/2 * (f(a) + f(b)) + h * sum_{i=1}^{n-1} f(x_i)
 *              = h * [ (f(a) + f(b)) / 2 + sum_{i=1}^{n-1} f(x_i) ]
 *
 * 其中 x_i = a + i*h
 *
 * 误差：O(h^2)，即与步长的平方成正比。n 越大误差越小。
 *
 * 复化梯形公式的误差估计：|E| <= (b-a) * h^2 / 12 * max|f''(x)|
 */

/**
 * 梯形法则数值积分
 *
 * @param {(x: number) => number} f 被积函数
 * @param {number} a 积分下限
 * @param {number} b 积分上限
 * @param {number} n 区间数（n 越大越精确）
 * @returns {number} 积分近似值
 */
function trapezoidal(f, a, b, n) {
  if (n <= 0) throw new Error("区间数 n 必须为正整数");
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += f(x);
  }
  return sum * h;
}

/**
 * 梯形法则详细版（输出每步信息）
 *
 * @param {(x: number) => number} f 被积函数
 * @param {number} a 积分下限
 * @param {number} b 积分上限
 * @param {number} n 区间数
 */
function trapezoidalVerbose(f, a, b, n) {
  const h = (b - a) / n;
  console.log("  步长 h =", h);
  let sum = (f(a) + f(b)) / 2;
  console.log("  f(a) =" + f(a) + ", f(b) =" + f(b));
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = f(x);
    sum += fx;
    if (i <= 5 || i >= n - 1) {
      console.log(
        "  x_" + i + " =" + x.toFixed(6) + ", f(x_" + i + ") =" + fx.toFixed(6),
      );
    } else if (i === 6) {
      console.log("  ...（省略中间项）...");
    }
  }
  const result = sum * h;
  console.log("  积分结果 =", result);
  return result;
}

/**
 * 复化辛普森法则（Simpson's Rule）- 对比参考
 * 较梯形法则更精确（误差 O(h^4)）
 *
 * 公式：∫f ≈ h/3 * [f(x_0) + 4*sum(f(奇数)) + 2*sum(f(偶数)) + f(x_n)]
 *
 * @param {(x: number) => number} f 被积函数
 * @param {number} a 积分下限
 * @param {number} b 积分上限
 * @param {number} n 区间数（必须为偶数）
 * @returns {number} 积分近似值
 */
function simpson(f, a, b, n) {
  if (n % 2 !== 0) n++; // 强制偶数
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
  }
  return (sum * h) / 3;
}

/**
 * 龙贝格积分（Romberg Integration）- 高精度对比
 * 利用梯形法则的外推加速
 *
 * @param {(x: number) => number} f 被积函数
 * @param {number} a 积分下限
 * @param {number} b 积分上限
 * @param {number} maxIter 最大迭代次数
 * @returns {number} 积分近似值
 */
function romberg(f, a, b, maxIter = 20) {
  const R = Array.from({ length: maxIter }, () => new Array(maxIter).fill(0));
  R[0][0] = ((b - a) / 2) * (f(a) + f(b));
  for (let i = 1; i < maxIter; i++) {
    const n = 2 ** i;
    const h = (b - a) / n;
    let sum = 0;
    for (let k = 1; k <= 2 ** (i - 1); k++) {
      sum += f(a + (2 * k - 1) * h);
    }
    R[i][0] = R[i - 1][0] / 2 + h * sum;
    for (let j = 1; j <= i; j++) {
      R[i][j] = R[i][j - 1] + (R[i][j - 1] - R[i - 1][j - 1]) / (4 ** j - 1);
    }
  }
  return R[maxIter - 1][maxIter - 1];
}

// ===== 测试 =====
console.log("===== 手写数值积分（梯形法则）=====\n");

// 测试 1：积分 x^2 从 0 到 1，精确值 1/3
console.log("1. 积分 x^2 从 0 到 1（精确值 = 1/3 ≈ 0.333333）:");
const f1 = (x) => x * x;
const r1 = trapezoidal(f1, 0, 1, 100);
console.log("  n=100:", r1, "误差:", Math.abs(r1 - 1 / 3).toExponential(2));

// 测试 2：详细过程
console.log("\n2. 详细过程 - 积分 x^2 从 0 到 1（n=10）:");
trapezoidalVerbose(f1, 0, 1, 10);

// 测试 3：不同 n 值的收敛性
console.log("\n3. 不同 n 值收敛性（积分 x^2 从 0 到 1）:");
console.log("  精确值 = 1/3 ≈ 0.3333333");
[10, 50, 100, 500, 1000, 5000, 10000].forEach((n) => {
  const result = trapezoidal(f1, 0, 1, n);
  const error = Math.abs(result - 1 / 3);
  console.log(
    "  n=" +
      n +
      " → " +
      result.toFixed(8) +
      ", 误差 =" +
      error.toExponential(2),
  );
});

// 测试 4：积分 sin(x) 从 0 到 pi，精确值 2
console.log("\n4. 积分 sin(x) 从 0 到 pi（精确值 = 2）:");
const f4 = (x) => Math.sin(x);
const r4 = trapezoidal(f4, 0, Math.PI, 1000);
console.log("  n=1000:", r4, "误差:", Math.abs(r4 - 2).toExponential(2));

// 测试 5：积分 e^x 从 0 到 1，精确值 e - 1 ≈ 1.71828
console.log("\n5. 积分 e^x 从 0 到 1（精确值 = e - 1 ≈ 1.7182818）:");
const f5 = (x) => Math.exp(x);
const r5 = trapezoidal(f5, 0, 1, 1000);
console.log(
  "  n=1000:",
  r5,
  "误差:",
  Math.abs(r5 - (Math.E - 1)).toExponential(2),
);

// 测试 6：积分 1/x 从 1 到 e，精确值 1
console.log("\n6. 积分 1/x 从 1 到 e（精确值 = 1）:");
const f6 = (x) => 1 / x;
const r6 = trapezoidal(f6, 1, Math.E, 1000);
console.log("  n=1000:", r6, "误差:", Math.abs(r6 - 1).toExponential(2));

// 测试 7：对比梯形、辛普森、龙贝格
console.log("\n7. 三种方法对比（积分 x^2 从 0 到 1，精确 1/3）:");
console.log("  梯形 n=100:", trapezoidal(f1, 0, 1, 100));
console.log("  辛普森 n=100:", simpson(f1, 0, 1, 100));
console.log("  龙贝格 iter=10:", romberg(f1, 0, 1, 10));
console.log("  精确值:", 1 / 3);

// 测试 8：积分常数函数
console.log("\n8. 积分常数 5 从 0 到 3（精确值 = 15）:");
const f8 = () => 5;
console.log("  结果:", trapezoidal(f8, 0, 3, 10), "（精确 15）");

// 测试 9：积分线性函数（梯形法则应精确）
console.log("\n9. 积分 2x+1 从 0 到 2（梯形法则对线性函数精确，精确值 = 6）:");
const f9 = (x) => 2 * x + 1;
console.log("  n=1:", trapezoidal(f9, 0, 2, 1), "（应精确等于 6）");
console.log("  n=10:", trapezoidal(f9, 0, 2, 10), "（应精确等于 6）");

// 测试 10：高斯函数近似
console.log("\n10. 积分 e^(-x^2) 从 -1 到 1（高斯函数，精确值 ≈ 1.49365）:");
const f10 = (x) => Math.exp(-x * x);
console.log("  n=1000:", trapezoidal(f10, -1, 1, 1000));
console.log("  参考: √pi * erf(1) ≈ 1.49365");
