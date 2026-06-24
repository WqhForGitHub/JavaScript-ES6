/**
 * 手写 Array.prototype.fill
 *
 * 作用：用固定值 value 填充数组从 start 到 end（不含 end）的区间，返回修改后的原数组。
 *       start 缺省为 0，end 缺省为数组长度；负数会从末尾向前偏移。
 *
 * 实现思路：
 *   1. 规范化 start：缺省为 0；负数则 len + start 且不小于 0；超过 len 则截断为 len
 *   2. 规范化 end：缺省为 len；负数则 len + end 且不小于 0；超过 len 则截断为 len
 *   3. for 循环从 start 到 end，把每个位置赋值为 value
 *   4. 返回 this（修改原数组）
 */

Array.prototype.myFill = function (value, start, end) {
  const len = this.length;

  let s = start === undefined ? 0 : Number(start);
  let e = end === undefined ? len : Number(end);

  if (isNaN(s)) s = 0;
  if (isNaN(e)) e = 0;

  if (s < 0) {
    s = len + s;
    if (s < 0) s = 0;
  } else if (s > len) {
    s = len;
  }

  if (e < 0) {
    e = len + e;
    if (e < 0) e = 0;
  } else if (e > len) {
    e = len;
  }

  for (let i = s; i < e; i++) {
    this[i] = value;
  }

  return this;
};

// ===== 测试 =====

// --- 全部填充 ---
console.log([1, 2, 3].myFill(0)); // [0, 0, 0]

// --- 指定 start ---
console.log([1, 2, 3, 4].myFill(0, 2)); // [1, 2, 0, 0]

// --- 指定 start 和 end ---
console.log([1, 2, 3, 4].myFill(0, 1, 3)); // [1, 0, 0, 4]

// --- 负数 start / end ---
console.log([1, 2, 3, 4, 5].myFill(0, -3, -1)); // [1, 2, 0, 0, 5]

// --- 填充对象（引用相同）---
const filled = new Array(3).myFill({}); // 注意：三个位置引用同一个对象
console.log(filled); // [{}, {}, {}]
filled[0].x = 1;
console.log(filled[1].x); // 1（同一个对象）

// --- 创建并填充 ---
console.log(new Array(5).myFill(7)); // [7, 7, 7, 7, 7]

// --- 修改原数组并返回自身 ---
const arr = [1, 2, 3];
const ret = arr.myFill(9);
console.log(arr === ret); // true
console.log(arr); // [9, 9, 9]
