/**
 * 手写冒泡排序
 *
 * 冒泡排序重复地遍历数组，比较相邻元素，若顺序错误则交换。
 * 每轮将最大元素"冒泡"到末尾。时间复杂度 O(n^2)，空间 O(1)，稳定排序。
 * 优化：若某一轮无任何交换说明已有序，提前结束；记录最后交换位置减少遍历范围。
 */

function bubbleSort(arr) {
  const a = arr.slice(); // 不修改原数组
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    let lastSwapIndex = 0;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        lastSwapIndex = j;
      }
    }
    if (!swapped) break; // 已有序
  }
  return a;
}

// 优化版：记录最后交换位置
function bubbleSortOptimized(arr) {
  const a = arr.slice();
  const n = a.length;
  let end = n - 1;
  while (end > 0) {
    let lastSwap = 0;
    for (let j = 0; j < end; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        lastSwap = j;
      }
    }
    end = lastSwap; // 最后交换位置之后的已有序
    if (lastSwap === 0) break;
  }
  return a;
}

// 测试
console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]

console.log(bubbleSort([5, 1, 4, 2, 8]));
// [1, 2, 4, 5, 8]

console.log(bubbleSort([])); // []
console.log(bubbleSort([1])); // [1]
console.log(bubbleSort([3, 2, 1])); // [1, 2, 3]

console.log(bubbleSortOptimized([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]

// 稳定性验证
const stableTest = [
  { v: 3, id: 1 },
  { v: 1, id: 2 },
  { v: 3, id: 3 },
  { v: 2, id: 4 },
];
const stableResult = bubbleSort(stableTest.map((x) => x.v));
console.log(stableResult); // [1, 2, 3, 3]
