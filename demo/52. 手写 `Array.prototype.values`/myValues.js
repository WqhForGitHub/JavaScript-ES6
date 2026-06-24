/**
 * 手写 Array.prototype.values
 *
 * 作用：返回一个数组迭代器，每次 next() 产生数组元素的值。
 *       它实际上就是数组默认的 [Symbol.iterator] 行为。
 *
 * 实现思路：
 *   1. 返回一个迭代器对象，内部维护当前下标 index
 *   2. next()：若 index < length，返回 { value: array[index], done: false } 并 index++
 *             否则返回 { value: undefined, done: true }
 *   3. 实现 [Symbol.iterator]() 返回 this，使该对象本身可被 for...of 消费
 */

Array.prototype.myValues = function () {
  const array = this;
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      }
      return { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
};

// ===== 测试 =====

// --- 用 next() 手动消费 ---
const iter = ['a', 'b', 'c'].myValues();
console.log(iter.next().value); // 'a'
console.log(iter.next().value); // 'b'
console.log(iter.next().value); // 'c'
console.log(iter.next()); // { value: undefined, done: true }

// --- 用 for...of 消费 ---
const out = [];
for (const v of [10, 20, 30].myValues()) {
  out.push(v);
}
console.log(out); // [10, 20, 30]

// --- 数值求和 ---
let sum = 0;
for (const v of [1, 2, 3, 4].myValues()) {
  sum += v;
}
console.log(sum); // 10

// --- 空数组 ---
const empty = [].myValues();
console.log(empty.next()); // { value: undefined, done: true }

// --- 与原生 values 对比结果 ---
const native = [];
for (const v of [1, 2, 3].values()) native.push(v);
const mine = [];
for (const v of [1, 2, 3].myValues()) mine.push(v);
console.log(JSON.stringify(native) === JSON.stringify(mine)); // true
