/**
 * 手写 Array.prototype.entries
 *
 * 作用：返回一个数组迭代器（Array Iterator），每次 next() 产生一个 [index, value] 形式的数组。
 *
 * 实现思路：
 *   1. 返回一个迭代器对象，内部维护当前下标 index
 *   2. next()：若 index < length，返回 { value: [index, array[index]], done: false } 并 index++
 *             否则返回 { value: undefined, done: true }
 *   3. 实现 [Symbol.iterator]() 返回 this，使该对象本身可被 for...of 消费
 */

Array.prototype.myEntries = function () {
  const array = this;
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { value: [index, array[index++]], done: false };
      }
      return { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
};

// ===== 测试 =====

// --- 用 next() 手动消费 ---
const iter1 = ["a", "b", "c"].myEntries();
console.log(iter1.next().value); // [0, 'a']
console.log(iter1.next().value); // [1, 'b']
console.log(iter1.next().value); // [2, 'c']
console.log(iter1.next()); // { value: undefined, done: true }

// --- 用 for...of 消费 ---
const out1 = [];
for (const entry of ["x", "y", "z"].myEntries()) {
  out1.push(entry);
}
console.log(out1); // [[0, 'x'], [1, 'y'], [2, 'z']]

// --- 解构使用索引和值 ---
const out2 = [];
for (const [i, v] of [10, 20, 30].myEntries()) {
  out2.push(i + ":" + v);
}
console.log(out2); // ['0:10', '1:20', '2:30']

// --- 空数组 ---
const empty = [].myEntries();
console.log(empty.next()); // { value: undefined, done: true }

// --- 与原生 entries 对比结果 ---
const native = [];
for (const e of [1, 2, 3].entries()) native.push(e);
const mine = [];
for (const e of [1, 2, 3].myEntries()) mine.push(e);
console.log(JSON.stringify(native) === JSON.stringify(mine)); // true
