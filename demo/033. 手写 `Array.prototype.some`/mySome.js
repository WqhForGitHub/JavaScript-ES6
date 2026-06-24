/**
 * 手写 Array.prototype.some
 *
 * 作用：判断数组中是否「至少有一个元素」使回调返回真值。
 *       一旦遇到一个返回真值的元素，立即返回 true；全部都不满足才返回 false。空数组返回 false。
 *
 * 实现思路：
 *   1. for 循环遍历每个下标，用 `i in this` 跳过稀疏空位
 *   2. 对每个元素调用回调（传入 元素 / 索引 / 原数组），若返回真值立即 return true
 *   3. 全部遍历完未提前返回，则 return false
 */

Array.prototype.mySome = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        return true;
      }
    }
  }

  return false;
};

// ===== 测试 =====

// --- 存在满足 ---
console.log([1, 2, 3].mySome(x => x > 2)); // true

// --- 全部不满足 ---
console.log([1, 2, 3].mySome(x => x > 10)); // false

// --- 空数组返回 false ---
console.log([].mySome(x => x > 0)); // false

// --- 使用索引 ---
console.log([10, 20, 30].mySome((x, i) => i === 2)); // true

// --- 使用 thisArg ---
console.log(
  [1, 2, 3].mySome(function (x) {
    return x === this.target;
  }, { target: 2 })
); // true

// --- 对象数组判断 ---
const users = [{ age: 17 }, { age: 20 }, { age: 16 }];
console.log(users.mySome(u => u.age >= 18)); // true
