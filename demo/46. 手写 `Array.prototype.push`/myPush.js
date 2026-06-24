/**
 * 手写 Array.prototype.push
 *
 * 作用：把一个或多个元素追加到数组末尾，返回数组的新长度。原地修改数组。
 *
 * 实现思路：
 *   1. 记录原长度 len 与参数个数
 *   2. 把每个参数依次写入 this[len + i]
 *   3. 显式更新 this.length = len + argCount
 *   4. 返回新长度
 *
 * 注意：本实现不使用内置 push，直接用索引赋值完成。
 */

Array.prototype.myPush = function () {
  const len = this.length;
  const argCount = arguments.length;

  for (let i = 0; i < argCount; i++) {
    this[len + i] = arguments[i];
  }

  this.length = len + argCount;

  return this.length;
};

// ===== 测试 =====

// --- 推入单个元素 ---
const a = [1, 2, 3];
console.log(a.myPush(4)); // 4
console.log(a); // [1, 2, 3, 4]

// --- 推入多个元素 ---
const b = [1];
console.log(b.myPush(2, 3, 4)); // 4
console.log(b); // [1, 2, 3, 4]

// --- 不传参数 ---
const c = [1, 2];
console.log(c.myPush()); // 2
console.log(c); // [1, 2]

// --- 推入对象 ---
const d = [];
d.myPush({ x: 1 }, { y: 2 });
console.log(d); // [{ x: 1 }, { y: 2 }]

// --- 推入数组（不展开）---
const e = [1, 2];
e.myPush([3, 4]);
console.log(e); // [1, 2, [3, 4]]

// --- 空数组推入 ---
const f = [];
console.log(f.myPush('a')); // 1
console.log(f); // ['a']

// --- 返回值是新长度 ---
const g = [1, 2, 3];
console.log(g.myPush(4, 5, 6)); // 6
