/**
 * 洗牌算法正确性验证 (Fisher-Yates Shuffle)
 *
 * Fisher-Yates (Knuth) 洗牌算法能以等概率生成所有 n! 种排列，
 * 时间复杂度 O(n)，是真正的均匀洗牌算法。
 *
 * 算法:
 *   for i = n-1 down to 1:
 *       j = random int in [0, i]
 *       swap(arr[i], arr[j])
 *
 * 正确性验证: 对小数组大量重复实验，
 * 统计每种排列出现频率，应接近 1/n!。
 */

/**
 * Fisher-Yates 原地洗牌
 * @param {any[]} arr - 待洗牌数组 (会被修改)
 * @returns {any[]} 洗牌后的数组 (同一引用)
 */
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // j ∈ [0, i]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 非破坏性洗牌 (返回新数组)
 */
function shuffle(arr) {
  return fisherYatesShuffle(arr.slice());
}

/**
 * 统计排列频率分布
 * @param {any[]} items - 待洗牌元素
 * @param {number} trials - 试验次数
 * @returns {Map<string, number>} 排列字符串 -> 出现次数
 */
function verifyUniformity(items, trials) {
  const freq = new Map();
  for (let i = 0; i < trials; i++) {
    const result = shuffle(items);
    const key = result.join(",");
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  return freq;
}

// ---- 测试 ----

// 正确性: 洗牌后元素集合应不变
const base = [1, 2, 3, 4, 5];
const shuffledOnce = shuffle(base);
console.log("单次洗牌示例:", shuffledOnce);
console.log("原数组未变:", base);
console.log(
  "元素集合相同:",
  base.slice().sort().join(",") === shuffledOnce.slice().sort().join(","),
);
console.log("");

// 均匀性验证: 3 个元素 -> 3! = 6 种排列
const items = [1, 2, 3];
const trials = 600000;
const freq = verifyUniformity(items, trials);

const permutations = 6; // 3!
const expectedCount = trials / permutations;
const expectedPct = 100 / permutations;

console.log(
  `Fisher-Yates 洗牌均匀性验证 (${trials} 次试验, ${permutations} 种排列)`,
);
console.log(
  `期望每种排列出现约 ${expectedCount.toFixed(0)} 次 (${expectedPct.toFixed(2)}%)\n`,
);

const sortedKeys = [...freq.keys()].sort();
for (const key of sortedKeys) {
  const count = freq.get(key);
  const pct = (count / trials) * 100;
  const dev = pct - expectedPct;
  console.log(
    `  [${key}] : ${String(count).padStart(6)} 次  (${pct.toFixed(2)}%)  偏差 ${dev >= 0 ? "+" : ""}${dev.toFixed(3)}%`,
  );
}

// 卡方统计量 (自由度 = n!-1 = 5)
let chi2 = 0;
for (const count of freq.values()) {
  chi2 += (count - expectedCount) ** 2 / expectedCount;
}
console.log(
  `\n卡方统计量 χ² = ${chi2.toFixed(3)}  (自由度 5, 临界值 ≈ 11.07 @ α=0.05)`,
);
console.log(
  chi2 < 11.07 ? "通过: 分布均匀，无法拒绝均匀性假设" : "注意: χ² 偏大",
);
