/**
 * 手写 Array.prototype.forEach
 *
 * 作用：遍历数组，对每个元素执行一次回调，没有返回值（返回 undefined），不修改原数组
 *       （回调本身可能修改原数组）。
 *
 * 实现思路：
 *   1. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   2. 通过 call 调用回调并绑定 thisArg，传入 元素 / 索引 / 原数组
 *   3. 返回 undefined
 */

Array.prototype.myForEach = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }

  return undefined;
};

// ===== 测试 =====

// --- 基本遍历 ---
const logs = [];
[1, 2, 3].myForEach((x) => logs.push(x));
console.log(logs); // [1, 2, 3]

// --- 使用索引和原数组 ---
const out = [];
["a", "b", "c"].myForEach((v, i, arr) =>
  out.push(i + ":" + v + "/" + arr.length),
);
console.log(out); // ['0:a/3', '1:b/3', '2:c/3']

// --- 使用 thisArg ---
const ctx = { sum: 0 };
[1, 2, 3, 4].myForEach(function (x) {
  this.sum += x;
}, ctx);
console.log(ctx.sum); // 10

// --- 返回值为 undefined ---
console.log([1, 2, 3].myForEach((x) => x)); // undefined

// --- 回调中修改原数组（这是回调的副作用，非 forEach 主动修改）---
const arr = [1, 2, 3];
arr.myForEach((x, i) => {
  arr[i] = x * 10;
});
console.log(arr); // [10, 20, 30]
