/**
 * 手写 Array.prototype.shift
 *
 * 作用：删除数组第一个元素，返回被删除的元素；空数组返回 undefined 且长度保持 0。原地修改数组。
 *
 * 实现思路：
 *   1. 取当前长度 len，若为 0 直接返回 undefined
 *   2. 取出第一个元素 this[0]
 *   3. 从下标 1 开始，把每个元素前移一位（this[i - 1] = this[i]），用 `i in this` 处理空位
 *   4. 删除最后一个位置，并把 this.length 设为 len - 1
 *   5. 返回取出的元素
 */

Array.prototype.myShift = function () {
  const len = this.length;
  if (len === 0) return undefined;

  const first = this[0];

  // 所有元素前移一位
  for (let i = 1; i < len; i++) {
    if (i in this) {
      this[i - 1] = this[i];
    } else {
      delete this[i - 1];
    }
  }

  // 删除最后一个位置并缩短长度
  delete this[len - 1];
  this.length = len - 1;

  return first;
};

// ===== 测试 =====

// --- 基本移除 ---
const a = [1, 2, 3];
console.log(a.myShift()); // 1
console.log(a); // [2, 3]

// --- 连续移除 ---
const b = [1, 2, 3];
console.log(b.myShift()); // 1
console.log(b.myShift()); // 2
console.log(b); // [3]

// --- 空数组 ---
const c = [];
console.log(c.myShift()); // undefined
console.log(c.length); // 0

// --- 单元素 ---
const d = [42];
console.log(d.myShift()); // 42
console.log(d); // []

// --- 移除对象 ---
const e = [{ a: 1 }, { b: 2 }];
console.log(e.myShift()); // { a: 1 }
console.log(e); // [{ b: 2 }]

// --- 移除后长度更新 ---
const f = ["a", "b", "c", "d"];
f.myShift();
console.log(f.length); // 3
console.log(f); // ['b', 'c', 'd']
