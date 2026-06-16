/**
 * 手写判断变量是否为素数（质数）
 *
 * 定义：大于 1 的自然数中，除了 1 和它本身外不再有其他因数的数
 *   - 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, ...
 *   - 0 和 1 不是素数
 *   - 2 是最小的素数，也是唯一的偶数素数
 *   - 负数不是素数
 *
 * 以下提供 3 种方法，从基础到优化
 */

// ===== 方法 1：基础法 —— 遍历 2 到 n-1 =====
// 最直观但效率最低

function isPrime1(n) {
  // 非整数、小于 2 的数都不是素数
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }

  // 从 2 遍历到 n-1，看是否有因数
  for (let i = 2; i < n; i++) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

// 时间复杂度：O(n)
// 优点：逻辑简单直观，容易理解
// 缺点：效率最低，对于大数需要遍历很多次

// ===== 方法 2：优化到 √n =====
// 核心数学原理：如果 n 有因数 d（d > 1 且 d < n），
// 那么 n = d × (n/d)，d 和 n/d 中必有一个 ≤ √n
// 所以只需检查 2 到 √n 即可

function isPrime2(n) {
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }

  // 2 是素数，直接返回
  if (n === 2) {
    return true;
  }

  // 排除所有偶数（大于 2 的偶数都不是素数）
  if (n % 2 === 0) {
    return false;
  }

  // 只需检查奇数因数，从 3 到 √n，步长 2
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

// 时间复杂度：O(√n)
// 优点：效率大幅提升，最常用的手写方案
// 缺点：还有进一步优化空间

// ===== 方法 3：6k±1 优化法 =====
// 数学原理：所有大于 3 的素数都可以表示为 6k±1 的形式
//   （因为 6k, 6k+2, 6k+4 是偶数，6k+3 是 3 的倍数）
// 所以只需检查 6k-1 和 6k+1 形式的因数即可

function isPrime3(n) {
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }

  // 2 和 3 是素数
  if (n <= 3) {
    return true;
  }

  // 排除 2 的倍数和 3 的倍数
  if (n % 2 === 0 || n % 3 === 0) {
    return false;
  }

  // 从 5 开始，检查 6k-1 和 6k+1
  // 即 5, 7, 11, 13, 17, 19, ...
  const sqrt = Math.sqrt(n);
  for (let i = 5; i <= sqrt; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

// 时间复杂度：O(√n)，但实际遍历次数约为方法 2 的 1/3
// 优点：最高效的通用手写方案，面试加分
// 缺点：原理稍复杂，需要数学推导理解

// ===== 测试 =====

// 素数表（100 以内）：2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
const primesUnder100 = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97,
];

const testCases = [
  // 不是素数
  { value: -1, expected: false, desc: "负数 -1" },
  { value: 0, expected: false, desc: "0" },
  { value: 1, expected: false, desc: "1" },
  { value: 4, expected: false, desc: "4（合数）" },
  { value: 9, expected: false, desc: "9（合数）" },
  { value: 100, expected: false, desc: "100（合数）" },
  { value: 1.5, expected: false, desc: "小数 1.5" },
  { value: NaN, expected: false, desc: "NaN" },
  { value: Infinity, expected: false, desc: "Infinity" },
  // 是素数
  { value: 2, expected: true, desc: "2（最小素数）" },
  { value: 3, expected: true, desc: "3" },
  { value: 7, expected: true, desc: "7" },
  { value: 97, expected: true, desc: "97（100 以内最大素数）" },
  { value: 7919, expected: true, desc: "7919（较大素数）" },
  { value: 104729, expected: true, desc: "104729（大素数）" },
  // 边界合数
  { value: 7917, expected: false, desc: "7917（= 3 × 2639）" },
  { value: 104728, expected: false, desc: "104728（偶数）" },
];

const methods = [
  { name: "基础法 O(n)", fn: isPrime1 },
  { name: "√n 优化 O(√n)", fn: isPrime2 },
  { name: "6k±1 优化 O(√n/3)", fn: isPrime3 },
];

console.log("========== 判断变量是否为素数 ==========\n");

methods.forEach(({ name, fn }) => {
  console.log(`--- 方法：${name} ---`);
  let allPassed = true;

  testCases.forEach(({ value, expected, desc }) => {
    const result = fn(value);
    const status = result === expected ? "✓" : "✗";
    if (result !== expected) allPassed = false;
    console.log(`  ${status} ${desc}: ${result} (期望 ${expected})`);
  });

  console.log(`  结果：${allPassed ? "全部通过" : "存在失败"}\n`);
});

// --- 性能对比 ---
console.log("--- 性能对比（判断 1 到 100000）---");

methods.forEach(({ name, fn }) => {
  const start = performance.now();
  let count = 0;
  for (let i = 1; i <= 100000; i++) {
    if (fn(i)) count++;
  }
  const elapsed = (performance.now() - start).toFixed(2);
  console.log(`  ${name}: ${elapsed}ms，共 ${count} 个素数`);
});

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：6k±1 优化 > √n 优化 > 基础法");
console.log("基础法 O(n)    : 最直观，适合理解概念，但效率最低");
console.log("√n 优化 O(√n)  : 最常用，面试必备，性能和可读性兼顾");
console.log("6k±1 优化      : 最高效，面试加分，需要理解数学原理");
