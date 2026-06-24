/**
 * 手写归并排序
 *
 * 归并排序采用分治思想：将数组递归地分成两半分别排序，再合并两个有序子数组。
 * 时间复杂度 O(n log n)，空间 O(n)（需辅助数组），稳定排序。
 * 优点：稳定且最坏情况仍为 O(n log n)，适合链表排序和外排序。
 * 本实现包含递归版和自底向上迭代版。
 */

// 递归版
function mergeSort(arr) {
  const a = arr.slice();
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  return merge(left, right);
}

// 合并两个有序数组
function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

// 自底向上迭代版（避免递归栈）
function mergeSortIterative(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      mergeInPlace(a, left, mid, right);
    }
  }
  return a;
}

// 原地合并 a[left..mid] 和 a[mid+1..right]
function mergeInPlace(a, left, mid, right) {
  const temp = [];
  let i = left;
  let j = mid + 1;
  while (i <= mid && j <= right) {
    if (a[i] <= a[j]) temp.push(a[i++]);
    else temp.push(a[j++]);
  }
  while (i <= mid) temp.push(a[i++]);
  while (j <= right) temp.push(a[j++]);
  for (let k = 0; k < temp.length; k++) {
    a[left + k] = temp[k];
  }
}

// 测试
console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]

console.log(mergeSort([5, 2, 8, 1, 9, 3]));
// [1, 2, 3, 5, 8, 9]

console.log(mergeSort([])); // []
console.log(mergeSort([1])); // [1]
console.log(mergeSort([2, 1])); // [1, 2]

console.log(mergeSortIterative([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]

console.log(mergeSortIterative([9, 8, 7, 6, 5, 4, 3, 2, 1]));
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
