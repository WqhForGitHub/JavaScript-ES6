/**
 * 手写二分法求根
 *
 * 二分法（Bisection Method）：求连续函数 f(x) = 0 在区间 [a, b] 内的根。
 *
 * 前提条件：f 在 [a, b] 上连续，且 f(a) * f(b) < 0（即两端点异号），
 * 根据介值定理，区间内至少存在一个根。
 *
 * 算法步骤：
 * 1. 计算中点 c = (a + b) / 2
 * 2. 若 f(c) == 0 或 (b - a) / 2 < tol，c 即为根
 * 3. 若 f(a) * f(c) < 0，根在 [a, c]，令 b = c
 * 4. 否则根在 [c, b]，令 a = c
 * 5. 重复直到满足精度或达到最大迭代次数
 *
 * 收敛速度：线性收敛，每次迭代区间长度减半。
 * 迭代次数：约 log2((b - a) / tol) 次。
 *
 * 优点：简单、稳定、必定收敛（满足前提时）。
 * 缺点：收敛慢，无法求偶数重根。
 */

/**
 * 二分法求根
 *
 * @param {(x: number) => number} f 连续函数
 * @param {number} a 区间左端点
 * @param {number} b 区间右端点
 * @param {number} [tol=1e-10] 容差
 * @param {number} [maxIter=100] 最大迭代次数
 * @returns {{root: number, iterations: number, converged: boolean}} 求根结果
 * @throws {Error} 若 f(a) * f(b) >= 0
 */
function bisection(f, a, b, tol = 1e-10, maxIter = 100) {
  const fa = f(a);
  const fb = f(b);

  // 前提检查
  if (fa * fb > 0) {
    throw new Error("f(a) 和 f(b) 同号，无法保证区间内有根");
  }

  // 边界情况
  if (fa === 0) return { root: a, iterations: 0, converged: true };
  if (fb === 0) return { root: b, iterations: 0, converged: true };

  let iterations = 0;
  let converged = false;
  let c = a;

  for (let i = 0; i < maxIter; i++) {
    c = (a + b) / 2;
    const fc = f(c);
    iterations = i + 1;

    // 收敛判断
    if (Math.abs(fc) < tol || (b - a) / 2 < tol) {
      converged = true;
      break;
    }

    // 缩小区间
    if (fa * fc < 0) {
      b = c;
    } else {
      a = c;
    }
  }

  return { root: c, iterations, converged };
}

/**
 * 二分法详细版（带每步输出）
 *
 * @param {(x: number) => number} f 连续函数
 * @param {number} a 区间左端点
 * @param {number} b 区间右端点
 * @param {number} tol 容差
 * @param {number} maxIter 最大迭代次数
 */
function bisectionVerbose(f, a, b, tol = 1e-10, maxIter = 100) {
  let fa = f(a);
  let fb = f(b);
  if (fa * fb > 0) {
    console.log("  f(a) 和 f(b) 同号！");
    return null;
  }
  console.log("  初始区间: [" + a + ", " + b + "]");
  for (let i = 0; i < maxIter; i++) {
    const c = (a + b) / 2;
    const fc = f(c);
    console.log(
      "  第 " +
        (i + 1) +
        " 次: c =" +
        c.toFixed(12) +
        ", f(c) =" +
        fc.toExponential(3) +
        ", 区间长度 =" +
        (b - a).toExponential(3),
    );
    if (Math.abs(fc) < tol || (b - a) / 2 < tol) {
      console.log("  收敛！根 =", c);
      return { root: c, iterations: i + 1, converged: true };
    }
    if (fa * fc < 0) {
      b = c;
    } else {
      a = c;
      fa = fc;
    }
  }
  return { root: (a + b) / 2, iterations: maxIter, converged: false };
}

// ===== 测试 =====
console.log("===== 手写二分法求根 =====\n");

// 测试 1：求 sqrt(2)，解 x^2 - 2 = 0，根在 [1, 2]
console.log("1. 求 sqrt(2)（解 x^2 - 2 = 0，区间 [1, 2]）:");
const f1 = (x) => x * x - 2;
const r1 = bisection(f1, 1, 2);
console.log("  根:", r1.root);
console.log("  迭代次数:", r1.iterations);
console.log("  收敛:", r1.converged);
console.log("  Math.sqrt(2) =", Math.sqrt(2));
console.log("  误差:", Math.abs(r1.root - Math.sqrt(2)));

// 测试 2：详细过程
console.log("\n2. 详细过程 - 求 x^3 - x - 2 = 0（区间 [1, 2]）:");
const f2 = (x) => x * x * x - x - 2;
bisectionVerbose(f2, 1, 2, 1e-8, 30);

// 测试 3：求 sin(x) 在 [3, 4] 的根（预期 pi）
console.log("\n3. 求 sin(x) = 0 在 [3, 4] 的根（预期 pi）:");
const f3 = (x) => Math.sin(x);
const r3 = bisection(f3, 3, 4);
console.log("  根:", r3.root);
console.log("  Math.PI =", Math.PI);
console.log("  误差:", Math.abs(r3.root - Math.PI));

// 测试 4：求 e^x - 3 = 0 在 [0, 2] 的根（预期 ln(3)）
console.log("\n4. 求 e^x - 3 = 0 在 [0, 2] 的根（预期 ln(3)）:");
const f4 = (x) => Math.exp(x) - 3;
const r4 = bisection(f4, 0, 2);
console.log("  根:", r4.root);
console.log("  Math.log(3) =", Math.log(3));
console.log("  误差:", Math.abs(r4.root - Math.log(3)));

// 测试 5：求 x^3 - 2x - 5 = 0 在 [2, 3] 的根
console.log("\n5. 求 x^3 - 2x - 5 = 0 在 [2, 3] 的根:");
const f5 = (x) => x * x * x - 2 * x - 5;
const r5 = bisection(f5, 2, 3);
console.log("  根:", r5.root);
console.log("  验证 f(root):", f5(r5.root));
console.log("  迭代次数:", r5.iterations);

// 测试 6：不同容差
console.log("\n6. 不同容差对比（求 sqrt(2)）:");
const tolerances = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-14];
tolerances.forEach((tol) => {
  const r = bisection(f1, 1, 2, tol);
  console.log(
    "  tol =" +
      tol.toExponential(0) +
      " → 根 =" +
      r.root +
      ", 迭代 " +
      r.iterations +
      " 次",
  );
});

// 测试 7：异常情况 - 区间两端同号
console.log("\n7. 异常情况（区间两端同号）:");
try {
  bisection(f1, 2, 3); // f(2)=2, f(3)=7 同号
} catch (e) {
  console.log("  捕获异常:", e.message);
}

// 测试 8：负根 - 求 x^2 - 4 = 0 在 [-3, -1] 的根（预期 -2）
console.log("\n8. 求负根 x^2 - 4 = 0 在 [-3, -1] 的根（预期 -2）:");
const f8 = (x) => x * x - 4;
const r8 = bisection(f8, -3, -1);
console.log("  根:", r8.root, "（预期 -2）");
