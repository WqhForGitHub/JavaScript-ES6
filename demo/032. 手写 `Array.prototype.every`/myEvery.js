/**
 * 手写 Array.prototype.every
 *
 * 作用：判断数组中是否「所有元素」都使回调返回真值。
 *       一旦遇到一个返回假值的元素，立即返回 false；全部满足才返回 true。空数组返回 true。
 *
 * 实现思路：
 *   1. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   2. 对每个元素调用回调（传入 元素 / 索引 / 原数组），若返回假值立即 return false
 *   3. 全部遍历完未提前返回，则 return true
 */

Array.prototype.myEvery = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (!callback.call(thisArg, this[i], i, this)) {
        return false;
      }
    }
  }

  return true;
};

// ===== 测试 =====

// --- 全部满足 ---
console.log([2, 4, 6].myEvery((x) => x % 2 === 0)); // true

// --- 有一个不满足 ---
console.log([2, 4, 5].myEvery((x) => x % 2 === 0)); // false

// --- 空数组返回 true ---
console.log([].myEvery((x) => x > 0)); // true

// --- 使用索引 ---
console.log([10, 20, 30].myEvery((x, i) => x > i)); // true

// --- 使用 thisArg ---
console.log(
  [5, 10, 15].myEvery(
    function (x) {
      return x >= this.min;
    },
    { min: 5 },
  ),
); // true

// --- 对象数组判断 ---
const users = [{ age: 18 }, { age: 20 }, { age: 19 }];
console.log(users.myEvery((u) => u.age >= 18)); // true
