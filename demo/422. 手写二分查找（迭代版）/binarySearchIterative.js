/**
 * 手写二分查找（迭代版）
 *
 * 迭代版使用 while 循环替代递归，避免递归栈开销。
 * 时间 O(log n)，空间 O(1)。在实际工程中更常使用。
 * 返回目标值索引，找不到返回 -1。
 */

function binarySearchIterative(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1); // 防整数溢出
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] > target) {
      right = mid - 1; // 目标在左半
    } else {
      left = mid + 1; // 目标在右半
    }
  }
  return -1;
}

// 测试
const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

console.log(binarySearchIterative(arr, 7)); // 3
console.log(binarySearchIterative(arr, 19)); // 9
console.log(binarySearchIterative(arr, 1)); // 0
console.log(binarySearchIterative(arr, 10)); // -1
console.log(binarySearchIterative(arr, 20)); // -1

console.log(binarySearchIterative([], 1)); // -1
console.log(binarySearchIterative([5], 5)); // 0
console.log(binarySearchIterative([5], 3)); // -1

// 大数组测试
const big = Array.from({ length: 1000000 }, (_, i) => i * 2);
console.log(binarySearchIterative(big, 999998)); // 499999
console.log(binarySearchIterative(big, 999999)); // -1 (奇数不存在)
