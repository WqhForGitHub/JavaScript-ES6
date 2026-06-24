/**
 * 手写 Array.prototype.filter
 *
 * 作用：遍历数组，把回调返回真值的元素收集成一个新数组返回，不修改原数组。
 *
 * 实现思路：
 *   1. 创建空结果数组
 *   2. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   3. 对每个元素调用回调（传入 元素 / 索引 / 原数组），若返回真值则追加到结果
 *   4. 通过 call 绑定 thisArg
 */

Array.prototype.myFilter = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        result[result.length] = this[i];
      }
    }
  }

  return result;
};

// ===== 测试 =====

// --- 基本用法 ---
console.log([1, 2, 3, 4, 5].myFilter(x => x > 2)); // [3, 4, 5]

// --- 过滤偶数 ---
console.log([1, 2, 3, 4, 5, 6].myFilter(x => x % 2 === 0)); // [2, 4, 6]

// --- 使用索引 ---
console.log([10, 20, 30, 40].myFilter((x, i) => i % 2 === 0)); // [10, 30]

// --- 使用 thisArg ---
console.log(
  [1, 2, 3, 4].myFilter(function (x) {
    return x > this.min;
  }, { min: 2 })
); // [3, 4]

// --- 过滤对象数组 ---
const users = [
  { name: 'a', age: 17 },
  { name: 'b', age: 20 },
  { name: 'c', age: 18 }
];
console.log(users.myFilter(u => u.age >= 18)); // [{ name: 'b', age: 20 }, { name: 'c', age: 18 }]

// --- 不修改原数组 ---
const original = [1, 2, 3];
original.myFilter(x => x > 1);
console.log(original); // [1, 2, 3]
