/**
 * 手写循环链表（CircularLinkedList）
 *
 * 循环链表与单向链表类似，区别在于尾节点的 next 指回头节点 head，形成环形结构。
 * 优点：从任意节点出发都能遍历整个链表，适合轮询调度等场景。
 * 实现方式：维护 head 指针，append 时让尾节点指向 head。
 */

class Node {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
    this.count = 0;
  }

  append(element) {
    const node = new Node(element);
    if (this.head === null) {
      this.head = node;
      node.next = this.head; // 指向自己
    } else {
      let current = this.head;
      while (current.next !== this.head) {
        current = current.next;
      }
      current.next = node;
      node.next = this.head;
    }
    this.count++;
    return this;
  }

  insert(position, element) {
    if (position < 0 || position > this.count) return false;
    const node = new Node(element);
    if (position === 0) {
      if (this.head === null) {
        this.head = node;
        node.next = this.head;
      } else {
        // 找到尾节点
        let tail = this.head;
        while (tail.next !== this.head) {
          tail = tail.next;
        }
        node.next = this.head;
        tail.next = node;
        this.head = node;
      }
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

  removeAt(position) {
    if (position < 0 || position >= this.count) return undefined;
    let current = this.head;
    if (position === 0) {
      if (this.count === 1) {
        this.head = null;
      } else {
        let tail = this.head;
        while (tail.next !== this.head) {
          tail = tail.next;
        }
        this.head = this.head.next;
        tail.next = this.head;
      }
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

  indexOf(element) {
    if (this.head === null) return -1;
    let current = this.head;
    for (let i = 0; i < this.count; i++) {
      if (current.element === element) return i;
      current = current.next;
    }
    return -1;
  }

  size() {
    return this.count;
  }

  isEmpty() {
    return this.count === 0;
  }

  toString() {
    if (this.head === null) return "";
    const arr = [];
    let current = this.head;
    do {
      arr.push(current.element);
      current = current.next;
    } while (current !== this.head);
    return arr.join(" -> ") + " -> (head)";
  }
}

// 测试
const cll = new CircularLinkedList();
cll.append(1).append(2).append(3).append(4);
console.log(cll.toString()); // 1 -> 2 -> 3 -> 4 -> (head)
console.log(cll.size()); // 4

cll.insert(0, "a");
console.log(cll.toString()); // a -> 1 -> 2 -> 3 -> 4 -> (head)

console.log(cll.removeAt(0)); // a
console.log(cll.toString()); // 1 -> 2 -> 3 -> 4 -> (head)

console.log(cll.indexOf(3)); // 2

// 应用：约瑟夫环问题
// n 个人围成一圈，从第 1 个人开始报数，报到 m 的人出列，求最后剩下的人
function josephus(n, m) {
  const list = new CircularLinkedList();
  for (let i = 1; i <= n; i++) list.append(i);
  let current = list.head;
  while (list.size() > 1) {
    // 报数 m-1 次后，current 指向要出列的人的前一个
    for (let i = 1; i < m - 1; i++) {
      current = current.next;
    }
    // 移除下一个人
    const idx = list.indexOf(current.next.element);
    list.removeAt(idx);
    current = current.next;
  }
  return list.head.element;
}

console.log(josephus(5, 3)); // 4
