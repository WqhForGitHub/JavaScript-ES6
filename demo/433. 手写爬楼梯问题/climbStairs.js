/**
 * 手写爬楼梯问题
 *
 * 爬楼梯：每次可以爬 1 或 2 个台阶，问爬到第 n 阶有多少种不同方法。
 * 本质就是斐波那契数列：dp[i] = dp[i-1] + dp[i-2)，
 *   dp[1]=1, dp[2]=2。时间 O(n)，空间 O(1)。
 * 本实现同时给出：
 *   1. 基础版（1或2步）
 *   2. 进阶版（每次可走 steps 数组中的步数）
 *   3. 最小花费版（每阶有成本，求最小总成本）
 */

// 基础版：每次 1 或 2 步
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1; // dp[1]
  let prev1 = 2; // dp[2]
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 数组 DP 版（便于理解）
function climbStairsDP(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// 进阶版：每次可走 steps 中的任意步数（排列数，顺序不同算不同）
function climbStairsWithSteps(n, steps) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1; // 起点算 1 种
  for (let i = 1; i <= n; i++) {
    for (const step of steps) {
      if (i - step >= 0) {
        dp[i] += dp[i - step];
      }
    }
  }
  return dp[n];
}

// 最小花费爬楼梯：cost[i] 为从第 i 阶出发的花费，可从 0 或 1 阶开始
// 到达楼顶（n 阶）的最小花费
function minCostClimbingStairs(cost) {
  const n = cost.length;
  let prev2 = 0; // 到达第 0 阶花费
  let prev1 = 0; // 到达第 1 阶花费
  for (let i = 2; i <= n; i++) {
    const current = Math.min(
      prev1 + cost[i - 1], // 从第 i-1 阶跨 1 步
      prev2 + cost[i - 2], // 从第 i-2 阶跨 2 步
    );
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 测试
console.log(climbStairs(1)); // 1
console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8
console.log(climbStairs(10)); // 89

console.log(climbStairsDP(5)); // 8
console.log(climbStairsDP(10)); // 89

// 每次可走 1、2、3 步
console.log(climbStairsWithSteps(4, [1, 2])); // 5 (等于 climbStairs(4))
console.log(climbStairsWithSteps(4, [1, 2, 3])); // 7
console.log(climbStairsWithSteps(3, [1, 2, 3])); // 4

console.log(minCostClimbingStairs([10, 15, 20])); // 15 (从1阶出发跨2步到顶: 15)
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])); // 6
