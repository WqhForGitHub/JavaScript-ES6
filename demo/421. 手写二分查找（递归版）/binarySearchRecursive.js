/**
 * 手写二分查找（递归版）
 *
 * 二分查找要求数组有序，每次比较中间元素与目标值，缩小一半搜索范围。
 * 递归版通过函数调用栈实现，时间 O(log n)，空间 O(log n)（递归栈）。
 * 返回目标值索引，找不到返回 -1。
 */

function binarySearchRecursive(arr, target) {
  return search(arr, target, 0, arr.length - 1);
}

function search(arr, target, left, right) {
  if (left > right) return -1;
  const mid = left + ((right - left) >> 1); // 防溢出写法
  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] > target) {
    return search(arr, target, left, mid - 1);
  } else {
    return search(arr, target, mid + 1, right);
  }
}

// 测试
const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

console.log(binarySearchRecursive(arr, 7)); // 3
console.log(binarySearchRecursive(arr, 19)); // 9
console.log(binarySearchRecursive(arr, 1)); // 0
console.log(binarySearchRecursive(arr, 10)); // -1
console.log(binarySearchRecursive(arr, 20)); // -1

console.log(binarySearchRecursive([], 1)); // -1
console.log(binarySearchRecursive([5], 5)); // 0
console.log(binarySearchRecursive([5], 3)); // -1

// 边界情况
console.log(binarySearchRecursive([1, 2], 1)); // 0
console.log(binarySearchRecursive([1, 2], 2)); // 1
