/**
 * 手写数组排序——冒泡排序（Bubble Sort）
 *
 * 核心思想：相邻元素两两比较，将较大（或较小）的元素逐步"冒泡"到数组末尾。
 *   每一轮把当前未排序部分的最大值放到正确位置。
 *
 * 时间复杂度：
 *   - 最好 O(n)（已有序 + 优化标志位）
 *   - 最坏/平均 O(n^2)
 * 空间复杂度：O(1)，原地排序
 * 稳定性：稳定（相等元素不交换，相对顺序不变）
 *
 * 以下提供 2 种实现：
 *   1. 基础冒泡
 *   2. 优化冒泡（提前退出 + 记录最后交换位置）
 */

// ===== 方法 1：基础冒泡排序 =====

function bubbleSort1(arr) {
  const result = [...arr]; // 不修改原数组
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    // 每轮过后，最大的 i+1 个元素已就位，内层循环范围递减
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        // 相邻元素交换
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

// 缺点：即使数组已有序，仍会进行完整的 n-1 轮比较

// ===== 方法 2：优化冒泡排序（推荐）=====

function bubbleSort2(arr) {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false; // 本轮是否发生过交换
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    // 若本轮没有交换，说明数组已有序，提前结束
    if (!swapped) break;
  }
  return result;
}

// 优化点：无交换则提前退出，最好情况 O(n)

// ===== 方法 3：鸡尾酒排序（双向冒泡）=====
// 每轮先从左到右把最大值冒到右侧，再从右到左把最小值冒到左侧

function cocktailSort(arr) {
  const result = [...arr];
  let left = 0;
  let right = result.length - 1;
  while (left < right) {
    let swapped = false;
    // 从左到右，把最大值冒到 right
    for (let i = left; i < right; i++) {
      if (result[i] > result[i + 1]) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        swapped = true;
      }
    }
    right--;
    // 从右到左，把最小值冒到 left
    for (let i = right; i > left; i--) {
      if (result[i - 1] > result[i]) {
        [result[i - 1], result[i]] = [result[i], result[i - 1]];
        swapped = true;
      }
    }
    left++;
    if (!swapped) break;
  }
  return result;
}

// 优点：对部分有序数组效率更高
// 缺点：实现更复杂

// ===== 测试 =====

const arr = [64, 34, 25, 12, 22, 11, 90];
const methods = [
  { name: "基础冒泡", fn: bubbleSort1 },
  { name: "优化冒泡", fn: bubbleSort2 },
  { name: "鸡尾酒排序", fn: cocktailSort },
];

console.log("========== 冒泡排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [11,12,22,25,34,64,90]
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", bubbleSort2([])); // []
console.log("单元素:", bubbleSort2([42])); // [42]
console.log("已有序:", bubbleSort2([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", bubbleSort2([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("含重复:", bubbleSort2([3, 1, 2, 1, 3])); // [1,1,2,3,3]
console.log("含负数:", bubbleSort2([-3, 1, -2, 0])); // [-3,-2,0,1]

// --- 稳定性验证 ---
console.log("\n========== 稳定性验证 ==========");
// 相同 key 的对象，冒泡排序后应保持原有相对顺序
const objects = [
  { name: "A", score: 90 },
  { name: "B", score: 80 },
  { name: "C", score: 90 },
  { name: "D", score: 80 },
];
const stableSorted = [...objects].sort((a, b) => a.score - b.score);
// 注意：原生 sort 不保证稳定（旧版），冒泡是稳定的
function bubbleSortBy(arr, compare) {
  const result = [...arr];
  for (let i = 0; i < result.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < result.length - 1 - i; j++) {
      if (compare(result[j], result[j + 1]) > 0) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return result;
}
console.log("按分数排序:", bubbleSortBy(objects, (a, b) => a.score - b.score));
// B(80), D(80), A(90), C(90) —— 同分数保持原顺序，稳定

// --- 优化效果对比（已有序数组）---
console.log("\n========== 优化效果对比（已有序）==========");
const sortedArr = Array.from({ length: 1000 }, (_, i) => i);

function timed(fn, arr) {
  const start = performance.now();
  fn(arr);
  return (performance.now() - start).toFixed(3);
}
console.log(`基础冒泡 (1000 已有序): ${timed(bubbleSort1, sortedArr)}ms`);
console.log(`优化冒泡 (1000 已有序): ${timed(bubbleSort2, sortedArr)}ms`);
// 优化版应快很多（O(n) vs O(n^2)）

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：最好 O(n)，最坏/平均 O(n^2)");
console.log("空间复杂度：O(1)，稳定排序");
console.log("优化点：1) swapped 提前退出  2) 鸡尾酒双向冒泡");
console.log("适用场景：数据量小或基本有序时；教学用途");
console.log("生产环境：请用 Array.prototype.sort（通常快排/归并）");
