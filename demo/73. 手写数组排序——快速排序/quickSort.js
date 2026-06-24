/**
 * 手写数组排序——快速排序（Quick Sort）
 *
 * 核心思想：分治法。
 *   1. 选一个「基准」(pivot)
 *   2. 把数组分成两部分：小于 pivot 的放左，大于 pivot 的放右
 *   3. 对左右两部分递归快排
 *   4. 合并
 *
 * 时间复杂度：
 *   - 最好/平均 O(n log n)
 *   - 最坏 O(n^2)（基准每次都选到最值，如已有序且总取首元素）
 * 空间复杂度：O(log n) 递归栈（平均），最坏 O(n)
 * 稳定性：不稳定
 *
 * 以下提供 3 种实现：
 *   1. 简单版（额外空间，易于理解）
 *   2. 原地版（双指针 partition，节省空间）
 *   3. 三路快排（优化大量重复元素）
 */

// ===== 方法 1：简单版快排（额外空间）=====

function quickSort1(arr) {
  if (arr.length <= 1) return [...arr];

  const pivot = arr[0]; // 选第一个为基准
  const left = [];
  const right = [];
  const equal = [];
  for (const item of arr) {
    if (item < pivot) left.push(item);
    else if (item > pivot) right.push(item);
    else equal.push(item);
  }
  return [...quickSort1(left), ...equal, ...quickSort1(right)];
}

// 优点：思路清晰，易懂
// 缺点：需要 O(n) 额外空间，非原地

// ===== 方法 2：原地快排（Lomuto partition + 双指针交换）=====

function quickSort2(arr) {
  const result = [...arr];
  // 对 [low, high] 区间排序
  function partition(low, high) {
    const pivot = result[high]; // 取末尾为基准
    let i = low - 1; // i 指向「小于区」的右边界
    for (let j = low; j < high; j++) {
      if (result[j] < pivot) {
        i++;
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    // 把基准放到正确位置
    [result[i + 1], result[high]] = [result[high], result[i + 1]];
    return i + 1; // 返回基准下标
  }

  function sort(low, high) {
    if (low < high) {
      const p = partition(low, high);
      sort(low, p - 1);
      sort(p + 1, high);
    }
  }

  sort(0, result.length - 1);
  return result;
}

// 优点：原地排序，空间 O(log n)
// 缺点：已有序时退化为 O(n^2)（可用随机基准优化）

// ===== 方法 2 优化：随机基准 =====

function quickSort2Random(arr) {
  const result = [...arr];
  function partition(low, high) {
    // 随机选基准并交换到末尾，避免最坏情况
    const randIndex = low + Math.floor(Math.random() * (high - low + 1));
    [result[randIndex], result[high]] = [result[high], result[randIndex]];

    const pivot = result[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (result[j] < pivot) {
        i++;
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    [result[i + 1], result[high]] = [result[high], result[i + 1]];
    return i + 1;
  }
  function sort(low, high) {
    if (low < high) {
      const p = partition(low, high);
      sort(low, p - 1);
      sort(p + 1, high);
    }
  }
  sort(0, result.length - 1);
  return result;
}

// ===== 方法 3：三路快排（优化大量重复元素）=====
// 把数组分为 < pivot、= pivot、> pivot 三部分，跳过等于部分

function quickSort3Way(arr) {
  const result = [...arr];

  function sort(low, high) {
    if (low >= high) return;
    const pivot = result[low]; // 取首元素为基准
    let lt = low; // [low, lt] < pivot
    let gt = high; // [gt, high] > pivot
    let i = low + 1; // (lt, i) = pivot
    while (i <= gt) {
      if (result[i] < pivot) {
        [result[lt], result[i]] = [result[i], result[lt]];
        lt++;
        i++;
      } else if (result[i] > pivot) {
        [result[i], result[gt]] = [result[gt], result[i]];
        gt--;
        // i 不动，因为换过来的元素还没看
      } else {
        i++; // 等于 pivot，直接推进
      }
    }
    sort(low, lt - 1);
    sort(gt + 1, high);
  }

  sort(0, result.length - 1);
  return result;
}

// 优点：大量重复元素时性能极佳，避免重复处理
// 缺点：实现稍复杂

// ===== 测试 =====

const arr = [3, 6, 8, 10, 1, 2, 1];
const methods = [
  { name: "简单版", fn: quickSort1 },
  { name: "原地版", fn: quickSort2 },
  { name: "随机基准", fn: quickSort2Random },
  { name: "三路快排", fn: quickSort3Way },
];

console.log("========== 快速排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [1,1,2,3,6,8,10]
});

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", quickSort2([])); // []
console.log("单元素:", quickSort2([42])); // [42]
console.log("已有序:", quickSort2([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", quickSort2([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("全相同:", quickSort3Way([7, 7, 7, 7])); // [7,7,7,7]

// --- 大量重复元素（三路快排优势）---
console.log("\n========== 大量重复元素 ==========");
const manyDup = [1, 1, 1, 1, 2, 2, 2, 1, 1, 2, 1, 2];
console.log("原始:", manyDup);
console.log("三路快排:", quickSort3Way(manyDup)); // [1,1,1,1,1,1,1,2,2,2,2,2]

// --- 性能对比 ---
console.log("\n========== 性能对比（10000 随机数）==========");
function timed(fn, arr) {
  const start = performance.now();
  fn(arr);
  return (performance.now() - start).toFixed(3);
}
const random = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
console.log(`简单版:     ${timed(quickSort1, [...random])}ms`);
console.log(`原地版:     ${timed(quickSort2, [...random])}ms`);
console.log(`随机基准:   ${timed(quickSort2Random, [...random])}ms`);
console.log(`三路快排:   ${timed(quickSort3Way, [...random])}ms`);

// --- 最坏情况对比（已有序数组）---
console.log("\n========== 最坏情况（已有序 5000）==========");
const sorted = Array.from({ length: 5000 }, (_, i) => i);
console.log(`原地版(取末尾基准): ${timed(quickSort2, [...sorted])}ms`); // 可能较慢/栈深
console.log(`随机基准:           ${timed(quickSort2Random, [...sorted])}ms`); // 更稳定

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：平均 O(n log n)，最坏 O(n^2)");
console.log("空间复杂度：O(log n) 递归栈");
console.log("稳定性：不稳定");
console.log("优化：随机基准避免最坏情况；三路快排处理重复元素");
console.log("快排是实际工程最常用排序之一（V8 Array.sort 早期用快排）");
