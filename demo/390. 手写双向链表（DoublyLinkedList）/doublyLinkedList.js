/**
 * 手写双向链表（DoublyLinkedList）
 *
 * 双向链表的每个节点同时保存指向前驱（prev）和后继（next）的指针。
 * 优点：可以双向遍历，删除节点时无需从头查找前驱，操作更灵活。
 * 维护 head（头）和 tail（尾）指针，使头尾操作均 O(1)。
 */

class DoublyNode {
  constructor(element) {
    this.element = element;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  append(element) {
    const node = new DoublyNode(element);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.count++;
    return this;
  }

  insert(position, element) {
    if (position < 0 || position > this.count) return false;
    const node = new DoublyNode(element);
    if (position === 0) {
      if (this.head === null) {
        this.head = node;
        this.tail = node;
      } else {
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
      }
    } else if (position === this.count) {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    } else {
      let current = this.head;
      for (let i = 0; i < position; i++) {
        current = current.next;
      }
      const prev = current.prev;
      node.next = current;
      node.prev = prev;
      prev.next = node;
      current.prev = node;
    }
    this.count++;
    return true;
  }

  removeAt(position) {
    if (position < 0 || position >= this.count) return undefined;
    let current = this.head;
    if (position === 0) {
      this.head = this.head.next;
      if (this.head === null) {
        this.tail = null;
      } else {
        this.head.prev = null;
      }
    } else if (position === this.count - 1) {
      current = this.tail;
      this.tail = this.tail.prev;
      this.tail.next = null;
    } else {
      for (let i = 0; i < position; i++) {
        current = current.next;
      }
      const prev = current.prev;
      const next = current.next;
      prev.next = next;
      next.prev = prev;
    }
    this.count--;
    return current.element;
  }

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
    return this.removeAt(this.indexOf(element));
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
    return arr.join(" <-> ");
  }

  // 反向遍历输出
  toStringReverse() {
    const arr = [];
    let current = this.tail;
    while (current !== null) {
      arr.push(current.element);
      current = current.prev;
    }
    return arr.join(" <-> ");
  }
}

// 测试
const dll = new DoublyLinkedList();
dll.append(1).append(2).append(3);
console.log(dll.toString()); // 1 <-> 2 <-> 3
console.log(dll.toStringReverse()); // 3 <-> 2 <-> 1

dll.insert(1, "x");
console.log(dll.toString()); // 1 <-> x <-> 2 <-> 3

console.log(dll.removeAt(0)); // 1
console.log(dll.toString()); // x <-> 2 <-> 3

dll.remove(3);
console.log(dll.toString()); // x <-> 2
console.log(dll.size()); // 2
