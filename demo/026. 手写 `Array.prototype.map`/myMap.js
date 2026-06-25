/**
 * 手写 Array.prototype.map
 *
 * 作用：遍历数组，对每个元素调用回调函数，把返回值收集成一个新数组返回。
 * 不修改原数组，返回数组长度与原数组相同。
 *
 * 实现思路：
 *   1. 创建一个与原数组等长的新数组
 *   2. 用 for 循环遍历每一个下标，使用 `i in this` 跳过稀疏数组的空位
 *      （原生 map 也不会对空位调用回调，但会保留空位）
 *   3. 回调函数接收三个参数：当前元素、当前索引、原数组
 *   4. 通过 call 调用回调并绑定 thisArg，保证回调内 this 指向正确
 */

Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const result = new Array(this.length);

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }

  return result;
};

// ===== 测试 =====

// --- 基本用法 ---
console.log([1, 2, 3].myMap((x) => x * 2)); // [2, 4, 6]

// --- 使用索引参数 ---
console.log([10, 20, 30].myMap((x, i) => x + i)); // [10, 21, 32]

// --- 使用 thisArg ---
console.log(
  [1, 2, 3].myMap(
    function (x) {
      return x + this.offset;
    },
    { offset: 100 },
  ),
); // [101, 102, 103]

// --- 不修改原数组 ---
const original = [1, 2, 3];
const mapped = original.myMap((x) => x * 2);
console.log(original); // [1, 2, 3]
console.log(mapped); // [2, 4, 6]

// --- 与原生 map 结果对比 ---
console.log(
  JSON.stringify([1, 2, 3].myMap((x) => x * 2)) ===
    JSON.stringify([1, 2, 3].map((x) => x * 2)),
); // true
