/**
 * 手写堆（最小堆/最大堆）
 *
 * 堆是一棵完全二叉树，可用数组表示：
 *   节点 i 的父节点为 (i-1)>>1，左子节点为 2i+1，右子节点为 2i+2。
 * 最小堆：父节点 <= 子节点；最大堆：父节点 >= 子节点。
 * 本实现通过比较函数同时支持最小堆和最大堆，核心操作为上浮（siftUp）和下沉（siftDown）。
 */

class Heap {
  constructor(compareFn) {
    // compareFn(a, b) < 0 表示 a 优先级更高（应靠近堆顶）
    this.heap = [];
    this.compare = compareFn || ((a, b) => a - b); // 默认最小堆
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap[0];
  }

  _parent(i) {
    return (i - 1) >> 1;
  }

  _left(i) {
    return 2 * i + 1;
  }

  _right(i) {
    return 2 * i + 2;
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // 上浮
  _siftUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this.compare(this.heap[i], this.heap[p]) < 0) {
        this._swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  // 下沉
  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      const l = this._left(i);
      const r = this._right(i);
      let smallest = i;
      if (l < n && this.compare(this.heap[l], this.heap[smallest]) < 0)
        smallest = l;
      if (r < n && this.compare(this.heap[r], this.heap[smallest]) < 0)
        smallest = r;
      if (smallest === i) break;
      this._swap(i, smallest);
      i = smallest;
    }
  }

  insert(value) {
    this.heap.push(value);
    this._siftUp(this.heap.length - 1);
  }

  extract() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }
}

// 最小堆测试
const minHeap = new Heap((a, b) => a - b);
[5, 3, 8, 1, 9, 2, 7].forEach((v) => minHeap.insert(v));

const sortedAsc = [];
while (!minHeap.isEmpty()) sortedAsc.push(minHeap.extract());
console.log(sortedAsc); // [1, 2, 3, 5, 7, 8, 9]
console.log(minHeap.isEmpty()); // true

// 最大堆测试
const maxHeap = new Heap((a, b) => b - a);
[5, 3, 8, 1, 9, 2, 7].forEach((v) => maxHeap.insert(v));

const sortedDesc = [];
while (!maxHeap.isEmpty()) sortedDesc.push(maxHeap.extract());
console.log(sortedDesc); // [9, 8, 7, 5, 3, 2, 1]

// 堆顶元素测试
const h = new Heap();
h.insert(10);
h.insert(4);
h.insert(15);
console.log(h.peek()); // 4
console.log(h.size()); // 3
