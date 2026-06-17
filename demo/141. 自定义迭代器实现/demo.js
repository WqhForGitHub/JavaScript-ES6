// 141. 自定义迭代器实现

const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let n = this.from;
    return {
      next: () => (n <= this.to ? { value: n++, done: false } : { done: true }),
    };
  },
};
console.log([...range]);
