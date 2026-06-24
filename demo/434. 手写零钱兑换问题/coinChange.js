/**
 * 手写零钱兑换问题
 *
 * 零钱兑换：给定不同面额的硬币 coins 和总金额 amount，
 * 求凑成总金额所需的最少硬币数。无法凑出返回 -1。每种硬币可无限使用（完全背包）。
 * 动态规划：dp[i] 表示金额 i 的最少硬币数。
 *   dp[0] = 0；dp[i] = min(dp[i - coin] + 1) for each coin <= i。
 * 时间 O(amount * n)，空间 O(amount)。
 */

// 求最少硬币数
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 返回具体的硬币组合（一种方案）
function coinChangeCombination(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  // last[i] 记录金额 i 最后使用的硬币面额
  const last = new Array(amount + 1).fill(-1);
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        last[i] = coin;
      }
    }
  }
  if (dp[amount] === Infinity) return { count: -1, combination: [] };
  // 回溯找硬币组合
  const combination = [];
  let remain = amount;
  while (remain > 0) {
    combination.push(last[remain]);
    remain -= last[remain];
  }
  return { count: dp[amount], combination };
}

// 零钱兑换 II：求凑成 amount 的组合数（顺序不同算同一种）
function coinChangeWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  // 外层遍历硬币，保证组合数（而非排列数）
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }
  return dp[amount];
}

// 测试
console.log(coinChange([1, 2, 5], 11)); // 3 (5+5+1)
console.log(coinChange([2], 3)); // -1
console.log(coinChange([1], 0)); // 0
console.log(coinChange([1, 2, 5], 100)); // 20
console.log(coinChange([186, 419, 83, 408], 6249)); // 20

console.log(coinChangeCombination([1, 2, 5], 11));
// { count: 3, combination: [1, 5, 5] }

console.log(coinChangeCombination([2], 3));
// { count: -1, combination: [] }

console.log(coinChangeWays([1, 2, 5], 5)); // 4 (5, 2+2+1, 2+1+1+1, 1+1+1+1+1)
console.log(coinChangeWays([2], 3)); // 0
console.log(coinChangeWays([10], 10)); // 1
