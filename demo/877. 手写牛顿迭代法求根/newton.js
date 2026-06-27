/**
 * 手写牛顿迭代法求根
 *
 * 牛顿迭代法（Newton's Method）：用于求方程 f(x) = 0 的根。
 *
 * 迭代公式：x_{n+1} = x_n - f(x_n) / f'(x_n)
 *
 * 几何意义：在当前点 (x_n, f(x_n)) 处作切线，切线与 x 轴的交点作为下一个近似根。
 *
 * 收敛条件：f 在根附近可导，且 f'(root) != 0，初始猜测足够接近根时，二次收敛。
 *
 * 注意事项：
 * - 若 f'(x_n) 接近 0，迭代会发散或停滞
 * - 牛顿法不保证全局收敛，需要好的初始猜测
 * - 对于多重根，收敛速度降为线性
 */

/**
 * 牛顿迭代法求根
 *
 * @param {(x: number) => number} f 目标函数 f(x)
 * @param {(x: number) => number} df 导函数 f'(x)
 * @param {number} x0 初始猜测
 * @param {number} [tol=1e-10] 容差（两次迭代差的绝对值）
 * @param {number} [maxIter=100] 最大迭代次数
 * @returns {{root: number, iterations: number, converged: boolean}} 求根结果
 */
function newton(f, df, x0, tol = 1e-10, maxIter = 100) {
  let x = x0;
  let iterations = 0;
  let converged = false;

  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    const dfx = df(x);

    // 防止除零
    if (Math.abs(dfx) < 1e-15) {
      console.warn("导数接近 0，迭代中止");
      break;
    }

    const xNew = x - fx / dfx;
    iterations = i + 1;

    // 收敛判断：两次迭代差小于容差，或函数值接近 0
    if (Math.abs(xNew - x) < tol || Math.abs(fx) < tol) {
      x = xNew;
      converged = true;
      break;
    }
    x = xNew;
  }

  return { root: x, iterations, converged };
}

/**
 * 牛顿迭代法的详细版本（带每步输出）
 *
 * @param {(x: number) => number} f 目标函数
 * @param {(x: number) => number} df 导函数
 * @param {number} x0 初始猜测
 * @param {number} tol 容差
 * @param {number} maxIter 最大迭代次数
 */
function newtonVerbose(f, df, x0, tol = 1e-10, maxIter = 100) {
  let x = x0;
  console.log("  初始 x0 =", x);
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    const dfx = df(x);
    if (Math.abs(dfx) < 1e-15) {
      console.log("  第 " + (i + 1) + " 次: 导数接近 0，中止");
      break;
    }
    const xNew = x - fx / dfx;
    console.log(
      "  第 " +
        (i + 1) +
        " 次: x =" +
        xNew.toFixed(12) +
        ", f(x) =" +
        fx.toExponential(3),
    );
    if (Math.abs(xNew - x) < tol || Math.abs(fx) < tol) {
      console.log("  收敛！");
      return { root: xNew, iterations: i + 1, converged: true };
    }
    x = xNew;
  }
  return { root: x, iterations: maxIter, converged: false };
}

// ===== 测试 =====
console.log("===== 手写牛顿迭代法求根 =====\n");

// 测试 1：求 sqrt(2)，即解 x^2 - 2 = 0
console.log("1. 求 sqrt(2)（解 x^2 - 2 = 0）:");
const f1 = (x) => x * x - 2;
const df1 = (x) => 2 * x;
const r1 = newton(f1, df1, 1.5);
console.log("  根:", r1.root);
console.log("  迭代次数:", r1.iterations);
console.log("  收敛:", r1.converged);
console.log("  验证 f(root):", f1(r1.root));
console.log("  Math.sqrt(2) =", Math.sqrt(2));
console.log("  误差:", Math.abs(r1.root - Math.sqrt(2)));

// 测试 2：详细过程 - sqrt(2)
console.log("\n2. 详细过程 - sqrt(2):");
newtonVerbose(f1, df1, 1.0);

// 测试 3：求立方根，解 x^3 - 8 = 0，预期根为 2
console.log("\n3. 求立方根 8^(1/3)（解 x^3 - 8 = 0）:");
const f3 = (x) => x * x * x - 8;
const df3 = (x) => 3 * x * x;
const r3 = newton(f3, df3, 1.0);
console.log("  根:", r3.root, "（预期 2）");
console.log("  迭代次数:", r3.iterations);

// 测试 4：求 sin(x) = 0 在 3 附近的根（预期 pi）
console.log("\n4. 求 sin(x) = 0 在 3 附近的根（预期 pi）:");
const f4 = (x) => Math.sin(x);
const df4 = (x) => Math.cos(x);
const r4 = newton(f4, df4, 3.0);
console.log("  根:", r4.root);
console.log("  Math.PI =", Math.PI);
console.log("  误差:", Math.abs(r4.root - Math.PI));

// 测试 5：求 e^x - 3 = 0 的根（预期 ln(3)）
console.log("\n5. 求 e^x - 3 = 0（预期 ln(3) = 1.0986）:");
const f5 = (x) => Math.exp(x) - 3;
const df5 = (x) => Math.exp(x);
const r5 = newton(f5, df5, 1.0);
console.log("  根:", r5.root);
console.log("  Math.log(3) =", Math.log(3));
console.log("  误差:", Math.abs(r5.root - Math.log(3)));

// 测试 6：求高次方程 x^3 - 2x - 5 = 0 的根（经典测试）
console.log("\n6. 求 x^3 - 2x - 5 = 0 的根（经典测试，根约 2.0946）:");
const f6 = (x) => x * x * x - 2 * x - 5;
const df6 = (x) => 3 * x * x - 2;
const r6 = newton(f6, df6, 2.0);
console.log("  根:", r6.root);
console.log("  验证 f(root):", f6(r6.root));
console.log("  迭代次数:", r6.iterations);

// 测试 7：不同初始猜测的影响
console.log("\n7. 不同初始猜测（求 x^2 - 4 = 0，根为 ±2）:");
console.log(
  "  x0 = 1:",
  newton(
    (x) => x * x - 4,
    (x) => 2 * x,
    1,
  ).root,
  "（预期 2）",
);
console.log(
  "  x0 = -1:",
  newton(
    (x) => x * x - 4,
    (x) => 2 * x,
    -1,
  ).root,
  "（预期 -2）",
);
console.log(
  "  x0 = 100:",
  newton(
    (x) => x * x - 4,
    (x) => 2 * x,
    100,
  ).root,
  "（仍收敛到 2）",
);
