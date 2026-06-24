/**
 * 手写队列（Queue）
 *
 * 队列是一种先进先出（FIFO, First In First Out）的线性数据结构。
 * 在队尾入队（enqueue），在队头出队（dequeue）。
 * 实现方式：使用对象/数组模拟，使用对象记录头部和尾部索引可保证出队 O(1)。
 */

class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  // 入队
  enqueue(element) {
    this.items[this.tail] = element;
    this.tail++;
    return this;
  }

  // 出队
  dequeue() {
    if (this.isEmpty()) return undefined;
    const element = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return element;
  }

  // 查看队头元素
  front() {
    if (this.isEmpty()) return undefined;
    return this.items[this.head];
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.tail - this.head;
  }

  clear() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  toString() {
    const arr = [];
    for (let i = this.head; i < this.tail; i++) {
      arr.push(this.items[i]);
    }
    return arr.join(',');
  }
}

// 测试
const queue = new Queue();
console.log(queue.isEmpty()); // true

queue.enqueue('a').enqueue('b').enqueue('c');
console.log(queue.size()); // 3
console.log(queue.front()); // a
console.log(queue.toString()); // a,b,c

console.log(queue.dequeue()); // a
console.log(queue.front()); // b
console.log(queue.size()); // 2

// 应用：击鼓传花（约瑟夫环简化版）
function hotPotato(names, num) {
  const q = new Queue();
  names.forEach((n) => q.enqueue(n));
  while (q.size() > 1) {
    for (let i = 0; i < num; i++) {
      q.enqueue(q.dequeue());
    }
    q.dequeue(); // 淘汰
  }
  return q.dequeue(); // 胜者
}

console.log(hotPotato(['Alice', 'Bob', 'Cindy', 'David', 'Eve'], 3)); // David
