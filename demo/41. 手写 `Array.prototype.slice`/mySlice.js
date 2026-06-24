/**
 * 手写 Array.prototype.slice
 *
 * 作用：返回从 start 到 end（不含 end）之间的元素组成的新数组，不修改原数组。
 *       start 缺省为 0，end 缺省为数组长度；负数会从末尾向前偏移。
 *
 * 实现思路：
 *   1. 规范化 start：缺省为 0；负数则 len + start 且不小于 0；超过 len 则截断为 len
 *   2. 规范化 end：缺省为 len；负数则 len + end 且不小于 0；超过 len 则截断为 len
 *   3. 若 start >= end，直接返回空数组
 *   4. for 循环从 start 到 end，逐个追加到结果数组（保留空位）
 */

Array.prototype.mySlice = function (start, end) {
  const len = this.length;
  const result = [];

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
    if (i in this) {
      result[result.length] = this[i];
    } else {
      // 保留空位
      result.length++;
    }
  }

  return result;
};

// ===== 测试 =====

// --- 基本截取 ---
console.log([1, 2, 3, 4, 5].mySlice(1, 3)); // [2, 3]

// --- 只传 start ---
console.log([1, 2, 3, 4, 5].mySlice(2)); // [3, 4, 5]

// --- 不传参数：浅拷贝 ---
const original = [1, 2, 3];
const copy = original.mySlice();
console.log(copy); // [1, 2, 3]
console.log(copy === original); // false

// --- 负数参数 ---
console.log([1, 2, 3, 4, 5].mySlice(-2)); // [4, 5]
console.log([1, 2, 3, 4, 5].mySlice(-3, -1)); // [3, 4]

// --- start >= end 返回空数组 ---
console.log([1, 2, 3].mySlice(2, 1)); // []

// --- 超出范围自动截断 ---
console.log([1, 2, 3].mySlice(1, 10)); // [2, 3]
console.log([1, 2, 3].mySlice(-10, 2)); // [1, 2]

// --- 不修改原数组 ---
const arr = [1, 2, 3, 4];
arr.mySlice(1, 3);
console.log(arr); // [1, 2, 3, 4]

// --- 浅拷贝：元素是引用类型时共享 ---
const nested = [{ a: 1 }];
const sliced = nested.mySlice();
sliced[0].a = 2;
console.log(nested[0].a); // 2
