/**
 * 手写优先队列
 *
 * 优先队列中每个元素带有优先级，出队时总是取出优先级最高（数值最小）的元素。
 * 底层基于最小堆实现，入队和出队均为 O(log n)。
 * 本实现支持自定义优先级比较器。
 */

class PriorityQueue {
  constructor(compareFn) {
    // compareFn(a, b) < 0 表示 a 优先级更高
    this.compare = compareFn || ((a, b) => a.priority - b.priority);
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
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

  _siftUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this.compare(this.heap[i], this.heap[p]) < 0) {
        this._swap(i, p);
        i = p;
      } else break;
    }
  }

  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      const l = this._left(i);
      const r = this._right(i);
      let best = i;
      if (l < n && this.compare(this.heap[l], this.heap[best]) < 0) best = l;
      if (r < n && this.compare(this.heap[r], this.heap[best]) < 0) best = r;
      if (best === i) break;
      this._swap(i, best);
      i = best;
    }
  }

  // 入队
  enqueue(element, priority) {
    const node = { element, priority };
    this.heap.push(node);
    this._siftUp(this.heap.length - 1);
    return this;
  }

  // 出队（优先级最高）
  dequeue() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return top.element;
  }

  front() {
    return this.heap.length === 0 ? undefined : this.heap[0].element;
  }
}

// 测试
const pq = new PriorityQueue();
pq.enqueue("普通任务", 3);
pq.enqueue("紧急任务", 1);
pq.enqueue("低优先级任务", 5);
pq.enqueue("较紧急任务", 2);

console.log(pq.dequeue()); // 紧急任务
console.log(pq.dequeue()); // 较紧急任务
console.log(pq.dequeue()); // 普通任务
console.log(pq.dequeue()); // 低优先级任务
console.log(pq.isEmpty()); // true

// 带自定义比较器（按 name 长度优先，短的优先）
const pq2 = new PriorityQueue((a, b) => a.priority.length - b.priority.length);
pq2.enqueue("cat", "cat");
pq2.enqueue("elephant", "elephant");
pq2.enqueue("dog", "dog");
console.log(pq2.dequeue()); // cat (长度3)
console.log(pq2.dequeue()); // dog (长度3)
console.log(pq2.dequeue()); // elephant
