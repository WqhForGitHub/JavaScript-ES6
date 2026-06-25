/**
 * 手写编辑距离（Levenshtein Distance）
 *
 * 编辑距离：将字符串 word1 转换成 word2 所需的最少单字符编辑操作次数
 * （插入、删除、替换）。
 * 动态规划：dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最小操作数。
 *   - 若 word1[i-1] === word2[j-1]：dp[i][j] = dp[i-1][j-1]（无需操作）
 *   - 否则：dp[i][j] = 1 + min(
 *       dp[i-1][j],    // 删除 word1[i-1]
 *       dp[i][j-1],    // 插入（相当于在 word1 加一个字符）
 *       dp[i-1][j-1]   // 替换 word1[i-1] 为 word2[j-1]
 *     )
 * 边界：dp[i][0] = i（全删），dp[0][j] = j（全插）。
 * 时间 O(m*n)，空间 O(m*n)，可优化为 O(min(m,n))。
 */

function levenshteinDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  // 边界
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  // 填表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // 删除
            dp[i][j - 1], // 插入
            dp[i - 1][j - 1], // 替换
          );
      }
    }
  }
  return dp[m][n];
}

// 空间优化版（滚动数组）
function levenshteinDistanceOptimized(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  // 让 word2 为较短串
  if (m < n) return levenshteinDistanceOptimized(word2, word1);
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// 返回相似度（0~1，1 表示完全相同）
function similarity(word1, word2) {
  const dist = levenshteinDistance(word1, word2);
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen;
}

// 测试
console.log(levenshteinDistance("horse", "ros")); // 3
console.log(levenshteinDistance("intention", "execution")); // 5
console.log(levenshteinDistance("", "abc")); // 3
console.log(levenshteinDistance("abc", "abc")); // 0
console.log(levenshteinDistance("kitten", "sitting")); // 3

console.log(levenshteinDistanceOptimized("horse", "ros")); // 3
console.log(levenshteinDistanceOptimized("intention", "execution")); // 5

console.log(similarity("abc", "abc")); // 1
console.log(similarity("kitten", "sitting").toFixed(4)); // 0.5714
console.log(similarity("", "")); // 1
