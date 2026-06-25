/**
 * 手写斐波那契数列（动态规划）
 *
 * 动态规划通过自底向上迭代避免递归的重复计算。
 *   1. 标准数组 DP：dp[i] = dp[i-1] + dp[i-2]，时间 O(n)，空间 O(n)。
 *   2. 空间优化：只需前两个值，空间 O(1)。
 *   3. 矩阵快速幂：时间 O(log n)（进阶，此处提供 O(1) 空间版）。
 */

// 自底向上 DP（数组）
function fibonacciDP(n) {
  if (n < 0) throw new Error("n must be non-negative");
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// 空间优化版（只用两个变量）
function fibonacciOptimized(n) {
  if (n < 0) throw new Error("n must be non-negative");
  if (n <= 1) return n;
  let prev2 = 0; // F(0)
  let prev1 = 1; // F(1)
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 生成完整序列
function fibonacciSequenceDP(n) {
  if (n <= 0) return [];
  const dp = [0];
  if (n >= 2) dp.push(1);
  for (let i = 2; i < n; i++) {
    dp.push(dp[i - 1] + dp[i - 2]);
  }
  return dp;
}

// 测试
console.log(fibonacciDP(0)); // 0
console.log(fibonacciDP(1)); // 1
console.log(fibonacciDP(10)); // 55
console.log(fibonacciDP(20)); // 6765
console.log(fibonacciDP(50)); // 12586269025

console.log(fibonacciOptimized(0)); // 0
console.log(fibonacciOptimized(10)); // 55
console.log(fibonacciOptimized(50)); // 12586269025
console.log(fibonacciOptimized(100)); // 354224848179261915075

console.log(fibonacciSequenceDP(10)); // [0,1,1,2,3,5,8,13,21,34]
console.log(fibonacciSequenceDP(1)); // [0]
console.log(fibonacciSequenceDP(0)); // []
