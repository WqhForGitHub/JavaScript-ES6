/**
 * 手写 Array.prototype.indexOf
 *
 * 作用：返回数组中第一个等于 searchElement 的元素下标，找不到返回 -1。
 *       使用严格相等（===）比较，因此找不到 NaN。支持第二个参数 fromIndex 指定起始下标。
 *
 * 实现思路：
 *   1. 处理 fromIndex：缺省为 0；NaN 视为 0；为负数则从末尾向前偏移（len + fromIndex），
 *      结果仍不小于 0
 *   2. for 循环从 fromIndex 遍历到末尾
 *   3. 用 === 比较，命中则返回下标
 */

Array.prototype.myIndexOf = function (searchElement, fromIndex) {
  const len = this.length;
  if (len === 0) return -1;

  let k = Number(fromIndex);
  if (isNaN(k)) {
    k = 0;
  } else if (k > 0) {
    if (k > len) k = len;
  } else if (k < 0) {
    k = len + k;
    if (k < 0) k = 0;
  }

  for (let i = k; i < len; i++) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }

  return -1;
};

// ===== 测试 =====

// --- 基本查找 ---
console.log([1, 2, 3, 2, 1].myIndexOf(2)); // 1
console.log([1, 2, 3].myIndexOf(4)); // -1

// --- 查找字符串 ---
console.log(["a", "b", "c"].myIndexOf("b")); // 1

// --- 严格相等：1 与 '1' 不相等 ---
console.log([1, 2, 3].myIndexOf("1")); // -1

// --- 找不到 NaN（与 includes 的区别）---
console.log([1, NaN, 3].myIndexOf(NaN)); // -1

// --- fromIndex 正数 ---
console.log([1, 2, 3, 1].myIndexOf(1, 1)); // 3
console.log([1, 2, 3].myIndexOf(1, 1)); // -1

// --- fromIndex 负数 ---
console.log([1, 2, 3, 4].myIndexOf(3, -2)); // 2
console.log([1, 2, 3, 4].myIndexOf(2, -2)); // -1

// --- 空数组 ---
console.log([].myIndexOf(1)); // -1
