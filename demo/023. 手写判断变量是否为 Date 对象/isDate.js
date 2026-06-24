/**
 * 手写判断变量是否为 Date 对象
 *
 * 判定方式：
 *   1. instanceof Date（同一 realm 内有效）
 *   2. Object.prototype.toString："[object Date]"（跨 realm 兼容）
 *
 * 注意区分：
 *   - new Date()       -> Date 对象
 *   - Date.now()       -> number（时间戳）
 *   - Date()           -> string（当前时间字符串）
 *   - new Date("invalid") -> Invalid Date（仍是 Date 对象，但 getTime() 为 NaN）
 *
 * 实现思路：
 *   - 排除 null/非对象
 *   - 用 toString 检查标签（最可靠）
 */

function isDate(value) {
  // 1. null / 非对象排除
  if (value === null || typeof value !== "object") {
    return false;
  }

  // 2. 用 Object.prototype.toString 精确判断
  return Object.prototype.toString.call(value) === "[object Date]";
}

// 辅助函数：判断是否为有效 Date（非 Invalid Date）
function isValidDate(value) {
  if (!isDate(value)) {
    return false;
  }
  // Invalid Date 的 getTime() 返回 NaN
  return !Number.isNaN(value.getTime());
}

// ===== 测试 =====

// --- Date 对象 ---
console.log(isDate(new Date())); // true
console.log(isDate(new Date("2024-01-01"))); // true
console.log(isDate(new Date(1700000000000))); // true

// --- Invalid Date（仍是 Date 对象）---
console.log(isDate(new Date("invalid"))); // true
console.log(isValidDate(new Date("invalid"))); // false

// --- Date.now() / Date() 不是对象 ---
console.log(isDate(Date.now())); // false（number）
console.log(isDate(Date())); // false（string）

// --- 其他对象 ---
console.log(isDate({})); // false
console.log(isDate([])); // false
console.log(isDate(/regex/)); // false
console.log(isDate(new Map())); // false
console.log(isDate(new Set())); // false
console.log(isDate(new Error())); // false

// --- 非对象 ---
console.log(isDate(null)); // false
console.log(isDate(undefined)); // false
console.log(isDate(123)); // false
console.log(isDate("2024-01-01")); // false（字符串不是 Date 对象）
console.log(isDate(true)); // false
console.log(isDate(Symbol("s"))); // false
console.log(isDate(1700000000000)); // false（时间戳是 number）

// --- Date 子类 ---
class MyDate extends Date {}
console.log(isDate(new MyDate())); // true
console.log(isValidDate(new MyDate())); // true

// --- 伪造 toStringTag（极少见，但 toString 会返回 [object Date]）---
const fakeDate = { [Symbol.toStringTag]: "Date" };
console.log(isDate(fakeDate)); // true（toString 标签匹配）
