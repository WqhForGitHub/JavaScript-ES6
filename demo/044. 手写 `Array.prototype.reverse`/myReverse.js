/**
 * 手写 Array.prototype.reverse
 *
 * 作用：原地反转数组中的元素顺序，返回修改后的原数组。
 *
 * 实现思路：
 *   1. 用头尾双指针法，只需交换前一半与后一半
 *   2. 循环到中点 Math.floor(len / 2)，每次交换 this[i] 与 this[len - 1 - i]
 *   3. 返回 this（修改原数组）
 */

Array.prototype.myReverse = function () {
  const len = this.length;
  const mid = Math.floor(len / 2);

  for (let i = 0; i < mid; i++) {
    const j = len - 1 - i;
    const temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }

  return this;
};

// ===== 测试 =====

// --- 基本反转 ---
console.log([1, 2, 3].myReverse()); // [3, 2, 1]

// --- 偶数长度 ---
console.log([1, 2, 3, 4].myReverse()); // [4, 3, 2, 1]

// --- 奇数长度（中间元素不动）---
console.log([1, 2, 3, 4, 5].myReverse()); // [5, 4, 3, 2, 1]

// --- 字符串数组 ---
console.log(["a", "b", "c"].myReverse()); // ['c', 'b', 'a']

// --- 空数组 ---
console.log([].myReverse()); // []

// --- 单元素 ---
console.log([1].myReverse()); // [1]

// --- 修改原数组并返回自身 ---
const arr = [1, 2, 3];
const ret = arr.myReverse();
console.log(arr === ret); // true
console.log(arr); // [3, 2, 1]
