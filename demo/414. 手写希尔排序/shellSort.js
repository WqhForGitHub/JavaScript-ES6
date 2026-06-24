/**
 * 手写希尔排序
 *
 * 希尔排序是插入排序的改进版（缩小增量排序）。
 * 将数组按增量 gap 分组，对每组做插入排序；逐步缩小 gap 直至 1，完成最终排序。
 * 通过先做"宏观"移动使数组趋于有序，最后 gap=1 的插入排序效率很高。
 * 时间复杂度取决于增量序列，平均约 O(n^1.3)，空间 O(1)，不稳定排序。
 * 本实现使用 gap = gap >> 1 的序列（Shell 原始序列）。
 */

function shellSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    // 对每个 gap 做 gap-步长的插入排序
    for (let i = gap; i < n; i++) {
      const current = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > current) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = current;
    }
    gap = Math.floor(gap / 2);
  }
  return a;
}

// 使用 Knuth 增量序列 (3^k - 1) / 2：1, 4, 13, 40, 121, ...
function shellSortKnuth(arr) {
  const a = arr.slice();
  const n = a.length;
  // 计算初始 gap
  let gap = 1;
  while (gap < n / 3) {
    gap = gap * 3 + 1;
  }
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const current = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > current) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = current;
    }
    gap = Math.floor((gap - 1) / 3);
  }
  return a;
}

// 测试
console.log(shellSort([12, 34, 54, 2, 3]));
// [2, 3, 12, 34, 54]

console.log(shellSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]

console.log(shellSort([9, 8, 7, 6, 5, 4, 3, 2, 1]));
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

console.log(shellSort([])); // []
console.log(shellSort([1])); // [1]

console.log(shellSortKnuth([12, 34, 54, 2, 3]));
// [2, 3, 12, 34, 54]

console.log(shellSortKnuth([5, 2, 8, 1, 9, 3, 7, 4, 6]));
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
