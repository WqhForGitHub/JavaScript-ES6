/**
 * 手写最长递增子序列（LIS）
 *
 * 最长递增子序列：在数组中找到一个最长的严格递增的子序列（不要求连续）。
 * 方法一：动态规划 O(n^2)：dp[i] 表示以 nums[i] 结尾的 LIS 长度，
 *   dp[i] = max(dp[j] + 1) for all j < i 且 nums[j] < nums[i]。
 * 方法二：贪心 + 二分 O(n log n)：维护一个数组 tails，tails[i] 表示长度为 i+1
 *   的递增子序列的最小末尾元素。对每个 num 用二分查找其在 tails 中的位置并替换。
 */

// 方法一：动态规划 O(n^2)
function lengthOfLIS(arr) {
  if (arr.length === 0) return 0;
  const n = arr.length;
  const dp = new Array(n).fill(1); // 每个元素自身构成长度1的子序列
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}

// 方法一进阶：同时返回一个 LIS 序列
function getLIS(arr) {
  if (arr.length === 0) return [];
  const n = arr.length;
  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1); // 记录前驱索引
  let maxLen = 1;
  let endIndex = 0;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
      }
    }
    if (dp[i] > maxLen) {
      maxLen = dp[i];
      endIndex = i;
    }
  }
  // 回溯路径
  const sequence = [];
  let idx = endIndex;
  while (idx !== -1) {
    sequence.unshift(arr[idx]);
    idx = prev[idx];
  }
  return sequence;
}

// 方法二：贪心 + 二分 O(n log n)
function lengthOfLISBinary(arr) {
  if (arr.length === 0) return 0;
  const tails = []; // tails[i] = 长度为 i+1 的 LIS 的最小末尾
  for (const num of arr) {
    // 二分查找第一个 >= num 的位置
    let left = 0;
    let right = tails.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    if (left === tails.length) {
      tails.push(num); // num 比所有都大，扩展长度
    } else {
      tails[left] = num; // 替换，保持更小末尾
    }
  }
  return tails.length;
}

// 测试
console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3])); // 4
console.log(lengthOfLIS([7, 7, 7, 7])); // 1
console.log(lengthOfLIS([])); // 0

console.log(lengthOfLISBinary([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLISBinary([0, 1, 0, 3, 2, 3])); // 4

console.log(getLIS([10, 9, 2, 5, 3, 7, 101, 18])); // [2, 3, 7, 101] 或 [2, 5, 7, 101]
console.log(getLIS([1, 3, 6, 7, 9, 4, 10, 5, 6])); // 长度6
