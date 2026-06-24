/**
 * 手写 Array.prototype.sort
 *
 * 作用：原地排序数组，返回排序后的原数组。
 *   - 若提供 compareFn(a, b)：返回值 < 0 则 a 排在 b 前；> 0 则 b 排在 a 前；= 0 顺序不变
 *   - 若不提供 compareFn：把元素转为字符串，按 UTF-16 码点升序排列
 *
 * 实现思路：
 *   1. 默认比较函数：把两元素转字符串后比较码点
 *   2. 使用插入排序（简单直观、稳定，便于演示原理）：
 *        - 从第 2 个元素开始，把它「插入」到前面已排好序部分的正确位置
 *        - 比当前元素大的元素依次后移
 *   3. 返回 this
 *
 * 说明：原生 sort 的算法在不同引擎中不同（V8 用 TimSort），这里用插入排序演示思路。
 */

Array.prototype.mySort = function (compareFn) {
  const len = this.length;

  // 默认比较：转字符串后按 UTF-16 比较
  const defaultCompare = (a, b) => {
    const sa = String(a);
    const sb = String(b);
    if (sa < sb) return -1;
    if (sa > sb) return 1;
    return 0;
  };

  const compare = typeof compareFn === 'function' ? compareFn : defaultCompare;

  // 插入排序
  for (let i = 1; i < len; i++) {
    const current = this[i];
    let j = i - 1;
    // 把比 current 大的元素依次后移
    while (j >= 0 && compare(this[j], current) > 0) {
      this[j + 1] = this[j];
      j--;
    }
    this[j + 1] = current;
  }

  return this;
};

// ===== 测试 =====

// --- 默认排序（按字符串）---
console.log([3, 1, 2].mySort()); // [1, 2, 3]
console.log([10, 2, 1].mySort()); // [1, 10, 2]（默认按字符串，'10' < '2'）

// --- 数值升序 ---
console.log([3, 1, 2, 10, 5].mySort((a, b) => a - b)); // [1, 2, 3, 5, 10]

// --- 数值降序 ---
console.log([3, 1, 2, 10, 5].mySort((a, b) => b - a)); // [10, 5, 3, 2, 1]

// --- 字符串排序 ---
console.log(['banana', 'apple', 'cherry'].mySort()); // ['apple', 'banana', 'cherry']

// --- 字符串按长度排序 ---
console.log(['aaa', 'b', 'cc'].mySort((a, b) => a.length - b.length)); // ['b', 'cc', 'aaa']

// --- 对象数组按属性排序 ---
const users = [
  { name: 'a', age: 30 },
  { name: 'b', age: 20 },
  { name: 'c', age: 25 }
];
users.mySort((x, y) => x.age - y.age);
console.log(users); // [{ name: 'b', age: 20 }, { name: 'c', age: 25 }, { name: 'a', age: 30 }]

// --- 修改原数组并返回自身 ---
const arr = [3, 1, 2];
const ret = arr.mySort((a, b) => a - b);
console.log(arr === ret); // true
console.log(arr); // [1, 2, 3]
