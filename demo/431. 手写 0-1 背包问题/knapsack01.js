/**
 * 手写 0-1 背包问题
 *
 * 0-1 背包：有 n 个物品，每个物品有重量 weight[i] 和价值 value[i]，
 * 背包容量为 W，每个物品最多选一次，求能装入的最大价值。
 * 动态规划：dp[i][j] 表示前 i 个物品、容量 j 时的最大价值。
 *   不选物品 i：dp[i][j] = dp[i-1][j]
 *   选物品 i（若 weight[i-1] <= j）：dp[i][j] = dp[i-1][j-weight[i-1]] + value[i-1]
 *   取两者较大值。时间 O(n*W)，空间可优化为 O(W)。
 */

// 二维 DP
function knapsack01(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = dp[i - 1][j]; // 不选第 i 个物品
      if (weights[i - 1] <= j) {
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][capacity];
}

// 空间优化为一维（逆序遍历容量，保证每个物品只用一次）
function knapsack01Optimized(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < n; i++) {
    // 必须逆序，避免同一物品被重复使用
    for (let j = capacity; j >= weights[i]; j--) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

// 返回选中的物品索引
function knapsack01WithItems(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = dp[i - 1][j];
      if (weights[i - 1] <= j) {
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  // 回溯找选中的物品
  const items = [];
  let j = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      items.unshift(i - 1); // 选中第 i-1 个物品
      j -= weights[i - 1];
    }
  }
  return { maxValue: dp[n][capacity], items };
}

// 测试
console.log(knapsack01([2, 3, 4, 5], [3, 4, 5, 6], 5)); // 7 (选 2+3 或 5? 2+3=5重量价值7)
console.log(knapsack01([1, 2, 3], [6, 10, 12], 5)); // 22 (选 2+3: 10+12)
console.log(knapsack01([1, 2, 3, 4], [1, 2, 5, 6], 4)); // 7 (选 1+3: 1+5=6? 选 4:6; 选 1+2+3=6重量... 1+5=6, 2+5=7重量5超; 选2+4=6重量6超; 选4=6)

console.log(knapsack01Optimized([2, 3, 4, 5], [3, 4, 5, 6], 5)); // 7
console.log(knapsack01Optimized([1, 2, 3], [6, 10, 12], 5)); // 22

console.log(knapsack01WithItems([2, 3, 4, 5], [3, 4, 5, 6], 5));
// { maxValue: 7, items: [0, 1] }  (重量2+3=5, 价值3+4=7)
