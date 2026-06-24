/**
 * 手写 Object.is 实现
 *
 * Object.is 与 === 的区别：
 *   - === 判断 NaN === NaN 为 false，Object.is 为 true
 *   - === 判断 -0 === +0 为 true，Object.is 为 false
 *
 * 实现思路：
 *   1. 先用 === 比较，绝大多数情况已经正确
 *   2. 单独处理 +0 / -0：当两者都为 0 且符号不同时返回 false
 *      利用 1 / x：1 / -0 === -Infinity，1 / +0 === Infinity
 *   3. 单独处理 NaN：NaN 不等于自身，用 x !== x 判断
 */

function objectIs(x, y) {
  // 1. 先用严格相等
  if (x === y) {
    // 处理 +0 / -0：当 x、y 都为 0 时，需进一步区分符号
    // x !== 0 表示非 0，直接返回 true
    // 1 / x !== 1 / y 用来区分 +0 与 -0
    return x !== 0 || 1 / x === 1 / y;
  }

  // 2. 处理 NaN：NaN 是唯一一个 自身 !== 自身 的值
  //    同时要求 y 也是 NaN
  return x !== x && y !== y;
}

// ===== 测试 =====

// --- 普通相等 ---
console.log(objectIs(1, 1)); // true
console.log(objectIs("a", "a")); // true
console.log(objectIs(true, true)); // true
console.log(objectIs(null, null)); // true
console.log(objectIs(undefined, undefined)); // true

// --- 引用类型（引用相同才相等）---
const obj = {};
console.log(objectIs(obj, obj)); // true
console.log(objectIs({}, {})); // false

// --- NaN（与 === 的关键区别之一）---
console.log(objectIs(NaN, NaN)); // true（原生 === 返回 false）

// --- +0 与 -0（与 === 的关键区别之二）---
console.log(objectIs(0, -0)); // false（原生 === 返回 true）
console.log(objectIs(-0, -0)); // true
console.log(objectIs(+0, +0)); // true

// --- 不同类型 ---
console.log(objectIs(1, "1")); // false
console.log(objectIs(null, undefined)); // false
console.log(objectIs(0, false)); // false

// --- 与原生 Object.is 对比验证 ---
console.log(objectIs(NaN, NaN) === Object.is(NaN, NaN)); // true
console.log(objectIs(0, -0) === Object.is(0, -0)); // true
console.log(objectIs(1, 1) === Object.is(1, 1)); // true
