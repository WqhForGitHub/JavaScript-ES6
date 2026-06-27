/**
 * 数值积分 - 辛普森法则 (Simpson's Rule)
 *
 * 复合辛普森法则用于数值计算定积分 ∫[a,b] f(x) dx。
 * 将区间 [a,b] 分成 n (偶数) 个子区间，用抛物线段逼近被积函数。
 *
 * 公式:
 *   ∫ ≈ (h/3) * [ f(x0) + 4*Σf(x奇) + 2*Σf(x偶) + f(xn) ]
 *   其中 h = (b-a)/n, x_i = a + i*h
 *
 * 复合辛普森对三次及以下多项式精确成立，精度为 O(h^4)。
 * 本文件同时实现梯形法则 (O(h²)) 做对比, 直观展示辛普森的高精度。
 */

/**
 * 复合辛普森法则数值积分
 * @param {Function} f - 被积函数
 * @param {number} a   - 积分下限
 * @param {number} b   - 积分上限
 * @param {number} n   - 子区间数 (若为奇数则自动 +1 强制为偶数)
 * @returns {number}   - 积分近似值
 */
function simpson(f, a, b, n) {
  if (n <= 0) throw new Error("n 必须为正数");
  if (n % 2 !== 0) n += 1; // 辛普森法则要求偶数个子区间

  const h = (b - a) / n;
  let sum = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    // 奇数下标系数为 4，偶数下标系数为 2
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }

  return (h / 3) * sum;
}

/**
 * 复合梯形法则数值积分 (用于与辛普森对比)
 * 公式: ∫ ≈ (h/2) * [ f(x0) + 2·Σf(xi) + f(xn) ], 精度 O(h²)。
 * @param {Function} f - 被积函数
 * @param {number} a   - 积分下限
 * @param {number} b   - 积分上限
 * @param {number} n   - 子区间数
 * @returns {number}   - 积分近似值
 */
function trapezoidal(f, a, b, n) {
  if (n <= 0) throw new Error("n 必须为正数");
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += 2 * f(a + i * h);
  }
  return (h / 2) * sum;
}

// ---- 测试 ----

// 测试 1: ∫[0,π] sin(x) dx = [-cos(x)] = -cos(π) + cos(0) = 1 + 1 = 2
const r1 = simpson(Math.sin, 0, Math.PI, 1000);
console.log("∫[0,π] sin(x) dx  =", r1.toFixed(8), "  (期望: 2)");

// 测试 2: ∫[0,1] x^2 dx = 1/3 ≈ 0.333333...
const r2 = simpson((x) => x * x, 0, 1, 1000);
console.log("∫[0,1] x² dx       =", r2.toFixed(8), "  (期望: 0.33333333)");

// 测试 3: ∫[0,1] x dx = 0.5
const r3 = simpson((x) => x, 0, 1, 100);
console.log("∫[0,1] x dx        =", r3.toFixed(8), "  (期望: 0.5)");

// 测试 4: ∫[0,2π] sin(x) dx = 0
const r4 = simpson(Math.sin, 0, 2 * Math.PI, 1000);
console.log("∫[0,2π] sin(x) dx  =", r4.toFixed(8), "  (期望: 0)");

// 测试 5: ∫[0,2] e^x dx = e²-1 ≈ 6.389056...
const r5 = simpson(Math.exp, 0, 2, 1000);
console.log(
  "∫[0,2] e^x dx      =",
  r5.toFixed(8),
  "  (期望:",
  (Math.exp(2) - 1).toFixed(8) + ")",
);

// 测试 6: 辛普森对三次多项式应精确。∫[0,1] x³ dx = 1/4 = 0.25
const r6 = simpson((x) => x * x * x, 0, 1, 2);
console.log("∫[0,1] x³ dx (n=2) =", r6.toFixed(8), "  (期望: 0.25, 精确)");

// ---- 辛普森 vs 梯形 对比 ----
console.log("\n===== 辛普森 vs 梯形 法则对比 =====");

// 对比 1: ∫[0,1] x² dx = 1/3, 不同 n 下误差对比
console.log("\n∫[0,1] x² dx (精确值 = 1/3 ≈ 0.33333333):");
console.log(
  "  " +
    ["n", "simpson", "simpson误差", "trap", "trap误差"]
      .map((s) => s.padStart(14))
      .join(""),
);
const exactX2 = 1 / 3;
for (const n of [2, 10, 100, 1000]) {
  const s = simpson((x) => x * x, 0, 1, n);
  const t = trapezoidal((x) => x * x, 0, 1, n);
  console.log(
    "  " +
      String(n).padStart(14) +
      s.toFixed(10).padStart(14) +
      Math.abs(s - exactX2)
        .toExponential(2)
        .padStart(14) +
      t.toFixed(10).padStart(14) +
      Math.abs(t - exactX2)
        .toExponential(2)
        .padStart(14),
  );
}
console.log("  (辛普森对二次函数精确, 误差≈0; 梯形误差 O(h²))");

// 对比 2: ∫[0,π] sin(x) dx = 2
console.log("\n∫[0,π] sin(x) dx (精确值 = 2):");
console.log(
  "  " +
    ["n", "simpson误差", "trap误差", "精度比(trap/simp)"]
      .map((s) => s.padStart(16))
      .join(""),
);
for (const n of [2, 10, 100, 1000]) {
  const s = simpson(Math.sin, 0, Math.PI, n);
  const t = trapezoidal(Math.sin, 0, Math.PI, n);
  const es = Math.abs(s - 2);
  const et = Math.abs(t - 2);
  console.log(
    "  " +
      String(n).padStart(16) +
      es.toExponential(3).padStart(16) +
      et.toExponential(3).padStart(16) +
      (es > 0 ? (et / es).toFixed(0) : "∞").padStart(16),
  );
}
console.log("  (辛普森误差 O(h⁴) 远小于梯形 O(h²))");

// 对比 3: ∫[0,1] e^x dx = e - 1
console.log("\n∫[0,1] e^x dx (精确值 = e-1 ≈ 1.71828183):");
const exactExp = Math.E - 1;
const sExp = simpson(Math.exp, 0, 1, 100);
const tExp = trapezoidal(Math.exp, 0, 1, 100);
console.log(
  `  n=100  simpson 误差 = ${Math.abs(sExp - exactExp).toExponential(3)}`,
);
console.log(
  `  n=100  trap     误差 = ${Math.abs(tExp - exactExp).toExponential(3)}`,
);
console.log(
  `  辛普森更精确: ${Math.abs(sExp - exactExp) < Math.abs(tExp - exactExp)} (期望 true)`,
);
