/**
 * 手写桶排序
 *
 * 桶排序将元素按值范围分到若干个桶中，每个桶内部单独排序（常用插入排序），
 * 再依次合并各桶。是计数排序的推广，适用于均匀分布的数据。
 * 平均时间 O(n + k)（k 为桶数），最坏 O(n^2)（全进一个桶），空间 O(n + k)，稳定。
 * 本实现支持浮点数和负数，桶内使用插入排序。
 */

function bucketSort(arr, bucketSize = 5) {
  if (arr.length === 0) return [];
  const a = arr.slice();

  const min = Math.min(...a);
  const max = Math.max(...a);
  // 桶数量
  const bucketCount = Math.max(1, Math.floor((max - min) / bucketSize) + 1);
  const buckets = Array.from({ length: bucketCount }, () => []);

  // 将元素分配到桶中
  for (const num of a) {
    const index = Math.floor((num - min) / bucketSize);
    buckets[index].push(num);
  }

  // 对每个桶排序并合并
  const result = [];
  for (const bucket of buckets) {
    insertionSort(bucket);
    result.push(...bucket);
  }
  return result;
}

function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = current;
  }
  return arr;
}

// 测试
console.log(bucketSort([0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51]));
// [0.23, 0.25, 0.32, 0.42, 0.47, 0.51, 0.52]

console.log(bucketSort([29, 25, 3, 49, 9, 37, 21, 43]));
// [3, 9, 21, 25, 29, 37, 43, 49]

console.log(bucketSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]

console.log(bucketSort([])); // []
console.log(bucketSort([1])); // [1]

// 负数支持
console.log(bucketSort([-5, 3, -1, 0, 7, -3, 2]));
// [-5, -3, -1, 0, 2, 3, 7]

// 指定桶大小
console.log(bucketSort([1, 100, 2, 99, 3, 98], 10));
// [1, 2, 3, 98, 99, 100]
