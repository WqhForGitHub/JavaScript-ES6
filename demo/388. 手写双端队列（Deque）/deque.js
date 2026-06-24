/**
 * 手写双端队列（Deque）
 *
 * 双端队列（Double-Ended Queue）允许在队列两端都进行插入和删除操作。
 * 它结合了栈和队列的特性，可以当作栈或队列使用。
 * 实现方式：使用数组存储，提供 addFront / addBack / removeFront / removeBack 方法。
 */

class Deque {
  constructor() {
    this.items = [];
  }

  // 在队尾添加
  addBack(element) {
    this.items.push(element);
    return this;
  }

  // 在队头添加
  addFront(element) {
    this.items.unshift(element);
    return this;
  }

  // 从队头移除
  removeFront() {
    if (this.isEmpty()) return undefined;
    return this.items.shift();
  }

  // 从队尾移除
  removeBack() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  // 查看队头
  peekFront() {
    if (this.isEmpty()) return undefined;
    return this.items[0];
  }

  // 查看队尾
  peekBack() {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toString() {
    return this.items.join(',');
  }
}

// 测试
const deque = new Deque();
console.log(deque.isEmpty()); // true

deque.addBack('a').addBack('b');
deque.addFront('c');
console.log(deque.toString()); // c,a,b
console.log(deque.peekFront()); // c
console.log(deque.peekBack()); // b

console.log(deque.removeFront()); // c
console.log(deque.removeBack()); // b
console.log(deque.size()); // 1

// 应用：回文串判断
function isPalindrome(str) {
  const d = new Deque();
  for (const ch of str.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) d.addBack(ch);
  }
  while (d.size() > 1) {
    if (d.removeFront() !== d.removeBack()) return false;
  }
  return true;
}

console.log(isPalindrome('A man a plan a canal Panama')); // true
console.log(isPalindrome('racecar')); // true
console.log(isPalindrome('hello')); // false
