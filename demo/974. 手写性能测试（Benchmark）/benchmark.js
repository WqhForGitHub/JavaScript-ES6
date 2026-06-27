/**
 * 手写性能测试（Benchmark）
 *
 * 实现一个基准测试类，对函数进行多次迭代执行，
 * 测量执行时间并计算统计指标：
 * - 平均值 (mean)
 * - 中位数 (median)
 * - 标准差 (stddev)
 * - 每秒操作数 (ops/sec)
 * - 最小 / 最大值
 *
 * 支持 warmup（预热）以消除 JIT 优化带来的首次执行偏差，
 * 并支持比较两个实现的性能差异。
 *
 * 使用 performance.now() 进行高精度计时（Node 与浏览器均可用）。
 */

/**
 * 获取高精度计时函数
 * @returns {() => number} 返回当前时间戳（毫秒，浮点）
 */
function getNow() {
  // 浏览器 / Node 16+ 全局 performance
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return () => performance.now();
  }
  // Node 老版本回退
  try {
    const { performance: perf } = require("perf_hooks");
    return () => perf.now();
  } catch (e) {
    return () => Date.now();
  }
}

class Benchmark {
  constructor() {
    /** @type {Map<string, object>} 测试名 -> 结果 */
    this.results = new Map();
  }

  /**
   * 预热：先运行若干次让 V8 JIT 优化稳定
   * @param {Function} fn - 被测函数
   * @param {number} iterations - 预热次数
   */
  warmup(fn, iterations = 1000) {
    for (let i = 0; i < iterations; i++) {
      fn();
    }
  }

  /**
   * 执行基准测试
   * @param {string} name - 测试名称
   * @param {Function} fn - 被测函数
   * @param {number} iterations - 迭代次数
   * @returns {object} 测试结果
   */
  bench(name, fn, iterations = 10000) {
    // 预热
    this.warmup(fn, Math.min(Math.floor(iterations / 10), 1000));

    const now = getNow();
    const samples = [];

    // 逐次测量（单次精度高，但循环开销大；适合快速演示）
    for (let i = 0; i < iterations; i++) {
      const start = now();
      fn();
      const end = now();
      samples.push(end - start);
    }

    const result = this.computeStats(samples, iterations);
    result.name = name;
    this.results.set(name, result);
    return result;
  }

  /**
   * 批量计时法：一次测量整批迭代的总耗时
   * 适合单次执行极快的函数（减少计时器调用开销）
   * @param {string} name - 测试名称
   * @param {Function} fn - 被测函数
   * @param {number} iterations - 迭代次数
   * @returns {object} 测试结果
   */
  benchBatch(name, fn, iterations = 100000) {
    this.warmup(fn, 1000);

    const now = getNow();
    const samples = [];
    const batchSize = 1000; // 每批 1000 次
    const batches = Math.floor(iterations / batchSize);

    for (let b = 0; b < batches; b++) {
      const start = now();
      for (let i = 0; i < batchSize; i++) {
        fn();
      }
      const end = now();
      // 记录单次平均耗时
      samples.push((end - start) / batchSize);
    }

    const result = this.computeStats(samples, batches * batchSize);
    result.name = name;
    this.results.set(name, result);
    return result;
  }

  /**
   * 计算统计指标
   * @param {number[]} samples - 每次耗时样本（毫秒）
   * @param {number} iterations - 总迭代次数
   * @returns {object}
   */
  computeStats(samples, iterations) {
    const n = samples.length;
    const totalMs = samples.reduce((a, b) => a + b, 0);
    const mean = totalMs / n;

    // 中位数
    const sorted = [...samples].sort((a, b) => a - b);
    const median =
      n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

    // 标准差
    const variance =
      samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);

    // 每秒操作数
    const opsPerSec = mean > 0 ? Math.round(1000 / mean) : Infinity;

    return {
      iterations,
      samples: n,
      totalTimeMs: totalMs,
      meanMs: mean,
      medianMs: median,
      stddevMs: stddev,
      opsPerSec,
      minMs: sorted[0],
      maxMs: sorted[n - 1],
    };
  }

  /**
   * 比较两个实现
   * @param {string} nameA - 实现A名称
   * @param {Function} fnA - 实现A
   * @param {string} nameB - 实现B名称
   * @param {Function} fnB - 实现B
   * @param {number} iterations - 迭代次数
   * @returns {object} 比较结果
   */
  compare(nameA, fnA, nameB, fnB, iterations = 10000) {
    const resultA = this.bench(nameA, fnA, iterations);
    const resultB = this.bench(nameB, fnB, iterations);

    const faster = resultA.meanMs < resultB.meanMs ? nameA : nameB;
    const slower = resultA.meanMs < resultB.meanMs ? nameB : nameA;
    const fasterMean = Math.min(resultA.meanMs, resultB.meanMs);
    const slowerMean = Math.max(resultA.meanMs, resultB.meanMs);
    const speedup = slowerMean / fasterMean;

    return {
      [nameA]: resultA,
      [nameB]: resultB,
      faster,
      slower,
      speedup: parseFloat(speedup.toFixed(3)),
    };
  }

  /**
   * 打印单个测试结果
   */
  printResult(name) {
    const r = this.results.get(name);
    if (!r) {
      console.log(`未找到测试: ${name}`);
      return;
    }
    this._printOne(r);
  }

  _printOne(r) {
    console.log(`\n=== ${r.name} ===`);
    console.log(`迭代次数:   ${r.iterations.toLocaleString()}`);
    console.log(`总耗时:     ${r.totalTimeMs.toFixed(3)} ms`);
    console.log(`平均:       ${r.meanMs.toFixed(6)} ms`);
    console.log(`中位数:     ${r.medianMs.toFixed(6)} ms`);
    console.log(`标准差:     ${r.stddevMs.toFixed(6)} ms`);
    console.log(`最小:       ${r.minMs.toFixed(6)} ms`);
    console.log(`最大:       ${r.maxMs.toFixed(6)} ms`);
    console.log(`每秒操作数: ${r.opsPerSec.toLocaleString()} ops/sec`);
  }

  /**
   * 打印比较结果
   */
  printCompare(nameA, nameB) {
    const rA = this.results.get(nameA);
    const rB = this.results.get(nameB);
    if (!rA || !rB) return;
    this._printOne(rA);
    this._printOne(rB);
    const faster = rA.meanMs < rB.meanMs ? nameA : nameB;
    const speedup =
      Math.max(rA.meanMs, rB.meanMs) / Math.min(rA.meanMs, rB.meanMs);
    console.log(`\n>>> ${faster} 更快，快 ${speedup.toFixed(3)} 倍`);
  }
}

// ===================== 测试用例 =====================

console.log("========== 性能测试（Benchmark）测试 ==========\n");

const bench = new Benchmark();

// --- 测试 1：数组 push vs concat ---
console.log("--- 比较：数组 push vs concat ---");
const result = bench.compare(
  "push",
  () => {
    const arr = [];
    arr.push(1);
    arr.push(2);
    arr.push(3);
  },
  "concat",
  () => {
    let arr = [];
    arr = arr.concat(1);
    arr = arr.concat(2);
    arr = arr.concat(3);
  },
  50000,
);

console.log(
  `push   平均耗时: ${result.push.meanMs.toFixed(6)} ms, ${result.push.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
  `concat 平均耗时: ${result.concat.meanMs.toFixed(6)} ms, ${result.concat.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(`更快的是: ${result.faster}, 加速比: ${result.speedup}x`);
bench.printCompare("push", "concat");

// --- 测试 2：批量计时法 ---
console.log("\n--- 批量计时法：Math.sqrt vs ** 0.5 ---");
bench.benchBatch("Math.sqrt", () => Math.sqrt(123456789), 500000);
bench.benchBatch("**0.5", () => 123456789 ** 0.5, 500000);
bench.printCompare("Math.sqrt", "**0.5");

// --- 测试 3：字符串拼接 vs join ---
console.log("\n--- 比较：+= 拼接 vs join ---");
bench.compare(
  "plus-equal",
  () => {
    let s = "";
    for (let i = 0; i < 10; i++) s += i;
  },
  "join",
  () => {
    const parts = [];
    for (let i = 0; i < 10; i++) parts.push(i);
    parts.join("");
  },
  30000,
);
bench.printCompare("plus-equal", "join");
