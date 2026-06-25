/**
 * 手写数组排序——堆排序（Heap Sort）
 *
 * 核心思想：利用「堆」这种数据结构进行排序。
 *   1. 把数组构建成一个大顶堆（每个节点 >= 其子节点）
 *   2. 把堆顶（最大值）与末尾交换，堆大小减 1
 *   3. 对新的堆顶执行「下沉」操作，重新调整为大顶堆
 *   4. 重复 2-3，直到堆大小为 1，数组有序
 *
 * 完全二叉树的数组表示（下标从 0 开始）：
 *   - 节点 i 的父节点：(i - 1) >> 1
 *   - 节点 i 的左孩子：2 * i + 1
 *   - 节点 i 的右孩子：2 * i + 2
 *
 * 时间复杂度：最好/最坏/平均都是 O(n log n)
 * 空间复杂度：O(1)，原地排序
 * 稳定性：不稳定
 *
 * 优点：时间恒定 O(n log n) 且原地排序（空间 O(1)）
 * 缺点：缓存不友好（跳跃式访问），实际常数较大，通常比快排慢
 */

// ===== 方法 1：标准堆排序（升序，大顶堆）=====

function heapSort1(arr) {
  const result = [...arr];
  const n = result.length;

  // 1. 建堆：从最后一个非叶子节点开始，自底向上下沉
  // 最后一个非叶子节点下标 = (n >> 1) - 1
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(result, i, n);
  }

  // 2. 排序：反复把堆顶最大值换到末尾，缩小堆并下沉调整
  for (let end = n - 1; end > 0; end--) {
    [result[0], result[end]] = [result[end], result[0]]; // 堆顶换到末尾
    siftDown(result, 0, end); // 堆大小变为 end，下沉调整
  }

  return result;
}

/**
 * 下沉操作（大顶堆）
 * @param {number[]} arr 数组
 * @param {number} i 待下沉节点下标
 * @param {number} heapSize 当前堆的有效大小
 */
function siftDown(arr, i, heapSize) {
  while (true) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i; // 假设当前节点最大

    if (left < heapSize && arr[left] > arr[largest]) {
      largest = left;
    }
    if (right < heapSize && arr[right] > arr[largest]) {
      largest = right;
    }
    // 如果最大值就是自己，说明已满足堆性质，停止
    if (largest === i) break;
    // 否则和较大的孩子交换，继续下沉
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}

// ===== 方法 2：递归版下沉（便于理解）=====

function heapSort2(arr) {
  const result = [...arr];
  const n = result.length;

  function siftDownRecursive(i, heapSize) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;
    if (left < heapSize && result[left] > result[largest]) largest = left;
    if (right < heapSize && result[right] > result[largest]) largest = right;
    if (largest !== i) {
      [result[i], result[largest]] = [result[largest], result[i]];
      siftDownRecursive(largest, heapSize);
    }
  }

  // 建堆
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDownRecursive(i, n);
  }
  // 排序
  for (let end = n - 1; end > 0; end--) {
    [result[0], result[end]] = [result[end], result[0]];
    siftDownRecursive(0, end);
  }
  return result;
}

// ===== 方法 3：降序（小顶堆）=====

function heapSortDesc(arr) {
  const result = [...arr];
  const n = result.length;

  // 小顶堆下沉：把较小的值"浮"上去
  function siftDown(i, heapSize) {
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < heapSize && result[left] < result[smallest]) smallest = left;
      if (right < heapSize && result[right] < result[smallest])
        smallest = right;
      if (smallest === i) break;
      [result[i], result[smallest]] = [result[smallest], result[i]];
      i = smallest;
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    [result[0], result[end]] = [result[end], result[0]];
    siftDown(0, end);
  }
  return result; // 小顶堆排序后是降序
}

// ===== 附加：优先队列（最大堆）常用操作 =====

class MaxHeap {
  constructor(arr = []) {
    this.heap = [...arr];
    // 建堆
    for (let i = (this.heap.length >> 1) - 1; i >= 0; i--) {
      this._siftDown(i, this.heap.length);
    }
  }
  _siftDown(i, size) {
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let max = i;
      if (l < size && this.heap[l] > this.heap[max]) max = l;
      if (r < size && this.heap[r] > this.heap[max]) max = r;
      if (max === i) break;
      [this.heap[i], this.heap[max]] = [this.heap[max], this.heap[i]];
      i = max;
    }
  }
  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent] >= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  push(val) {
    this.heap.push(val);
    this._siftUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0, this.heap.length);
    }
    return top;
  }
  peek() {
    return this.heap[0];
  }
  get size() {
    return this.heap.length;
  }
}

// ===== 测试 =====

const arr = [4, 10, 3, 5, 1, 8, 2, 7, 6, 9];
const methods = [
  { name: "标准堆排序(迭代)", fn: heapSort1 },
  { name: "递归堆排序", fn: heapSort2 },
];

console.log("========== 堆排序 ==========\n");
console.log("原始数组:", arr);

methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(arr)); // [1,2,3,4,5,6,7,8,9,10]
});

console.log("\n--- 降序（小顶堆）---");
console.log("降序:", heapSortDesc(arr)); // [10,9,8,7,6,5,4,3,2,1]

// --- 边界情况 ---
console.log("\n========== 边界情况 ==========");
console.log("空数组:", heapSort1([])); // []
console.log("单元素:", heapSort1([42])); // [42]
console.log("已有序:", heapSort1([1, 2, 3, 4, 5])); // [1,2,3,4,5]
console.log("逆序:", heapSort1([5, 4, 3, 2, 1])); // [1,2,3,4,5]
console.log("含重复:", heapSort1([3, 1, 2, 1, 3])); // [1,1,2,3,3]

// --- 建堆过程演示 ---
console.log("\n========== 建堆过程演示 ==========");
const demo = [4, 10, 3, 5, 1];
console.log("原始:", demo);
const heapDemo = [...demo];
for (let i = (heapDemo.length >> 1) - 1; i >= 0; i--) {
  siftDown(heapDemo, i, heapDemo.length);
}
console.log("建大顶堆后:", heapDemo); // [10,5,3,4,1]（堆顶为最大值10）

// --- 优先队列测试 ---
console.log("\n========== 最大堆优先队列 ==========");
const pq = new MaxHeap([3, 1, 4, 1, 5, 9, 2, 6]);
console.log("初始堆顶:", pq.peek()); // 9
console.log("依次出堆:");
while (pq.size > 0) {
  process.stdout.write(pq.pop() + " "); // 9 6 5 4 3 2 1 1
}
console.log("");

// --- 应用：Top K 问题（求第 K 大）---
console.log("\n========== 应用：第 K 大元素 ==========");
function findKthLargest(arr, k) {
  // 用小顶堆维护 size=k，遍历后堆顶即第 K 大
  const heap = new MaxHeap([]); // 这里用最小堆思路更直观
  // 简单实现：排序后取倒数第 k 个
  const sorted = heapSort1(arr);
  return sorted[sorted.length - k];
}
console.log("[3,2,1,5,6,4] 第2大:", findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5
console.log(
  "[3,2,3,1,2,4,5,5,6] 第4大:",
  findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4),
); // 4

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
console.log(`迭代堆排序: ${timed(heapSort1, [...random])}ms`);
console.log(`递归堆排序: ${timed(heapSort2, [...random])}ms`);

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("时间复杂度：恒定 O(n log n)，与数据分布无关");
console.log("空间复杂度：O(1)，原地排序，不稳定");
console.log("优点：时间恒定 + 空间 O(1)，适合内存受限场景");
console.log("缺点：缓存不友好，常数大，实际通常比快排慢");
console.log("应用：Top K 问题、优先队列、流式数据求最值");
