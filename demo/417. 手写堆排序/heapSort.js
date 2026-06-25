/**
 * 手写堆排序
 *
 * 堆排序利用最大堆的性质进行排序：
 *   1. 将数组构建成最大堆（从最后一个非叶子节点开始下沉调整）。
 *   2. 每次将堆顶（最大值）与末尾交换，缩小堆范围并对新堆顶下沉调整。
 *   3. 重复直至堆大小为 1，数组变为升序。
 * 时间复杂度 O(n log n)，空间 O(1)（原地），不稳定排序。
 */

function heapSort(arr) {
  const a = arr.slice();
  const n = a.length;

  // 下沉操作：在 [0, heapSize) 范围内调整以 i 为根的子树
  function siftDown(i, heapSize) {
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;
      if (left < heapSize && a[left] > a[largest]) largest = left;
      if (right < heapSize && a[right] > a[largest]) largest = right;
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      i = largest;
    }
  }

  // 1. 建堆：从最后一个非叶子节点到根逐个下沉
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(i, n);
  }

  // 2. 排序：每次把最大值换到末尾，缩小堆并调整
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]]; // 堆顶最大值放到末尾
    siftDown(0, i); // 对缩小后的堆调整
  }

  return a;
}

// 测试
console.log(heapSort([12, 11, 13, 5, 6, 7]));
// [5, 6, 7, 11, 12, 13]

console.log(heapSort([4, 10, 3, 5, 1]));
// [1, 3, 4, 5, 10]

console.log(heapSort([9, 8, 7, 6, 5, 4, 3, 2, 1]));
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

console.log(heapSort([])); // []
console.log(heapSort([1])); // [1]
console.log(heapSort([3, 1, 2])); // [1, 2, 3]

// 验证：随机大数组排序正确
const big = Array.from({ length: 1000 }, () =>
  Math.floor(Math.random() * 10000),
);
const sorted = heapSort(big);
const isSorted = sorted.every((v, i) => i === 0 || sorted[i - 1] <= v);
console.log(isSorted); // true
