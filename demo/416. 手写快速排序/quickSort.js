/**
 * 手写快速排序
 *
 * 快速排序采用分治：选取一个基准（pivot），将数组划分为小于和大于基准的两部分，
 * 递归排序两部分。平均时间 O(n log n)，最坏 O(n^2)（已有序 + 固定选首元素），
 * 空间 O(log n)（递归栈）。不稳定排序。
 * 本实现提供：
 *   1. 经典版（额外空间）
 *   2. 原地分区版（Lomuto 分区）
 *   3. 三路快排（处理大量重复元素）
 *   4. 随机化基准避免最坏情况
 */

// 版本1：简洁版（使用额外空间）
function quickSort(arr) {
  const a = arr.slice();
  if (a.length <= 1) return a;
  const pivot = a[0];
  const left = [];
  const right = [];
  const equal = [];
  for (const item of a) {
    if (item < pivot) left.push(item);
    else if (item > pivot) right.push(item);
    else equal.push(item);
  }
  return quickSort(left).concat(equal, quickSort(right));
}

// 版本2：原地分区（Lomuto 分区）
function quickSortInPlace(arr) {
  const a = arr.slice();
  _quickSort(a, 0, a.length - 1);
  return a;
}

function _quickSort(a, low, high) {
  if (low < high) {
    const p = partition(a, low, high);
    _quickSort(a, low, p - 1);
    _quickSort(a, p + 1, high);
  }
}

function partition(a, low, high) {
  // 随机化基准
  const randIndex = low + Math.floor(Math.random() * (high - low + 1));
  [a[randIndex], a[high]] = [a[high], a[randIndex]];
  const pivot = a[high];
  let i = low; // i 指向小于 pivot 区域的末尾
  for (let j = low; j < high; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[high]] = [a[high], a[i]];
  return i;
}

// 版本3：三路快排（适用于大量重复元素）
function quickSort3Way(arr) {
  const a = arr.slice();
  _quickSort3Way(a, 0, a.length - 1);
  return a;
}

function _quickSort3Way(a, low, high) {
  if (low >= high) return;
  // 随机基准
  const randIndex = low + Math.floor(Math.random() * (high - low + 1));
  [a[low], a[randIndex]] = [a[randIndex], a[low]];
  const pivot = a[low];
  let lt = low; // [low, lt] < pivot
  let gt = high; // [gt, high] > pivot
  let i = low + 1; // (lt, i) == pivot
  while (i <= gt) {
    if (a[i] < pivot) {
      [a[lt], a[i]] = [a[i], a[lt]];
      lt++;
      i++;
    } else if (a[i] > pivot) {
      [a[i], a[gt]] = [a[gt], a[i]];
      gt--;
    } else {
      i++;
    }
  }
  _quickSort3Way(a, low, lt - 1);
  _quickSort3Way(a, gt + 1, high);
}

// 测试
console.log(quickSort([10, 7, 8, 9, 1, 5]));
// [1, 5, 7, 8, 9, 10]

console.log(quickSortInPlace([10, 7, 8, 9, 1, 5]));
// [1, 5, 7, 8, 9, 10]

console.log(quickSort3Way([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]));
// [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]

console.log(quickSort([])); // []
console.log(quickSort([1])); // [1]

// 大量重复元素测试三路快排
const dupArr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 3));
console.log(quickSort3Way(dupArr)); // 有序的 0,1,2 序列
