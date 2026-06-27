/**
 * 正态分布随机数 (Normal Distribution via Box-Muller Transform)
 *
 * Box-Muller 变换利用两个独立的均匀随机数 U1, U2 ~ Uniform(0,1)
 * 生成两个独立的标准正态随机数:
 *   Z0 = sqrt(-2·ln(U1)) · cos(2π·U2)
 *   Z1 = sqrt(-2·ln(U1)) · sin(2π·U2)
 *
 * 要得到均值为 μ、标准差为 σ 的一般正态分布:
 *   X = μ + σ · Z
 *
 * 本文件还包含一个简易直方图: 生成大量样本后分箱统计频次,
 * 以 ASCII 字符条形图打印, 直观验证分布形状接近钟形曲线。
 */

"use strict";

/**
 * 生成一个标准正态分布 N(0,1) 随机数 (Box-Muller)
 * 每次调用消耗两个均匀随机数, 但只返回 Z0。
 * @returns {number} 标准正态随机数
 */
function standardNormal() {
  // 避免取到 0 导致 ln(0) = -∞
  let u1 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const u2 = Math.random();
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return radius * Math.cos(angle); // 返回 Z0 (Z1 = radius * sin(angle) 丢弃)
}

/**
 * 生成均值为 mean、标准差为 std 的正态随机数
 * @param {number} mean - 均值 μ
 * @param {number} std  - 标准差 σ (须为正数)
 * @returns {number} N(mean, std²) 随机数
 */
function normal(mean = 0, std = 1) {
  if (std <= 0) throw new Error("标准差 std 须为正数");
  return mean + std * standardNormal();
}

/**
 * 生成 n 个正态分布样本
 * @param {number} n    - 样本数
 * @param {number} mean - 均值
 * @param {number} std  - 标准差
 * @returns {number[]} 样本数组
 */
function normalSamples(n, mean = 0, std = 1) {
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = normal(mean, std);
  return out;
}

/**
 * 计算数组的均值与标准差 (样本统计量)
 * @param {number[]} arr
 * @returns {{mean: number, std: number}}
 */
function stats(arr) {
  const n = arr.length;
  let sum = 0;
  for (const v of arr) sum += v;
  const mean = sum / n;
  let sq = 0;
  for (const v of arr) sq += (v - mean) ** 2;
  const std = Math.sqrt(sq / n); // 总体标准差
  return { mean, std };
}

/**
 * 将样本分箱并打印 ASCII 直方图
 * @param {number[]} samples - 样本数组
 * @param {number} bins      - 箱数
 * @param {number} width     - 条形最大宽度 (字符数)
 */
function printHistogram(samples, bins = 20, width = 50) {
  const { mean, std } = stats(samples);
  const min = mean - 4 * std;
  const max = mean + 4 * std;
  const binWidth = (max - min) / bins;

  const counts = new Array(bins).fill(0);
  for (const v of samples) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  }

  const maxCount = Math.max(...counts);
  console.log(
    `直方图 (n=${samples.length}, μ≈${mean.toFixed(3)}, σ≈${std.toFixed(3)})`,
  );
  console.log(`区间 [${min.toFixed(2)}, ${max.toFixed(2)}], ${bins} 箱:\n`);

  for (let i = 0; i < bins; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const barLen = Math.round((counts[i] / maxCount) * width);
    const bar = "#".repeat(barLen);
    console.log(
      `[${lo.toFixed(2).padStart(6)}, ${hi.toFixed(2).padStart(6)}) ` +
        `${String(counts[i]).padStart(6)} ${bar}`,
    );
  }
}

// ---- 测试 ----

// 测试 1: 单次生成标准正态数
console.log("--- 单次生成标准正态数 N(0,1) ---");
for (let i = 0; i < 5; i++) {
  console.log(`  z${i} = ${standardNormal().toFixed(6)}`);
}

// 测试 2: 大样本统计量应接近 (μ=0, σ=1)
console.log("\n--- 大样本统计 (N(0,1), n=100000) ---");
const s1 = normalSamples(100000, 0, 1);
const st1 = stats(s1);
console.log(`  样本均值 ≈ ${st1.mean.toFixed(4)}  (期望 0)`);
console.log(`  样本标准差 ≈ ${st1.std.toFixed(4)}  (期望 1)`);
console.log(`  均值接近 0: ${Math.abs(st1.mean) < 0.05}`);
console.log(`  标准差接近 1: ${Math.abs(st1.std - 1) < 0.05}`);

// 测试 3: N(5, 2) 分布
console.log("\n--- 大样本统计 (N(5, 2), n=100000) ---");
const s2 = normalSamples(100000, 5, 2);
const st2 = stats(s2);
console.log(`  样本均值 ≈ ${st2.mean.toFixed(4)}  (期望 5)`);
console.log(`  样本标准差 ≈ ${st2.std.toFixed(4)}  (期望 2)`);
console.log(`  均值接近 5: ${Math.abs(st2.mean - 5) < 0.1}`);
console.log(`  标准差接近 2: ${Math.abs(st2.std - 2) < 0.1}`);

// 测试 4: ASCII 直方图 (应呈现钟形)
console.log("\n--- 标准正态分布直方图 (应呈钟形) ---");
printHistogram(normalSamples(100000, 0, 1), 24, 48);

// 测试 5: 错误处理
console.log("\n--- 错误处理 ---");
try {
  normal(0, -1);
} catch (e) {
  console.log("caught:", e.message, "(期望: 标准差须为正数)");
}
