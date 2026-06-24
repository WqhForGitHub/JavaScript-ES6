/**
 * 手写 Array.prototype.findIndex
 *
 * 作用：遍历数组，返回第一个使回调返回真值的元素的下标；若都不满足则返回 -1。不修改原数组。
 *
 * 实现思路：
 *   1. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   2. 对每个元素调用回调（传入 元素 / 索引 / 原数组），若返回真值立即返回当前下标 i
 *   3. 遍历结束仍未找到则返回 -1
 */

Array.prototype.myFindIndex = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
  }

  return -1;
};

// ===== 测试 =====

// --- 基本查找 ---
console.log([1, 2, 3, 4].myFindIndex(x => x > 2)); // 2

// --- 查找对象 ---
const users = [
  { name: 'a', age: 17 },
  { name: 'b', age: 20 },
  { name: 'c', age: 18 }
];
console.log(users.myFindIndex(u => u.age >= 18)); // 1

// --- 找不到返回 -1 ---
console.log([1, 2, 3].myFindIndex(x => x > 10)); // -1

// --- 使用索引 ---
console.log([10, 20, 30, 40].myFindIndex((x, i) => i === 2)); // 2

// --- 使用 thisArg ---
console.log(
  [1, 2, 3, 4].myFindIndex(function (x) {
    return x === this.target;
  }, { target: 4 })
); // 3

// --- 只返回第一个匹配项的下标 ---
console.log([1, 2, 3, 2, 1].myFindIndex(x => x === 2)); // 1
