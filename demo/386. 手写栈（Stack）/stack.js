/**
 * 手写栈（Stack）
 *
 * 栈是一种后进先出（LIFO, Last In First Out）的线性数据结构。
 * 只能在栈顶进行插入（push）和删除（pop）操作。
 * 实现方式：使用数组作为底层存储，仅在数组末尾进行增删，保证 O(1) 的时间复杂度。
 */

class Stack {
  constructor() {
    this.items = [];
  }

  // 入栈
  push(element) {
    this.items.push(element);
    return this;
  }

  // 出栈
  pop() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  // 查看栈顶元素
  peek() {
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
const stack = new Stack();
console.log(stack.isEmpty()); // true

stack.push(1).push(2).push(3);
console.log(stack.size()); // 3
console.log(stack.peek()); // 3
console.log(stack.toString()); // 1,2,3

console.log(stack.pop()); // 3
console.log(stack.peek()); // 2
console.log(stack.size()); // 2

stack.clear();
console.log(stack.isEmpty()); // true

// 应用：判断字符串中的括号是否匹配
function isBalanced(str) {
  const s = new Stack();
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{') {
      s.push(ch);
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (s.pop() !== pairs[ch]) return false;
    }
  }
  return s.isEmpty();
}

console.log(isBalanced('({[]})')); // true
console.log(isBalanced('({[}])')); // false
console.log(isBalanced('(()'));    // false
