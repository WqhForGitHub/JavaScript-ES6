/**
 * 手写链表（LinkedList）
 *
 * 单向链表由一系列节点组成，每个节点包含数据域和指向下一个节点的指针（next）。
 * 头节点 head 指向链表起点，尾节点的 next 为 null。
 * 优点：插入/删除节点（已知位置）O(1)；缺点：随机访问 O(n)。
 */

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.count = 0;
  }

  // 在末尾添加
  append(element) {
    const node = new Node(element);
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = node;
    }
    this.count++;
    return this;
  }

  // 在指定位置插入
  insert(position, element) {
    if (position < 0 || position > this.count) return false;
    const node = new Node(element);
    if (position === 0) {
      node.next = this.head;
      this.head = node;
    } else {
      let prev = this.head;
      for (let i = 0; i < position - 1; i++) {
        prev = prev.next;
      }
      node.next = prev.next;
      prev.next = node;
    }
    this.count++;
    return true;
  }

  // 移除指定位置元素
  removeAt(position) {
    if (position < 0 || position >= this.count) return undefined;
    let current = this.head;
    if (position === 0) {
      this.head = current.next;
    } else {
      let prev = null;
      for (let i = 0; i < position; i++) {
        prev = current;
        current = current.next;
      }
      prev.next = current.next;
    }
    this.count--;
    return current.element;
  }

  // 查找元素索引
  indexOf(element) {
    let current = this.head;
    let index = 0;
    while (current !== null) {
      if (current.element === element) return index;
      current = current.next;
      index++;
    }
    return -1;
  }

  remove(element) {
    const index = this.indexOf(element);
    return this.removeAt(index);
  }

  getHead() {
    return this.head;
  }

  size() {
    return this.count;
  }

  isEmpty() {
    return this.count === 0;
  }

  toString() {
    const arr = [];
    let current = this.head;
    while (current !== null) {
      arr.push(current.element);
      current = current.next;
    }
    return arr.join(" -> ");
  }
}

// 测试
const list = new LinkedList();
list.append(1).append(2).append(3);
console.log(list.toString()); // 1 -> 2 -> 3
console.log(list.size()); // 3

list.insert(1, "x");
console.log(list.toString()); // 1 -> x -> 2 -> 3

console.log(list.indexOf("x")); // 1
console.log(list.removeAt(1)); // x
console.log(list.toString()); // 1 -> 2 -> 3

list.remove(2);
console.log(list.toString()); // 1 -> 3
console.log(list.isEmpty()); // false
