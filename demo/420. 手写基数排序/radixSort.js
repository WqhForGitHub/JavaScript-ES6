/**
 * 手写基数排序
 *
 * 基数排序是一种非比较整数排序算法，按"位"从低位到高位（LSD）依次进行计数排序。
 * 每一轮按某一位分配到 10 个桶（0-9），再按桶序收集。
 * 时间 O(d * (n + k))（d 为最大位数，k 为基数 10），空间 O(n + k)，稳定排序。
 * 优点：可以在线性时间内排序整数；缺点：需要额外空间，对负数需特殊处理。
 * 本实现支持负数：分离正负数分别排序后合并。
 */

// LSD 基数排序（仅非负整数）
function radixSortNonNegative(arr) {
  if (arr.length === 0) return [];
  const a = arr.slice();
  const max = Math.max(...a);
  // 按"位"循环，maxDigit 为最大位数
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(a, exp);
  }
  return a;
}

function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = new Array(n);
  const count = new Array(10).fill(0);
  // 统计每个桶的元素个数
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10;
    count[digit]++;
  }
  // 前缀和
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  // 从后往前保证稳定性
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    count[digit]--;
    output[count[digit]] = arr[i];
  }
  // 拷回原数组
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}

// 支持负数的基数排序
function radixSort(arr) {
  if (arr.length === 0) return [];
  const negatives = arr.filter((x) => x < 0).map((x) => -x);
  const nonNegatives = arr.filter((x) => x >= 0);

  const sortedNeg = radixSortNonNegative(negatives).reverse().map((x) => -x);
  const sortedNonNeg = radixSortNonNegative(nonNegatives);

  return sortedNeg.concat(sortedNonNeg);
}

// 测试
console.log(radixSortNonNegative([170, 45, 75, 90, 802, 24, 2, 66]));
// [2, 24, 45, 66, 75, 90, 170, 802]

console.log(radixSortNonNegative([3, 1, 4, 1, 5, 9, 2, 6, 5]));
// [1, 1, 2, 3, 4, 5, 5, 6, 9]

console.log(radixSort([])); // []
console.log(radixSort([1])); // [1]

// 负数支持
console.log(radixSort([-5, 3, -1, 0, 7, -3, 2]));
// [-5, -3, -1, 0, 2, 3, 7]

console.log(radixSort([-10, 5, -20, 15, 0, -5, 10]));
// [-20, -10, -5, 0, 5, 10, 15]
