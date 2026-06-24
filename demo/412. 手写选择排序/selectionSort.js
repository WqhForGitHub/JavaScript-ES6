/**
 * 手写选择排序
 *
 * 选择排序每轮从未排序部分选出最小元素，与未排序部分首位交换。
 * 时间复杂度 O(n^2)，空间 O(1)，不稳定排序（交换可能改变相等元素相对顺序）。
 * 交换次数少（最多 n-1 次），适合交换代价高的场景。
 */

function selectionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    // 在 [i, n) 找最小值索引
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [a[i], a[minIndex]] = [a[minIndex], a[i]];
    }
  }
  return a;
}

// 双向选择排序（每轮同时找最小和最大，减少轮数）
function selectionSortBidirectional(arr) {
  const a = arr.slice();
  let left = 0;
  let right = a.length - 1;
  while (left < right) {
    let minIndex = left;
    let maxIndex = left;
    for (let i = left; i <= right; i++) {
      if (a[i] < a[minIndex]) minIndex = i;
      if (a[i] > a[maxIndex]) maxIndex = i;
    }
    // 先放最小值
    [a[left], a[minIndex]] = [a[minIndex], a[left]];
    // 若最大值原本在 left 位置，已被换到 minIndex
    if (maxIndex === left) maxIndex = minIndex;
    [a[right], a[maxIndex]] = [a[maxIndex], a[right]];
    left++;
    right--;
  }
  return a;
}

// 测试
console.log(selectionSort([64, 25, 12, 22, 11]));
// [11, 12, 22, 25, 64]

console.log(selectionSort([5, 2, 8, 1, 9, 3]));
// [1, 2, 3, 5, 8, 9]

console.log(selectionSort([])); // []
console.log(selectionSort([1])); // [1]
console.log(selectionSort([2, 1])); // [1, 2]

console.log(selectionSortBidirectional([64, 25, 12, 22, 11]));
// [11, 12, 22, 25, 64]

console.log(selectionSortBidirectional([3, 1, 4, 1, 5, 9, 2, 6]));
// [1, 1, 2, 3, 4, 5, 6, 9]
