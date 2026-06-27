/**
 * 手写属性测试 (Property-Based Testing)
 * =====================================
 *
 * 概念说明:
 * 属性测试 (Property-Based Testing, 如 Haskell QuickCheck / JS fast-check)
 * 不枚举固定输入, 而是声明被测代码应满足的 "性质 (property)", 由框架随机生成
 * 大量输入并验证. 当性质失败时, 框架通过 "收缩 (shrinking)" 找到最小失败用例.
 *
 * 核心要素:
 * 1. Arbitrary (任意值生成器): 知道如何生成随机值, 也知道如何缩小 (shrink)
 *    - integer(min, max): 生成范围内整数, shrink 时朝 0 收缩
 *    - string(): 生成随机字符串, shrink 时减少字符
 *    - array(arb): 生成元素数组, shrink 时缩短数组 / 收缩元素
 * 2. forAll(propertyFn, arbitraries, options):
 *    - 随机生成 N 组输入, 调用 propertyFn
 *    - 一旦失败, 对失败输入反复 shrink, 寻找更小的失败输入
 *    - 返回通过 / 失败及最小反例
 *
 * 收缩 (Shrinking) 原理:
 * 失败时并不直接报告随机输入, 而是尝试更 "小" 的输入 (更接近边界 / 更短),
 * 若仍失败则继续收缩, 直到无法再缩小. 最终给出最小可复现用例.
 */

"use strict";

/**
 * 简易可种子化随机数生成器 (mulberry32)
 * 便于复现失败用例
 */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------
// Arbitrary 生成器
// 每个生成器提供:
//   generate(rng) -> 值
//   shrink(value) -> 候选更小值数组 (迭代器风格)
// ------------------------------------------------------------

/**
 * 整数生成器
 * shrink 策略: 优先尝试 0 / 边界 / 二分朝 0 收缩
 */
function integer(min = -1000, max = 1000) {
  return {
    name: `integer(${min},${max})`,
    generate(rng) {
      const range = max - min + 1;
      return min + Math.floor(rng() * range);
    },
    shrink(value) {
      if (value === 0) return [];
      const candidates = new Set();
      candidates.add(0);
      candidates.add(min);
      candidates.add(max);
      // 朝 0 二分收缩
      candidates.add(value > 0 ? Math.floor(value / 2) : Math.ceil(value / 2));
      candidates.add(value > 0 ? value - 1 : value + 1);
      return [...candidates].filter((c) => c !== value && c >= min && c <= max);
    },
  };
}

/**
 * 字符串生成器 (基于可打印 ASCII)
 * shrink 策略: 移除字符 / 截短 / 收缩为空串
 */
function string(maxLength = 20) {
  const minChar = 32;
  const charRange = 95; // 32..126
  return {
    name: `string(${maxLength})`,
    generate(rng) {
      const len = Math.floor(rng() * (maxLength + 1));
      let s = "";
      for (let i = 0; i < len; i++) {
        s += String.fromCharCode(minChar + Math.floor(rng() * charRange));
      }
      return s;
    },
    shrink(value) {
      if (value.length === 0) return [];
      const candidates = new Set();
      candidates.add("");
      // 移除首/尾字符
      candidates.add(value.slice(1));
      candidates.add(value.slice(0, -1));
      // 折半
      candidates.add(value.slice(0, Math.floor(value.length / 2)));
      return [...candidates].filter((c) => c !== value);
    },
  };
}

/**
 * 数组生成器 (基于元素 arbitrary)
 * shrink 策略: 缩短数组 + 收缩每个元素
 */
function array(arb, maxLength = 10) {
  return {
    name: `array(${arb.name},${maxLength})`,
    generate(rng) {
      const len = Math.floor(rng() * (maxLength + 1));
      const out = [];
      for (let i = 0; i < len; i++) out.push(arb.generate(rng));
      return out;
    },
    shrink(value) {
      if (value.length === 0) return [];
      const candidates = [];
      // 空数组
      candidates.push([]);
      // 移除首/尾元素
      candidates.push(value.slice(1));
      candidates.push(value.slice(0, -1));
      // 折半
      candidates.push(value.slice(0, Math.floor(value.length / 2)));
      // 收缩每个元素 (取第一个元素 shrink 后替换)
      for (const smaller of arb.shrink(value[0])) {
        candidates.push([smaller, ...value.slice(1)]);
      }
      // 去重
      const seen = new Set();
      return candidates.filter((c) => {
        const key = JSON.stringify(c);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
  };
}

// ------------------------------------------------------------
// 收缩算法
// ------------------------------------------------------------

/**
 * 对一个失败用例反复收缩, 寻找最小失败输入
 * @param {Function} propertyFn
 * @param {Array} arbitraries
 * @param {Array} failingArgs
 * @returns {Array} 最小失败输入
 */
function shrinkFailure(propertyFn, arbitraries, failingArgs) {
  let best = failingArgs;
  let improved = true;
  while (improved) {
    improved = false;
    // 对每个参数尝试收缩
    for (let i = 0; i < arbitraries.length; i++) {
      const arb = arbitraries[i];
      for (const smaller of arb.shrink(best[i])) {
        const candidate = best.slice();
        candidate[i] = smaller;
        try {
          if (!propertyFn(...candidate)) {
            // 仍然失败, 接受这个更小的用例
            best = candidate;
            improved = true;
            break; // 重新开始收缩
          }
        } catch (e) {
          // 抛异常也视为失败
          best = candidate;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }
  return best;
}

// ------------------------------------------------------------
// forAll 主函数
// ------------------------------------------------------------

/**
 * 运行属性测试
 * @param {Function} propertyFn - 性质函数, 返回 boolean (true 表示通过)
 * @param {Array} arbitraries - 参数生成器列表
 * @param {object} [options]
 * @param {number} [options.numRuns=100] - 运行次数
 * @param {number} [options.seed] - 随机种子 (便于复现)
 * @returns {{passed: boolean, runs: number, counterexample?: Array, seed: number}}
 */
function forAll(propertyFn, arbitraries, options = {}) {
  const numRuns = options.numRuns || 100;
  const seed =
    options.seed != null ? options.seed : Math.floor(Math.random() * 1e9);
  const rng = makeRng(seed);

  for (let run = 0; run < numRuns; run++) {
    const args = arbitraries.map((arb) => arb.generate(rng));
    let passed;
    try {
      passed = propertyFn(...args);
    } catch (e) {
      passed = false;
    }
    if (!passed) {
      // 失败: 尝试收缩
      const counterexample = shrinkFailure(propertyFn, arbitraries, args);
      return { passed: false, runs: run + 1, counterexample, seed };
    }
  }
  return { passed: true, runs: numRuns, seed };
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 属性测试演示 ==========\n");

// ---- 辅助: 数组排序函数 (作为被测对象) ----
function sortArray(arr) {
  return [...arr].sort((a, b) => a - b);
}

// ---- 性质 1: 排序是幂等的 (sort(sort(x)) === sort(x)) ----
console.log("--- 性质 1: 排序是幂等的 ---");
const prop1 = forAll(
  (xs) => {
    const once = sortArray(xs);
    const twice = sortArray(once);
    return JSON.stringify(once) === JSON.stringify(twice);
  },
  [array(integer(-50, 50), 8)],
  { numRuns: 200, seed: 12345 },
);
console.log("结果:", prop1.passed ? "PASS" : "FAIL");
console.log("运行次数:", prop1.runs, "种子:", prop1.seed);
if (!prop1.passed) {
  console.log("反例 (已收缩):", prop1.counterexample);
}

// ---- 性质 2: reverse 两次等于原数组 ----
console.log("\n--- 性质 2: reverse 两次等于原数组 ---");
const prop2 = forAll(
  (xs) => {
    const reversed = [...xs].reverse();
    const reversedTwice = [...reversed].reverse();
    return JSON.stringify(xs) === JSON.stringify(reversedTwice);
  },
  [array(integer(0, 100), 10)],
  { numRuns: 200, seed: 67890 },
);
console.log("结果:", prop2.passed ? "PASS" : "FAIL");
console.log("运行次数:", prop2.runs, "种子:", prop2.seed);

// ---- 性质 3: 排序后数组长度不变 ----
console.log("\n--- 性质 3: 排序后数组长度不变 ---");
const prop3 = forAll(
  (xs) => sortArray(xs).length === xs.length,
  [array(integer(0, 99), 12)],
  { numRuns: 200, seed: 11111 },
);
console.log("结果:", prop3.passed ? "PASS" : "FAIL");

// ---- 性质 4: 故意写错性质, 展示收缩 (排序后应非降, 这里断言严格升序会失败) ----
console.log("\n--- 性质 4: 故意错误的性质 (展示收缩) ---");
console.log("断言: 排序后数组严格升序 (含重复元素时必失败) ---");
const prop4 = forAll(
  (xs) => {
    if (xs.length === 0) return true;
    const sorted = sortArray(xs);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] <= sorted[i - 1]) return false; // 故意用 <= 制造失败
    }
    return true;
  },
  [array(integer(0, 3), 10)], // 小范围增加出现重复的概率
  { numRuns: 500, seed: 42 },
);
console.log("结果:", prop4.passed ? "PASS" : "FAIL");
console.log("运行次数:", prop4.runs, "种子:", prop4.seed);
if (!prop4.passed) {
  console.log("反例 (收缩后的最小失败输入):", prop4.counterexample);
  console.log("说明: 收缩算法把数组缩小到最小仍能失败的形态");
}

// ---- 性质 5: 字符串拼接长度等于长度之和 ----
console.log("\n--- 性质 5: 字符串拼接长度 = 各自长度之和 ---");
const prop5 = forAll(
  (a, b) => (a + b).length === a.length + b.length,
  [string(15), string(15)],
  { numRuns: 200, seed: 99999 },
);
console.log("结果:", prop5.passed ? "PASS" : "FAIL");
console.log("运行次数:", prop5.runs, "种子:", prop5.seed);

// ---- 性质 6: 加法交换律 ----
console.log("\n--- 性质 6: 整数加法交换律 (a + b === b + a) ---");
const prop6 = forAll(
  (a, b) => a + b === b + a,
  [integer(-1000, 1000), integer(-1000, 1000)],
  { numRuns: 300, seed: 2024 },
);
console.log("结果:", prop6.passed ? "PASS" : "FAIL");

// ---- 性质 7: 故意失败的整数性质 (展示整数收缩) ----
console.log(
  "\n--- 性质 7: 故意失败 (a * 2 应等于 a + a, 但对浮点会失败, 这里整数应通过) ---",
);
console.log("改: 断言 a 大于 10 (会失败) ---");
const prop7 = forAll(
  (a) => a > 10, // 显然不成立
  [integer(-100, 100)],
  { numRuns: 200, seed: 7 },
);
console.log("结果:", prop7.passed ? "PASS" : "FAIL");
console.log("运行次数:", prop7.runs, "种子:", prop7.seed);
if (!prop7.passed) {
  console.log("反例 (收缩后):", prop7.counterexample);
  console.log("说明: 收缩把值降到 0 附近仍能失败");
}

console.log("\n[属性测试演示完成]");
