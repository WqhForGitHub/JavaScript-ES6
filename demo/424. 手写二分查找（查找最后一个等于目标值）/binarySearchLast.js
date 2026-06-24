/**
 * 手写二分查找（查找最后一个等于目标值）
 *
 * 在有序数组中（可能含重复元素）查找最后一个等于 target 的索引。
 * 策略：当 arr[mid] === target 时不立即返回，继续在右半查找（left = mid + 1），
 * 用变量记录候选答案。最终得到最后一个等于目标的位置。
 * 时间 O(log n)，空间 O(1)。找不到返回 -1。
 */

function binarySearchLast(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] === target) {
      result = mid; // 记录候选
      left = mid + 1; // 继续向右找更晚的
    } else if (arr[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result;
}

// 另一种简洁写法：返回 right
function binarySearchLastV2(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  // right 指向最后一个 <= target 的位置，需验证是否等于 target
  if (right >= 0 && arr[right] === target) return right;
  return -1;
}

// 测试
const arr = [1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7];

console.log(binarySearchLast(arr, 2)); // 3
console.log(binarySearchLast(arr, 4)); // 6
console.log(binarySearchLast(arr, 6)); // 10
console.log(binarySearchLast(arr, 1)); // 0
console.log(binarySearchLast(arr, 7)); // 11
console.log(binarySearchLast(arr, 0)); // -1
console.log(binarySearchLast(arr, 8)); // -1

console.log(binarySearchLastV2(arr, 2)); // 3
console.log(binarySearchLastV2(arr, 6)); // 10
console.log(binarySearchLastV2(arr, 0)); // -1

// 全部相同元素
const allSame = [5, 5, 5, 5, 5];
console.log(binarySearchLast(allSame, 5)); // 4

// 统计某值出现次数（利用第一个和最后一个）
function countOccurrences(arr, target) {
  const first = binarySearchFirst(arr, target);
  if (first === -1) return 0;
  const last = binarySearchLast(arr, target);
  return last - first + 1;
}

console.log(countOccurrences(arr, 2)); // 3
console.log(countOccurrences(arr, 6)); // 3
console.log(countOccurrences(arr, 8)); // 0

// 辅助函数（复用上面逻辑）
function binarySearchFirst(arr, target) {
  let left = 0, right = arr.length - 1, result = -1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] === target) { result = mid; right = mid - 1; }
    else if (arr[mid] > target) right = mid - 1;
    else left = mid + 1;
  }
  return result;
}
