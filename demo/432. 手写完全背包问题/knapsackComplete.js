/**
 * 手写完全背包问题
 *
 * 完全背包：与 0-1 背包类似，但每个物品可以选择无限次。
 * 动态规划：dp[j] 表示容量 j 时的最大价值。
 *   与 0-1 背包的区别：内层循环正向遍历容量，允许同一物品被多次选取。
 *   dp[j] = max(dp[j], dp[j - weight[i]] + value[i])，j 从 weight[i] 到 capacity。
 * 时间 O(n*W)，空间 O(W)。
 */

// 一维 DP（正序遍历容量）
function knapsackComplete(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < n; i++) {
    // 正序：允许同一物品多次选取
    for (let j = weights[i]; j <= capacity; j++) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

// 二维 DP（便于理解）
function knapsackComplete2D(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = dp[i - 1][j]; // 不选第 i 个物品
      if (weights[i - 1] <= j) {
        // 选第 i 个物品（注意这里是 dp[i][...] 而非 dp[i-1][...]，可重复选）
        dp[i][j] = Math.max(
          dp[i][j],
          dp[i][j - weights[i - 1]] + values[i - 1],
        );
      }
    }
  }
  return dp[n][capacity];
}

// 应用：完全背包求组合数（零钱兑换 II）
// dp[j] = 凑成金额 j 的组合数
function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let j = coin; j <= amount; j++) {
      dp[j] += dp[j - coin];
    }
  }
  return dp[amount];
}

// 测试
console.log(knapsackComplete([1, 3, 4], [15, 20, 30], 4)); // 30 (选一个4) 或 15+15=30 (两个1和一个... 4重量价值30; 1*4=60? value[0]=15,4个1=60)
console.log(knapsackComplete([2, 3, 4], [3, 4, 5], 5)); // 7 (重量3+2=5, 价值4+3=7)
console.log(knapsackComplete([1, 2, 3], [1, 2, 3], 10)); // 10 (全选1)

console.log(knapsackComplete2D([1, 3, 4], [15, 20, 30], 4)); // 60
console.log(knapsackComplete2D([2, 3, 4], [3, 4, 5], 5)); // 7

console.log(change(5, [1, 2, 5])); // 4 (5=5, 2+2+1, 2+1+1+1, 1+1+1+1+1)
console.log(change(3, [2])); // 0
console.log(change(10, [10])); // 1
