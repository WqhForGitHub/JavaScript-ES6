/**
 * 手写判断变量是否为正则表达式对象
 *
 * 判定方式：
 *   1. instanceof RegExp（同一 realm 内有效）
 *   2. Object.prototype.toString："[object RegExp]"（跨 realm 兼容）
 *
 * 注意区分：
 *   - /abc/g        -> RegExp 对象
 *   - new RegExp("abc", "g") -> RegExp 对象
 *   - "abc"         -> string（不是正则）
 *
 * 实现思路：
 *   - 排除 null/非对象
 *   - 用 toString 检查标签（最可靠，跨 realm）
 */

function isRegExp(value) {
  // 1. null / 非对象排除
  if (value === null || typeof value !== "object") {
    return false;
  }

  // 2. 用 Object.prototype.toString 精确判断
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

// ===== 测试 =====

// --- 字面量正则 ---
console.log(isRegExp(/abc/)); // true
console.log(isRegExp(/abc/gi)); // true
console.log(isRegExp(/^hello\s+world$/m)); // true

// --- 构造函数创建 ---
console.log(isRegExp(new RegExp("abc"))); // true
console.log(isRegExp(new RegExp("abc", "gi"))); // true

// --- 字符串（不是正则）---
console.log(isRegExp("abc")); // false
console.log(isRegExp("/abc/")); // false（字符串，不是正则对象）

// --- 其他对象 ---
console.log(isRegExp({})); // false
console.log(isRegExp([])); // false
console.log(isRegExp(new Date())); // false
console.log(isRegExp(new Map())); // false
console.log(isRegExp(new Set())); // false
console.log(isRegExp(new Error())); // false

// --- 非对象 ---
console.log(isRegExp(null)); // false
console.log(isRegExp(undefined)); // false
console.log(isRegExp(123)); // false
console.log(isRegExp(true)); // false
console.log(isRegExp(Symbol("s"))); // false
console.log(isRegExp(function () {})); // false

// --- RegExp 子类 ---
class MyRegExp extends RegExp {}
console.log(isRegExp(new MyRegExp("abc"))); // true

// --- 伪造 toStringTag ---
const fakeReg = { [Symbol.toStringTag]: "RegExp" };
console.log(isRegExp(fakeReg)); // true（toString 标签匹配）
