/**
 * 手写最长公共子序列（LCS）
 *
 * 最长公共子序列：在两个序列中找到一个最长的、在两个序列中均出现的子序列（不要求连续）。
 * 动态规划：dp[i][j] 表示 text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。
 *   若 text1[i-1] === text2[j-1]：dp[i][j] = dp[i-1][j-1] + 1
 *   否则：dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 * 时间 O(m*n)，空间 O(m*n)，可优化为 O(min(m,n))。
 * 本实现同时回溯出一条 LCS 字符串。
 */

function lengthOfLCS(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 返回一条具体的 LCS 字符串（通过回溯 dp 表）
function getLCS(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  // 回溯
  let i = m;
  let j = n;
  const lcs = [];
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      lcs.unshift(text1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return lcs.join('');
}

// 空间优化版（滚动数组），仅求长度
function lengthOfLCSOptimized(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  // 确保 text2 较短以节省空间
  if (m < n) return lengthOfLCSOptimized(text2, text1);
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// 测试
console.log(lengthOfLCS('abcde', 'ace')); // 3
console.log(lengthOfLCS('abc', 'abc')); // 3
console.log(lengthOfLCS('abc', 'def')); // 0
console.log(lengthOfLCS('AGGTAB', 'GXTXAYB')); // 4 (GTAB)

console.log(getLCS('abcde', 'ace')); // ace
console.log(getLCS('AGGTAB', 'GXTXAYB')); // GTAB

console.log(lengthOfLCSOptimized('abcde', 'ace')); // 3
console.log(lengthOfLCSOptimized('AGGTAB', 'GXTXAYB')); // 4
