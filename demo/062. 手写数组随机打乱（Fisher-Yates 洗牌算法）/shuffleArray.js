/**
 * 手写数组随机打乱（Fisher-Yates 洗牌算法）
 *
 * 核心需求：将数组元素随机打乱，要求每个排列出现的概率相等（均匀分布）
 *
 * Fisher-Yates 算法（又称 Knuth 洗牌）：
 *   从后往前遍历，在 [0, i] 范围内随机选一个下标 j，
 *   交换 arr[i] 和 arr[j]。
 *   时间复杂度 O(n)，空间复杂度 O(1)（原地打乱）。
 *
 * 以下提供：
 *   1. 标准 Fisher-Yates（原地）
 *   2. Fisher-Yates（返回新数组，不修改原数组）
 *   3. 错误示范：sort + Math.random（分布不均匀）
 */

// ===== 方法 1：标准 Fisher-Yates（原地打乱）=====

function shuffle1(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    // 在 [0, i] 范围内随机选一个下标 j
    const j = Math.floor(Math.random() * (i + 1));
    // 交换 arr[i] 和 arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 优点：均匀分布，性能 O(n)，原地操作省空间
// 缺点：会修改原数组

// ===== 方法 2：返回新数组（不修改原数组）=====

function shuffle2(arr) {
  const result = [...arr]; // 拷贝一份，避免修改原数组
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 优点：不污染原数组，纯函数
// 缺点：需要 O(n) 额外空间

// ===== 方法 3（错误示范）：sort + Math.random =====

function shuffleWrong(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 严重缺点：
//   1. 分布不均匀！某些排列出现的概率远高于其他
//   2. 不同浏览器的 sort 实现不同，结果不可预测
//   3. V8 引擎早期使用快排，分布偏差更严重
//   4. 面试中写出这个会被扣分

// ===== 测试 =====

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log("========== Fisher-Yates 洗牌算法 ==========\n");
console.log("原始数组:", arr);

console.log("\n--- 方法 1：原地打乱 ---");
const copy1 = [...arr];
console.log("打乱后:", shuffle1(copy1)); // 每次运行结果不同

console.log("\n--- 方法 2：返回新数组 ---");
console.log("原数组(不变):", arr);
console.log("打乱后:", shuffle2(arr)); // 每次运行结果不同

console.log("\n--- 方法 3（错误示范）：sort + random ---");
console.log("打乱后:", shuffleWrong(arr)); // 分布不均匀

// --- 均匀性验证：统计每个位置出现某值的次数 ---
console.log("\n========== 均匀性验证 ==========");
function testUniformity(shuffleFn, size = 4, trials = 100000) {
  // 统计每个元素在每个位置出现的次数
  const counts = Array.from({ length: size }, () => Array(size).fill(0));
  const base = Array.from({ length: size }, (_, i) => i);

  for (let t = 0; t < trials; t++) {
    const shuffled = shuffleFn([...base]);
    for (let pos = 0; pos < size; pos++) {
      counts[shuffled[pos]][pos]++;
    }
  }

  // 均匀分布下，每个格子应该约为 trials / size
  const expected = trials / size;
  console.log(
    `期望每个格子约 ${expected} 次（${trials} 次试验，${size} 个元素）`,
  );
  console.log("Fisher-Yates 分布（值 -> 各位置计数）：");
  counts.forEach((row, value) => {
    console.log(`  值 ${value}: ${row.join(", ")}`);
  });
}

// 测试 Fisher-Yates 的均匀性（应接近 25000）
testUniformity(shuffle2, 4, 100000);

console.log("\nsort + random 分布（明显不均匀）：");
testUniformity(shuffleWrong, 4, 100000);

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", shuffle2([])); // []
console.log("单元素:", shuffle2([42])); // [42]
console.log("两元素:", shuffle2([1, 2])); // [1,2] 或 [2,1]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐：Fisher-Yates 算法（方法 1 或 2）");
console.log("优点：均匀分布、O(n) 时间、O(1) 空间（原地版本）");
console.log("坑点：sort(() => Math.random() - 0.5) 分布不均匀，面试别写");
console.log("注意：不修改原数组时记得先拷贝");
