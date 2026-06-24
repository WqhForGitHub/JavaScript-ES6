/**
 * 手写插入排序
 *
 * 插入排序将数组分为已排序和未排序两部分，依次取未排序元素插入到已排序部分的正确位置。
 * 类似整理扑克牌的过程。时间复杂度 O(n^2)，空间 O(1)，稳定排序。
 * 对于近乎有序的数组效率高（接近 O(n)），是小数组排序的优选（常用于混合排序的子过程）。
 */

function insertionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const current = a[i]; // 待插入元素
    let j = i - 1;
    // 向后移动比 current 大的元素
    while (j >= 0 && a[j] > current) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = current;
  }
  return a;
}

// 二分插入排序：用二分查找确定插入位置，减少比较次数（移动次数不变）
function binaryInsertionSort(arr) {
  const a = arr.slice();
  for (let i = 1; i < a.length; i++) {
    const current = a[i];
    // 在 [0, i) 中二分查找插入位置
    let left = 0;
    let right = i;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (a[mid] > current) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    // 将 [left, i-1] 整体后移
    for (let j = i; j > left; j--) {
      a[j] = a[j - 1];
    }
    a[left] = current;
  }
  return a;
}

// 测试
console.log(insertionSort([12, 11, 13, 5, 6]));
// [5, 6, 11, 12, 13]

console.log(insertionSort([9, 5, 1, 4, 3]));
// [1, 3, 4, 5, 9]

console.log(insertionSort([])); // []
console.log(insertionSort([1])); // [1]
console.log(insertionSort([1, 2, 3, 4, 5])); // [1, 2, 3, 4, 5] (近乎有序很快)

console.log(binaryInsertionSort([12, 11, 13, 5, 6]));
// [5, 6, 11, 12, 13]

console.log(binaryInsertionSort([3, 1, 4, 1, 5, 9, 2, 6]));
// [1, 1, 2, 3, 4, 5, 6, 9]
