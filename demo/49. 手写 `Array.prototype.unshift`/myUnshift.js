/**
 * 手写 Array.prototype.unshift
 *
 * 作用：把一个或多个元素添加到数组开头，返回数组的新长度。原地修改数组。
 *
 * 实现思路：
 *   1. 记录原长度 len 与参数个数 argCount
 *   2. 把原有元素整体后移 argCount 位（从后往前搬，避免覆盖）
 *   3. 把参数依次写入开头 this[0..argCount-1]
 *   4. 更新 this.length = len + argCount，返回新长度
 */

Array.prototype.myUnshift = function () {
  const len = this.length;
  const argCount = arguments.length;

  // 原有元素后移 argCount 位（从后往前搬，避免覆盖）
  for (let i = len - 1; i >= 0; i--) {
    if (i in this) {
      this[i + argCount] = this[i];
    } else {
      delete this[i + argCount];
    }
  }

  // 写入新元素到开头
  for (let i = 0; i < argCount; i++) {
    this[i] = arguments[i];
  }

  this.length = len + argCount;

  return this.length;
};

// ===== 测试 =====

// --- 添加单个元素 ---
const a = [2, 3];
console.log(a.myUnshift(1)); // 3
console.log(a); // [1, 2, 3]

// --- 添加多个元素 ---
const b = [4, 5];
console.log(b.myUnshift(1, 2, 3)); // 5
console.log(b); // [1, 2, 3, 4, 5]

// --- 不传参数 ---
const c = [1, 2];
console.log(c.myUnshift()); // 2
console.log(c); // [1, 2]

// --- 空数组 ---
const d = [];
console.log(d.myUnshift('a', 'b')); // 2
console.log(d); // ['a', 'b']

// --- 添加对象 ---
const e = [{ b: 2 }];
e.myUnshift({ a: 1 });
console.log(e); // [{ a: 1 }, { b: 2 }]

// --- 添加数组（不展开）---
const f = [3, 4];
f.myUnshift([1, 2]);
console.log(f); // [[1, 2], 3, 4]

// --- 返回值是新长度 ---
const g = [1];
console.log(g.myUnshift(0, -1)); // 3
