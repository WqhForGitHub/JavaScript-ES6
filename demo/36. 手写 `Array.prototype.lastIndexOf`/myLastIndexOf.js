/**
 * 手写 Array.prototype.lastIndexOf
 *
 * 作用：从后向前查找，返回数组中最后一个等于 searchElement 的元素下标，找不到返回 -1。
 *       使用严格相等（===）比较。支持第二个参数 fromIndex 指定起始下标（从该位置向前找）。
 *
 * 实现思路：
 *   1. 处理 fromIndex：
 *      - 缺省或 NaN：从末尾（len - 1）开始
 *      - >= 0：取 min(fromIndex, len - 1)
 *      - < 0：从末尾向前偏移（len + fromIndex），若仍 < 0 则直接返回 -1
 *   2. for 循环从起始下标向前（i--）遍历到 0
 *   3. 用 === 比较，命中则返回下标
 */

Array.prototype.myLastIndexOf = function (searchElement, fromIndex) {
  const len = this.length;
  if (len === 0) return -1;

  let k;
  if (arguments.length < 2) {
    k = len - 1;
  } else {
    k = Number(fromIndex);
    if (isNaN(k)) {
      k = len - 1;
    } else if (k >= 0) {
      k = Math.min(k, len - 1);
    } else {
      k = len + k;
      if (k < 0) return -1;
    }
  }

  for (let i = k; i >= 0; i--) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }

  return -1;
};

// ===== 测试 =====

// --- 基本查找（返回最后一个匹配）---
console.log([1, 2, 3, 2, 1].myLastIndexOf(2)); // 3
console.log([1, 2, 3].myLastIndexOf(4)); // -1

// --- 查找字符串 ---
console.log(['a', 'b', 'a', 'c'].myLastIndexOf('a')); // 2

// --- 严格相等 ---
console.log([1, 2, 3].myLastIndexOf('1')); // -1

// --- fromIndex 正数：从该位置向前找 ---
console.log([1, 2, 3, 2, 1].myLastIndexOf(2, 2)); // 1（只在下标 2 及之前找）
console.log([1, 2, 3, 2, 1].myLastIndexOf(2, 3)); // 3

// --- fromIndex 负数：从末尾向前偏移 ---
console.log([1, 2, 3, 4, 5].myLastIndexOf(4, -1)); // 3
console.log([1, 2, 3, 4, 5].myLastIndexOf(4, -2)); // 3（从下标 3 开始向前找）
console.log([1, 2, 3, 4, 5].myLastIndexOf(4, -3)); // -1（从下标 2 开始向前找，找不到 4）

// --- 空数组 ---
console.log([].myLastIndexOf(1)); // -1
