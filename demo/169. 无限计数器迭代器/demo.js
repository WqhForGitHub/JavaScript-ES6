// 169. 无限计数器迭代器

const counter = {
  [Symbol.iterator]() {
    let n = 0;
    return { next: () => ({ value: n++, done: false }) };
  },
};
const it = counter[Symbol.iterator]();
console.log(it.next().value, it.next().value, it.next().value);
