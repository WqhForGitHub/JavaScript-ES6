/**
 * 手写最长公共子串
 *
 * 最长公共子串：在两个字符串中找到一个最长的、连续且相同的子串。
 * 与 LCS（子序列）的区别在于子串必须连续。
 * 动态规划：dp[i][j] 表示以 str1[i-1] 和 str2[j-1] 结尾的最长公共子串长度。
 *   若 str1[i-1] === str2[j-1]：dp[i][j] = dp[i-1][j-1] + 1
 *   否则：dp[i][j] = 0
 * 记录最大值及其位置即可还原子串。时间 O(m*n)，空间 O(m*n)，可优化为 O(n)。
 */

// DP 版本，返回最长公共子串
function longestCommonSubstring(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let maxLen = 0;
  let endIndex = 0; // 记录 str1 中的结束位置
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) {
          maxLen = dp[i][j];
          endIndex = i; // str1 中第 i 个字符（1-based）结尾
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }
  if (maxLen === 0) return "";
  return str1.slice(endIndex - maxLen, endIndex);
}

// 仅返回长度
function longestCommonSubstringLength(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  // 空间优化：只用一维数组 + prev 变量
  let prev = new Array(n + 1).fill(0);
  let maxLen = 0;
  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
        if (curr[j] > maxLen) maxLen = curr[j];
      }
    }
    prev = curr;
  }
  return maxLen;
}

// 测试
console.log(longestCommonSubstring("abcdef", "zcdemf")); // cde
console.log(longestCommonSubstring("ABABC", "BABCA")); // BABC
console.log(longestCommonSubstring("hello", "world")); // l (或 'l')
console.log(longestCommonSubstring("abc", "def")); // ''
console.log(longestCommonSubstring("", "abc")); // ''

console.log(longestCommonSubstringLength("abcdef", "zcdemf")); // 3
console.log(longestCommonSubstringLength("ABABC", "BABCA")); // 4
console.log(longestCommonSubstringLength("GeeksforGeeks", "GeeksQuiz")); // 5
