/**
 * 手写数组排序——归并排序（Merge Sort）
 *
 * 核心思想：分治法。
 *   1. 分：把数组不断对半拆分，直到每部分只剩 1 个元素（自然有序）
 *   2. 治：把两个有序子数组合并成一个更大的有序数组
 *   3. 自底向上合并完成排序
 *
 * 时间复杂度：最好/最坏/平均都是 O(n log n)（稳定，不受数据分布影响）
 * 空间复杂度：O(n)（需要临时数组存放合并结果）
 * 稳定性：稳定（合并时相等元素取左边先）
 *
 * 优点：稳定、时间复杂度恒定，适合链表排序、外部排序
 * 缺点：需要 O(n) 额外空间
 */

// ===== 方法 1：递归归并排序（自顶向下，推荐）=====

function mergeSort1(arr) {
  if (arr.length <= 1) return [...arr];

  // 分：从中间切两半
  const mid = arr.length >> 1;
  const left = mergeSort1(arr.slice(0, mid));
  const right = mergeSort1(arr.slice(mid));

  // 治：合并两个有序数组
  return merge(left, right);
}

// 合并两个有序数组
function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    // 注意 <= 保证稳定性（相等时取左边）
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  // 把剩余元素追加进去
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

// ===== 方法 2：原地归并排序（在原数组上操作，借助辅助数组）=====

function mergeSort2(arr) {
  const result = [...arr];
  const temp = new Array(result.length); // 复用临时数组，减少分配

  function sort(left, right) {
    if (left >= right) return;
    const mid = (left + right) >> 1;
    sort(left, mid);
    sort(mid + 1, right);
    mergeInPlace(result, temp, left, mid, right);
  }

  sort(0, result.length - 1);
  return result;
}

function mergeInPlace(arr, temp, left, mid, right) {
  // 把 arr[left..right] 复制到 temp
  for (let k = left; k <= right; k++) {
    temp[k] = arr[k];
  }
  let i = left; // 左半指针
  let j = mid + 1; // 右半指针
  for (let k = left; k <= right; k++) {
    if (i > mid) {
      arr[k] = temp[j++]; // 左半用完
    } else if (j > right) {
      arr[k] = temp[i++]; // 右半用完
    } else if (temp[i] <= temp[j]) {
      arr[k] = temp[i++]; // 稳定：相等取左
    } else {
      arr[k] = temp[j++];
    }
  }
}

// ===== 方法 3：迭代归并排序（自底向上，无递归）=====

function mergeSort3(arr) {
  const result = [...arr];
  const n = result.length;
  // 步长从 1 开始倍增：1, 2, 4, 8, ...
  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      // 合并 [left, mid] 和 [mid+1, right]
      const temp = result.slice(left, right + 1);
      mergeRange(result, temp, left, mid, right);
    }
  }
  return result;
}

function mergeRange(arr, temp, left, mid, right) {
  let i = left;
  let j = mid + 1;
  let offset = left;
  // temp 对应 [left, right]，索引需减去 left
  while (i <= mid && j <= right) {
    if (temp[i - left] <= temp[j - left]) {
      arr[offset++] = temp[i++ - left];
    } else {
      arr[offset++] = temp[j++ - left];
    }
  }
  while (i <= mid) arr[offset++] = temp[i++ - left];
  while (j <= right) arr[offset++] = temp[j++ - left];
}

// ===== 测试 =====

const arr = [38, 27, 43, 3, 9, 82, 10];
const methods = [
  { name: "递归归并", fn: mergeSort1 },
  { name: "原地归并", fn: mergeSort2 },
  { name: "迭代归并", fn: mergeSort3 },
];

console.log("========== 归并排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [3,9,10,27,38,43,82]
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", mergeSort1([])); // []
console.log("单元素:", mergeSort1([42])); // [42]
console.log("已有序:", mergeSort1([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", mergeSort1([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("含重复:", mergeSort1([3, 1, 2, 1, 3])); // [1,1,2,3,3]

// --- 稳定性验证 ---
console.log("\n========== 稳定性验证 ==========");
const objects = [
  { name: "A", score: 90 },
  { name: "B", score: 80 },
  { name: "C", score: 90 },
  { name: "D", score: 80 },
];
// 用归并思路按 score 排序（保持稳定）
function mergeSortBy(arr, compare) {
  if (arr.length <= 1) return [...arr];
  const mid = arr.length >> 1;
  const left = mergeSortBy(arr.slice(0, mid), compare);
  const right = mergeSortBy(arr.slice(mid), compare);
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}
const sorted = mergeSortBy(objects, (a, b) => a.score - b.score);
console.log(
  "按分数排序:",
  sorted.map((o) => `${o.score}${o.name}`),
);
// ['80B','80D','90A','90C'] —— 稳定

// --- 性能对比 ---
console.log("\n========== 性能对比（20000 随机数）==========");
function timed(fn, arr) {
  const start = performance.now();
  fn(arr);
  return (performance.now() - start).toFixed(3);
}
const random = Array.from({ length: 20000 }, () =>
  Math.floor(Math.random() * 20000),
);
console.log(`递归归并: ${timed(mergeSort1, [...random])}ms`);
console.log(`原地归并: ${timed(mergeSort2, [...random])}ms`);
console.log(`迭代归并: ${timed(mergeSort3, [...random])}ms`);

// --- 应用：统计逆序对（经典面试题）---
console.log("\n========== 应用：统计逆序对 ==========");
function countInversions(arr) {
  const result = [...arr];
  let count = 0;
  function sort(left, right) {
    if (left >= right) return;
    const mid = (left + right) >> 1;
    sort(left, mid);
    sort(mid + 1, right);
    // 合并时统计逆序对
    const temp = result.slice(left, right + 1);
    let i = 0;
    let j = mid - left + 1;
    for (let k = left; k <= right; k++) {
      if (i > mid - left) {
        result[k] = temp[j++];
      } else if (j > right - left) {
        result[k] = temp[i++];
      } else if (temp[i] <= temp[j]) {
        result[k] = temp[i++];
      } else {
        result[k] = temp[j++];
        // 左半剩余元素都与 temp[j] 构成逆序对
        count += mid - left + 1 - i;
      }
    }
  }
  sort(0, result.length - 1);
  return { sorted: result, inversions: count };
}
const inv = countInversions([2, 4, 1, 3, 5]);
console.log("[2,4,1,3,5] =>", inv); // 逆序对: 3 [(4,1),(2,1),(4,3)]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：恒定 O(n log n)，与数据分布无关");
console.log("空间复杂度：O(n)，稳定排序");
console.log("优点：稳定、时间恒定，适合外部排序、链表排序");
console.log("缺点：需要 O(n) 额外空间");
console.log("应用：逆序对统计、TimSort 的基础（V8 现用 TimSort）");
