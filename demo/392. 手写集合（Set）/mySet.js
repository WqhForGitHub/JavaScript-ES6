/**
 * 手写集合（Set）
 *
 * 集合是一种无序且唯一的数据结构。本实现使用对象作为底层存储，
 * 保证元素唯一性并支持集合运算（并集、交集、差集、子集判断）。
 * 使用 Object.create(null) 避免原型链属性干扰。
 */

class MySet {
  constructor(iterable) {
    this.items = Object.create(null);
    if (iterable) {
      for (const item of iterable) {
        this.add(item);
      }
    }
  }

  add(value) {
    if (!this.has(value)) {
      this.items[value] = value;
    }
    return this;
  }

  has(value) {
    return this.items[value] !== undefined;
  }

  delete(value) {
    if (this.has(value)) {
      delete this.items[value];
      return true;
    }
    return false;
  }

  clear() {
    this.items = Object.create(null);
  }

  get size() {
    return Object.keys(this.items).length;
  }

  values() {
    return Object.values(this.items);
  }

  // 并集
  union(otherSet) {
    const result = new MySet();
    this.values().forEach((v) => result.add(v));
    otherSet.values().forEach((v) => result.add(v));
    return result;
  }

  // 交集
  intersection(otherSet) {
    const result = new MySet();
    this.values().forEach((v) => {
      if (otherSet.has(v)) result.add(v);
    });
    return result;
  }

  // 差集
  difference(otherSet) {
    const result = new MySet();
    this.values().forEach((v) => {
      if (!otherSet.has(v)) result.add(v);
    });
    return result;
  }

  // 是否子集
  isSubsetOf(otherSet) {
    return this.values().every((v) => otherSet.has(v));
  }

  toString() {
    return "{" + this.values().join(", ") + "}";
  }
}

// 测试
const setA = new MySet([1, 2, 3, 4]);
const setB = new MySet([3, 4, 5, 6]);

console.log(setA.has(2)); // true
console.log(setA.size); // 4

setA.add(5);
console.log(setA.toString()); // {1, 2, 3, 4, 5}

console.log(setA.union(setB).toString()); // {1, 2, 3, 4, 5, 6}
console.log(setA.intersection(setB).toString()); // {3, 4, 5}
console.log(setA.difference(setB).toString()); // {1, 2}

const setC = new MySet([3, 4]);
console.log(setC.isSubsetOf(setB)); // true
console.log(setC.isSubsetOf(setA)); // true

setA.delete(1);
console.log(setA.has(1)); // false
