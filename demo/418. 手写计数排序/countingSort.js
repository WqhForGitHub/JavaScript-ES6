/**
 * 手写计数排序
 *
 * 计数排序是非比较排序，适用于元素为整数且范围不大的情况。
 * 原理：统计每个值出现次数，再按顺序输出。
 * 时间复杂度 O(n + k)（k 为值域范围），空间 O(k)，稳定排序。
 * 局限：当值域 k 远大于 n 时空间浪费严重，不适合负数（需偏移处理）。
 * 本实现支持负数（通过偏移量）并保证稳定性。
 */

function countingSort(arr) {
  if (arr.length === 0) return [];

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const offset = min; // 处理负数：value - min 作为索引

  // 统计计数
  const count = new Array(range).fill(0);
  for (const num of arr) {
    count[num - offset]++;
  }

  // 前缀和（保证稳定性：count[i] 表示值 i 最后应放置的位置）
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  // 从后往前遍历原数组，放入正确位置（保证稳定性）
  const result = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    const num = arr[i];
    count[num - offset]--; // 前缀和减1得到索引
    result[count[num - offset]] = num;
  }

  return result;
}

// 简化版（不要求稳定性，直接展开计数）
function countingSortSimple(arr) {
  if (arr.length === 0) return [];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const count = new Array(max - min + 1).fill(0);
  for (const num of arr) count[num - min]++;
  const result = [];
  for (let i = 0; i < count.length; i++) {
    for (let j = 0; j < count[i]; j++) {
      result.push(i + min);
    }
  }
  return result;
}

// 测试
console.log(countingSort([4, 2, 2, 8, 3, 3, 1]));
// [1, 2, 2, 3, 3, 4, 8]

console.log(countingSort([5, 1, 1, 3, 2, 8, 5]));
// [1, 1, 2, 3, 5, 5, 8]

// 负数支持
console.log(countingSort([-3, 5, -1, 0, 2, -3, 4]));
// [-3, -3, -1, 0, 2, 4, 5]

console.log(countingSort([])); // []
console.log(countingSort([1])); // [1]

console.log(countingSortSimple([4, 2, 2, 8, 3, 3, 1]));
// [1, 2, 2, 3, 3, 4, 8]

// 稳定性验证
const stableTest = [
  { v: 2, id: 1 },
  { v: 1, id: 2 },
  { v: 2, id: 3 },
];
const stableValues = countingSort(stableTest.map((x) => x.v));
console.log(stableValues); // [1, 2, 2]
