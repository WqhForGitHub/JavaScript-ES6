/**
 * 手写数组排序——选择排序（Selection Sort）
 *
 * 核心思想：每轮在未排序区间里找出最小值，与未排序区间的首位交换。
 *   这样每轮确定一个元素的最终位置。
 *
 * 时间复杂度：
 *   - 最好 / 最坏 / 平均 都是 O(n^2)（无论是否有序都要完整比较）
 * 空间复杂度：O(1)，原地排序
 * 稳定性：不稳定（交换可能改变相等元素的相对顺序）
 *
 * 与冒泡的区别：
 *   - 冒泡每轮多次交换；选择每轮只交换一次（找最值再交换）
 *   - 选择排序交换次数少，但比较次数固定
 */

// ===== 方法 1：基础选择排序（升序）=====

function selectionSort1(arr) {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i; // 假设当前位置是最小值
    // 在 [i+1, n) 中找真正的最小值下标
    for (let j = i + 1; j < n; j++) {
      if (result[j] < result[minIndex]) {
        minIndex = j;
      }
    }
    // 把最小值交换到位置 i
    if (minIndex !== i) {
      [result[i], result[minIndex]] = [result[minIndex], result[i]];
    }
  }
  return result;
}

// ===== 方法 2：双向选择排序（每轮同时找最大和最小）=====

function selectionSort2(arr) {
  const result = [...arr];
  let left = 0;
  let right = result.length - 1;
  while (left < right) {
    let minIndex = left;
    let maxIndex = left;
    for (let i = left; i <= right; i++) {
      if (result[i] < result[minIndex]) minIndex = i;
      if (result[i] > result[maxIndex]) maxIndex = i;
    }
    // 先把最小值换到 left
    [result[left], result[minIndex]] = [result[minIndex], result[left]];
    // 注意：如果最大值原本在 left 位置，被换走了，要修正 maxIndex
    if (maxIndex === left) maxIndex = minIndex;
    // 再把最大值换到 right
    [result[right], result[maxIndex]] = [result[maxIndex], result[right]];
    left++;
    right--;
  }
  return result;
}

// 优点：比较次数减半（每轮处理两个端点）
// 缺点：边界处理复杂（maxIndex 修正）

// ===== 方法 3：通用比较函数版本 =====

function selectionSortBy(arr, compare) {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let targetIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (compare(result[j], result[targetIndex]) < 0) {
        targetIndex = j;
      }
    }
    if (targetIndex !== i) {
      [result[i], result[targetIndex]] = [result[targetIndex], result[i]];
    }
  }
  return result;
}

// ===== 测试 =====

const arr = [64, 25, 12, 22, 11];
const methods = [
  { name: "基础选择排序", fn: selectionSort1 },
  { name: "双向选择排序", fn: selectionSort2 },
];

console.log("========== 选择排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [11,12,22,25,64]
});

// --- 降序排序 ---
console.log("\n========== 降序排序 ==========");
console.log(
  "降序:",
  selectionSortBy(arr, (a, b) => b - a),
); // [64,25,22,12,11]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", selectionSort1([])); // []
console.log("单元素:", selectionSort1([42])); // [42]
console.log("已有序:", selectionSort1([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", selectionSort1([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("含重复:", selectionSort1([3, 1, 2, 1, 3])); // [1,1,2,3,3]

// --- 不稳定性说明 ---
console.log("\n========== 不稳定性说明 ==========");
// [5a, 5b, 2] 选择排序：第一轮找最小值 2（index 2），与 5a(index 0) 交换
// 结果：[2, 5b, 5a]，5a 和 5b 顺序被破坏 => 不稳定
const unstableExample = [
  { v: 5, id: "a" },
  { v: 5, id: "b" },
  { v: 2, id: "c" },
];
const afterSort = selectionSortBy(unstableExample, (x, y) => x.v - y.v);
console.log(
  "排序后:",
  afterSort.map((o) => `${o.v}${o.id}`),
);
// ['2c','5b','5a'] —— 5a/5b 顺序被破坏，证明不稳定

// --- 交换次数对比 ---
console.log("\n========== 交换次数对比 ==========");
function selectionSortCountSwap(arr) {
  const result = [...arr];
  let swaps = 0;
  for (let i = 0; i < result.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < result.length; j++) {
      if (result[j] < result[minIndex]) minIndex = j;
    }
    if (minIndex !== i) {
      [result[i], result[minIndex]] = [result[minIndex], result[i]];
      swaps++;
    }
  }
  return { result, swaps };
}
const r = selectionSortCountSwap([64, 25, 12, 22, 11]);
console.log("结果:", r.result, "交换次数:", r.swaps); // 3 次（冒泡可能要更多）

// --- 性能对比 ---
console.log("\n========== 性能对比（1000 随机数）==========");
const random = Array.from({ length: 1000 }, () =>
  Math.floor(Math.random() * 1000),
);
function timed(fn) {
  const start = performance.now();
  fn([...random]);
  return (performance.now() - start).toFixed(3);
}
console.log(`基础选择排序: ${timed(selectionSort1)}ms`);
console.log(`双向选择排序: ${timed(selectionSort2)}ms`);

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：最好/最坏/平均都是 O(n^2)");
console.log("空间复杂度：O(1)，不稳定排序");
console.log("优点：交换次数最多 n-1 次，写内存开销小");
console.log("缺点：比较次数固定 O(n^2)，不稳定");
console.log("适用场景：数据量小、对交换成本敏感（如外存排序）");
