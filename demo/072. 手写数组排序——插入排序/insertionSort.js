/**
 * 手写数组排序——插入排序（Insertion Sort）
 *
 * 核心思想：把数组分为「已排序」和「未排序」两部分，每次从未排序部分
 *   取一个元素，在已排序部分从后往前找合适的位置插入。
 *   类似整理扑克牌的过程。
 *
 * 时间复杂度：
 *   - 最好 O(n)（已有序，内层不移动）
 *   - 最坏/平均 O(n^2)
 * 空间复杂度：O(1)，原地排序
 * 稳定性：稳定（从后往前比较，相等不移动）
 *
 * 优点：对基本有序的数组非常高效，小数组常优于快排
 */

// ===== 方法 1：基础插入排序（交换法）=====

function insertionSort1(arr) {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    // 把 result[i] 插入到前面已排序部分的合适位置
    let j = i;
    while (j > 0 && result[j - 1] > result[j]) {
      [result[j - 1], result[j]] = [result[j], result[j - 1]];
      j--;
    }
  }
  return result;
}

// 缺点：每次交换都写两次内存，开销较大

// ===== 方法 2：插入排序（移动法，推荐）=====
// 先暂存待插入元素，把比它大的元素整体后移，最后填入空位

function insertionSort2(arr) {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i]; // 暂存待插入元素
    let j = i - 1;
    // 比 current 大的元素整体后移
    while (j >= 0 && result[j] > current) {
      result[j + 1] = result[j];
      j--;
    }
    // 插入到正确位置
    result[j + 1] = current;
  }
  return result;
}

// 优点：减少交换次数（只赋值不交换），性能更好

// ===== 方法 3：二分插入排序（折半查找插入位置）=====
// 在已排序部分用二分查找定位，减少比较次数（但移动次数不变）

function binaryInsertionSort(arr) {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    // 在 [0, i) 中二分查找插入位置
    let left = 0;
    let right = i;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (result[mid] > current) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    // 把 [left, i) 整体后移一位
    for (let j = i; j > left; j--) {
      result[j] = result[j - 1];
    }
    result[left] = current;
  }
  return result;
}

// 优点：比较次数降为 O(n log n)
// 缺点：移动次数仍是 O(n^2)，整体仍 O(n^2)；不稳定时需注意（这里保持稳定）

// ===== 方法 4：通用比较函数版本 =====

function insertionSortBy(arr, compare) {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    let j = i - 1;
    while (j >= 0 && compare(result[j], current) > 0) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = current;
  }
  return result;
}

// ===== 测试 =====

const arr = [12, 11, 13, 5, 6];
const methods = [
  { name: "交换法", fn: insertionSort1 },
  { name: "移动法", fn: insertionSort2 },
  { name: "二分插入", fn: binaryInsertionSort },
];

console.log("========== 插入排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [5,6,11,12,13]
});

// --- 降序 ---
console.log("\n========== 降序 ==========");
console.log(
  "降序:",
  insertionSortBy(arr, (a, b) => b - a),
); // [13,12,11,6,5]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", insertionSort2([])); // []
console.log("单元素:", insertionSort2([42])); // [42]
console.log("已有序:", insertionSort2([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", insertionSort2([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("含重复:", insertionSort2([3, 1, 2, 1, 3])); // [1,1,2,3,3]

// --- 稳定性验证 ---
console.log("\n========== 稳定性验证 ==========");
const objects = [
  { name: "A", score: 90 },
  { name: "B", score: 80 },
  { name: "C", score: 90 },
  { name: "D", score: 80 },
];
const sorted = insertionSortBy(objects, (a, b) => a.score - b.score);
console.log(
  "按分数排序:",
  sorted.map((o) => `${o.score}${o.name}`),
);
// ['80B','80D','90A','90C'] —— 同分数保持原顺序，稳定

// --- 最佳/最坏情况性能 ---
console.log("\n========== 性能对比 ==========");
function timed(fn, arr) {
  const start = performance.now();
  fn(arr);
  return (performance.now() - start).toFixed(3);
}
const sorted1000 = Array.from({ length: 1000 }, (_, i) => i); // 已有序（最好）
const reversed1000 = Array.from({ length: 1000 }, (_, i) => 999 - i); // 逆序（最坏）
console.log(`已有序1000 - 移动法: ${timed(insertionSort2, sorted1000)}ms`); // 接近 O(n)
console.log(`已有序1000 - 二分法: ${timed(binaryInsertionSort, sorted1000)}ms`);
console.log(`逆序1000  - 移动法: ${timed(insertionSort2, reversed1000)}ms`); // O(n^2)

// --- 应用：对小数组优化快排（实际库排序常见）---
console.log("\n========== 应用说明 ==========");
console.log("插入排序在「数据量小」或「基本有序」时非常高效");
console.log("V8 的 TimSort / 很多库排序在子区间小时切回插入排序");
console.log("常见阈值：当子数组长度 < 16 时改用插入排序");

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：最好 O(n)，最坏/平均 O(n^2)");
console.log("空间复杂度：O(1)，稳定排序");
console.log("推荐：移动法（减少交换开销）");
console.log("二分插入：减少比较次数，但移动仍是瓶颈");
console.log("适用：小数组、近乎有序的数据；常作为快排/归并的辅助");
