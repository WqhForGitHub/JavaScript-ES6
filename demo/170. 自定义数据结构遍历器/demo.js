// 170. 自定义数据结构遍历器

class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  *[Symbol.iterator]() {
    for (let i = this.items.length - 1; i >= 0; i--) yield this.items[i];
  }
}
const stack = new Stack();
stack.push("first");
stack.push("second");
console.log([...stack]);
