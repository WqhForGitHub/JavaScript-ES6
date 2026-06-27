/**
 * 手写拉格朗日插值
 *
 * 拉格朗日插值（Lagrange Interpolation）：
 * 给定 n+1 个点 (x_0, y_0), (x_1, y_1), ..., (x_n, y_n)，
 * 其中 x_i 互不相同，构造一个次数不超过 n 的多项式 L(x)，使其经过所有给定点。
 *
 * 公式：
 * L(x) = sum_{i=0}^{n} y_i * l_i(x)
 * 其中基函数：
 * l_i(x) = prod_{j!=i} (x - x_j) / (x_i - x_j)
 *
 * 性质：l_i(x_j) = delta_{ij}（克罗内克 delta）
 *
 * 优点：构造简单，理论清晰。
 * 缺点：增加新点需重新计算，数值稳定性不如牛顿插值（Runge 现象）。
 */

/**
 * 构造拉格朗日插值多项式并求值
 *
 * 直接法：对每个 i 计算 l_i(x)，加权求和。
 *
 * 时间复杂度：O(n^2)
 *
 * @param {number[]} xs 已知点的 x 坐标数组
 * @param {number[]} ys 已知点的 y 坐标数组
 * @param {number} x 要求值的点
 * @returns {number} 插值结果 L(x)
 */
function lagrangeInterpolate(xs, ys, x) {
  if (xs.length !== ys.length) {
    throw new Error("xs 和 ys 长度必须相同");
  }
  const n = xs.length;
  let result = 0;

  for (let i = 0; i < n; i++) {
    // 计算 l_i(x) = prod_{j!=i} (x - x_j) / (x_i - x_j)
    let term = ys[i];
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        term *= (x - xs[j]) / (xs[i] - xs[j]);
      }
    }
    result += term;
  }

  return result;
}

/**
 * 计算第 i 个拉格朗日基函数 l_i(x) 的值
 *
 * @param {number[]} xs x 坐标数组
 * @param {number} i 基函数下标
 * @param {number} x 求值点
 * @returns {number} l_i(x)
 */
function lagrangeBasis(xs, i, x) {
  let result = 1;
  for (let j = 0; j < xs.length; j++) {
    if (j !== i) {
      result *= (x - xs[j]) / (xs[i] - xs[j]);
    }
  }
  return result;
}

/**
 * 重心拉格朗日插值（优化版）
 *
 * 预计算权重 w_i = prod_{j!=i} 1/(x_i - x_j)
 * 求值时：L(x) = sum(y_i * w_i / (x - x_i)) / sum(w_i / (x - x_i))
 *
 * 优点：增加点时只需更新权重，求值更快 O(n)。
 *
 * @param {number[]} xs x 坐标数组
 * @param {number[]} ys y 坐标数组
 * @returns {{evaluate: (x: number) => number}} 插值器对象
 */
function lagrangeBarycentric(xs, ys) {
  const n = xs.length;
  // 预计算重心权重
  const w = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        w[i] *= xs[i] - xs[j];
      }
    }
    w[i] = 1 / w[i];
  }

  return {
    /**
     * 在 x 处求值
     * @param {number} x 求值点
     * @returns {number} L(x)
     */
    evaluate(x) {
      // 检查是否正好命中某个节点
      for (let i = 0; i < n; i++) {
        if (x === xs[i]) return ys[i];
      }
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        const term = w[i] / (x - xs[i]);
        numerator += term * ys[i];
        denominator += term;
      }
      return numerator / denominator;
    },
  };
}

/**
 * 在多个点上求插值
 *
 * @param {number[]} xs 已知点 x 坐标
 * @param {number[]} ys 已知点 y 坐标
 * @param {number[]} points 要求值的点数组
 * @returns {number[]} 插值结果数组
 */
function lagrangeInterpolateBatch(xs, ys, points) {
  return points.map((x) => lagrangeInterpolate(xs, ys, x));
}

// ===== 测试 =====
console.log("===== 手写拉格朗日插值 =====\n");

// 测试 1：线性插值
console.log("1. 线性插值（2 点）:");
const xs1 = [0, 1];
const ys1 = [0, 2];
console.log(
  "  已知点:",
  xs1.map((x, i) => "(" + x + "," + ys1[i] + ")").join(", "),
);
console.log("  L(0.5) =", lagrangeInterpolate(xs1, ys1, 0.5), "（预期 1）");
console.log("  L(0.25) =", lagrangeInterpolate(xs1, ys1, 0.25), "（预期 0.5）");

// 测试 2：二次插值（已知 y = x^2）
console.log("\n2. 二次插值（y = x^2，3 点）:");
const xs2 = [0, 1, 2];
const ys2 = [0, 1, 4];
console.log(
  "  已知点:",
  xs2.map((x, i) => "(" + x + "," + ys2[i] + ")").join(", "),
);
console.log("  L(0.5) =", lagrangeInterpolate(xs2, ys2, 0.5), "（预期 0.25）");
console.log("  L(1.5) =", lagrangeInterpolate(xs2, ys2, 1.5), "（预期 2.25）");
console.log("  L(3) =", lagrangeInterpolate(xs2, ys2, 3), "（外推，预期 9）");

// 测试 3：插值多项式经过所有已知点
console.log("\n3. 验证插值多项式经过所有已知点:");
const xs3 = [1, 2, 3, 4];
const ys3 = [1, 4, 9, 16]; // y = x^2
xs3.forEach((x, i) => {
  console.log(
    "  L(" + x + ") =",
    lagrangeInterpolate(xs3, ys3, x),
    "（预期 " + ys3[i] + "）",
  );
});

// 测试 4：正弦函数插值
console.log("\n4. 正弦函数 sin(x) 插值:");
const xs4 = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI];
const ys4 = xs4.map((x) => Math.sin(x));
const interp = lagrangeBarycentric(xs4, ys4);
const testPoints = [Math.PI / 6, Math.PI / 3, Math.PI / 2 - 0.1];
console.log(
  "  已知点:",
  xs4
    .map((x, i) => "(" + x.toFixed(3) + "," + ys4[i].toFixed(3) + ")")
    .join(", "),
);
testPoints.forEach((x) => {
  const interpVal = interp.evaluate(x);
  const actual = Math.sin(x);
  console.log(
    "  x =" +
      x.toFixed(4) +
      ", 插值 =" +
      interpVal.toFixed(6) +
      ", 实际 =" +
      actual.toFixed(6) +
      ", 误差 =" +
      Math.abs(interpVal - actual).toExponential(2),
  );
});

// 测试 5：批量求值
console.log("\n5. 批量求值（y = 2x + 1）:");
const xs5 = [0, 1, 2];
const ys5 = [1, 3, 5];
const points5 = [-1, 0.5, 1.5, 3];
const results5 = lagrangeInterpolateBatch(xs5, ys5, points5);
points5.forEach((p, i) => {
  console.log("  L(" + p + ") =", results5[i], "（实际", 2 * p + 1, "）");
});

// 测试 6：重心插值与直接法结果一致
console.log("\n6. 重心插值与直接法一致性:");
const xs6 = [1, 2, 3, 4, 5];
const ys6 = [2, 4, 8, 16, 32];
const interp6 = lagrangeBarycentric(xs6, ys6);
const testX = 2.5;
console.log(
  "  直接法: L(" + testX + ") =",
  lagrangeInterpolate(xs6, ys6, testX),
);
console.log("  重心法: L(" + testX + ") =", interp6.evaluate(testX));
console.log(
  "  一致:",
  Math.abs(lagrangeInterpolate(xs6, ys6, testX) - interp6.evaluate(testX)) <
    1e-10,
);

// 测试 7：三次多项式精确插值
console.log("\n7. 三次多项式精确插值 y = x^3 - 2x:");
const xs7 = [-2, -1, 1, 2];
const ys7 = xs7.map((x) => x * x * x - 2 * x);
const interp7 = lagrangeBarycentric(xs7, ys7);
console.log(
  "  已知点:",
  xs7.map((x, i) => "(" + x + "," + ys7[i] + ")").join(", "),
);
[0, 0.5, 1.5].forEach((x) => {
  const actual = x * x * x - 2 * x;
  const interpVal = interp7.evaluate(x);
  console.log(
    "  L(" + x + ") =" + interpVal.toFixed(6) + ", 实际 =" + actual.toFixed(6),
  );
});
