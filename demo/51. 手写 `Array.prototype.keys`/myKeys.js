/**
 * 手写 Array.prototype.keys
 *
 * 作用：返回一个数组迭代器，每次 next() 产生数组元素的下标（key）。
 *
 * 实现思路：
 *   1. 返回一个迭代器对象，内部维护当前下标 index
 *   2. next()：若 index < length，返回 { value: index, done: false } 并 index++
 *             否则返回 { value: undefined, done: true }
 *   3. 实现 [Symbol.iterator]() 返回 this，使该对象本身可被 for...of 消费
 */

Array.prototype.myKeys = function () {
  const array = this;
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { value: index++, done: false };
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
const iter = ['a', 'b', 'c'].myKeys();
console.log(iter.next().value); // 0
console.log(iter.next().value); // 1
console.log(iter.next().value); // 2
console.log(iter.next()); // { value: undefined, done: true }

// --- 用 for...of 消费 ---
const out = [];
for (const k of [10, 20, 30].myKeys()) {
  out.push(k);
}
console.log(out); // [0, 1, 2]

// --- 配合下标取值 ---
const arr = ['x', 'y', 'z'];
const collected = [];
for (const i of arr.myKeys()) {
  collected.push(arr[i]);
}
console.log(collected); // ['x', 'y', 'z']

// --- 空数组 ---
const empty = [].myKeys();
console.log(empty.next()); // { value: undefined, done: true }

// --- 与原生 keys 对比结果 ---
const native = [];
for (const k of [1, 2, 3].keys()) native.push(k);
const mine = [];
for (const k of [1, 2, 3].myKeys()) mine.push(k);
console.log(JSON.stringify(native) === JSON.stringify(mine)); // true
