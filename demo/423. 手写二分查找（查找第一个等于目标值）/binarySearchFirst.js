/**
 * 手写二分查找（查找第一个等于目标值）
 *
 * 在有序数组中（可能含重复元素）查找第一个等于 target 的索引。
 * 策略：当 arr[mid] === target 时不立即返回，而是继续在左半查找（right = mid - 1），
 * 用一个变量记录候选答案。最终 left 即为第一个等于目标的位置。
 * 时间 O(log n)，空间 O(1)。找不到返回 -1。
 */

function binarySearchFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] === target) {
      result = mid; // 记录候选
      right = mid - 1; // 继续向左找更早的
    } else if (arr[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result;
}

// 另一种简洁写法：返回 left
function binarySearchFirstV2(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] >= target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  // left 指向第一个 >= target 的位置，需验证是否等于 target
  if (left < arr.length && arr[left] === target) return left;
  return -1;
}

// 测试
const arr = [1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7];

console.log(binarySearchFirst(arr, 2)); // 1
console.log(binarySearchFirst(arr, 4)); // 5
console.log(binarySearchFirst(arr, 6)); // 8
console.log(binarySearchFirst(arr, 1)); // 0
console.log(binarySearchFirst(arr, 7)); // 11
console.log(binarySearchFirst(arr, 0)); // -1
console.log(binarySearchFirst(arr, 8)); // -1

console.log(binarySearchFirstV2(arr, 2)); // 1
console.log(binarySearchFirstV2(arr, 6)); // 8
console.log(binarySearchFirstV2(arr, 0)); // -1

// 全部相同元素
const allSame = [5, 5, 5, 5, 5];
console.log(binarySearchFirst(allSame, 5)); // 0
