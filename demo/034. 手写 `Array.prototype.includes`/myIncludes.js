/**
 * 手写 Array.prototype.includes
 *
 * 作用：判断数组中是否包含某个值，返回 boolean。支持第二个参数 fromIndex 指定起始下标。
 *
 * 与 indexOf 的区别：includes 使用 SameValueZero 算法比较，因此可以找到 NaN；
 *                    而 indexOf 使用 ===，找不到 NaN。
 *
 * 实现思路：
 *   1. 处理 fromIndex：缺省为 0；为负数则从末尾向前偏移（len + fromIndex），但仍不小于 0
 *   2. for 循环从 fromIndex 遍历到末尾
 *   3. 用 SameValueZero 比较：严格相等，或两者都是 NaN（x !== x && y !== y）
 */

Array.prototype.myIncludes = function (searchElement, fromIndex) {
  const len = this.length;
  if (len === 0) return false;

  let k = Number(fromIndex);
  if (isNaN(k)) {
    k = 0;
  } else if (k < 0) {
    k = len + k;
    if (k < 0) k = 0;
  }

  for (let i = k; i < len; i++) {
    if (i in this) {
      const current = this[i];
      // SameValueZero：与 === 相同，但 NaN === NaN 视为 true
      if (
        current === searchElement ||
        (current !== current && searchElement !== searchElement)
      ) {
        return true;
      }
    }
  }

  return false;
};

// ===== 测试 =====

// --- 基本判断 ---
console.log([1, 2, 3].myIncludes(2)); // true
console.log([1, 2, 3].myIncludes(4)); // false

// --- 判断字符串 ---
console.log(["a", "b", "c"].myIncludes("b")); // true

// --- 判断 NaN（includes 能找到，indexOf 找不到）---
console.log([1, NaN, 3].myIncludes(NaN)); // true

// --- 判断 +0 / -0 视为相等 ---
console.log([0].myIncludes(-0)); // true

// --- fromIndex 正数 ---
console.log([1, 2, 3, 1].myIncludes(1, 1)); // true（从下标 1 开始还能找到末尾的 1）
console.log([1, 2, 3].myIncludes(1, 1)); // false（从下标 1 开始找不到 1）

// --- fromIndex 负数 ---
console.log([1, 2, 3, 4].myIncludes(3, -2)); // true（从倒数第 2 个开始）
console.log([1, 2, 3, 4].myIncludes(2, -2)); // false

// --- 空数组 ---
console.log([].myIncludes(1)); // false
