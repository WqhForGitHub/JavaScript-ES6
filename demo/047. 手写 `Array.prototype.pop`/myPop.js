/**
 * 手写 Array.prototype.pop
 *
 * 作用：删除数组最后一个元素，返回被删除的元素；空数组返回 undefined 且长度保持 0。原地修改数组。
 *
 * 实现思路：
 *   1. 取当前长度 len，若为 0 直接返回 undefined
 *   2. 取出最后一个元素 this[len - 1]
 *   3. delete 掉该下标属性，再把 this.length 设为 len - 1
 *   4. 返回取出的元素
 */

Array.prototype.myPop = function () {
  const len = this.length;
  if (len === 0) return undefined;

  const last = this[len - 1];

  delete this[len - 1];
  this.length = len - 1;

  return last;
};

// ===== 测试 =====

// --- 基本弹出 ---
const a = [1, 2, 3];
console.log(a.myPop()); // 3
console.log(a); // [1, 2]

// --- 连续弹出 ---
const b = [1, 2];
console.log(b.myPop()); // 2
console.log(b.myPop()); // 1
console.log(b); // []

// --- 空数组 ---
const c = [];
console.log(c.myPop()); // undefined
console.log(c.length); // 0

// --- 弹出对象 ---
const d = [{ x: 1 }, { y: 2 }];
console.log(d.myPop()); // { y: 2 }
console.log(d); // [{ x: 1 }]

// --- 弹出后长度更新 ---
const e = ["a", "b", "c", "d"];
e.myPop();
console.log(e.length); // 3
console.log(e); // ['a', 'b', 'c']
