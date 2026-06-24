/**
 * 手写 String.prototype.slice
 *
 * 原生 slice 的作用：
 *   - 提取字符串的一部分，返回新字符串
 *   - 语法：str.slice(start, end)
 *   - 包含 start，不包含 end（左闭右开）
 *   - 不修改原字符串
 *
 * 索引处理规则：
 *   - 省略 start：默认 0
 *   - 省略 end：默认到字符串末尾
 *   - 负数索引：从末尾计算（length + index）
 *   - 索引超出范围：会被截断到有效范围
 *   - start >= end：返回空字符串
 *
 * 核心原理：
 *   - 规范化 start 和 end
 *   - 计算实际提取范围
 *   - 逐字符拼接新字符串
 */

String.prototype.mySlice = function (start, end) {
  const str = String(this);
  const len = str.length;

  // 规范化 start
  let s = start === undefined ? 0 : Number(start);
  if (Number.isNaN(s)) s = 0;
  s = Math.trunc(s);
  if (s < 0) s = Math.max(len + s, 0);
  if (s > len) s = len;

  // 规范化 end
  let e = end === undefined ? len : Number(end);
  if (Number.isNaN(e)) e = len;
  e = Math.trunc(e);
  if (e < 0) e = Math.max(len + e, 0);
  if (e > len) e = len;

  // start >= end 返回空字符串
  if (s >= e) return "";

  // 逐字符拼接
  let result = "";
  for (let i = s; i < e; i++) {
    result += str[i];
  }
  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.slice ==========\n");

// --- 基本用法 ---
console.log("hello world".mySlice(0, 5)); // "hello"
console.log("hello world".mySlice(6)); // "world"
console.log("hello world".mySlice(6, 11)); // "world"
console.log("hello world".mySlice(0)); // "hello world"

// --- 省略参数 ---
console.log("hello".mySlice()); // "hello"
console.log("hello".mySlice(2)); // "llo"

// --- 负数索引（从末尾计算）---
console.log("hello world".mySlice(-5)); // "world"
console.log("hello world".mySlice(-5, -1)); // "worl"
console.log("hello world".mySlice(0, -6)); // "hello"
console.log("hello".mySlice(-3, -1)); // "ll"

// --- 超出范围截断 ---
console.log("hello".mySlice(0, 100)); // "hello"
console.log("hello".mySlice(100)); // ""
console.log("hello".mySlice(-100, 3)); // "hel"

// --- start >= end 返回空字符串 ---
console.log("hello".mySlice(3, 3)); // ""
console.log("hello".mySlice(3, 1)); // ""
console.log("hello".mySlice(5, 0)); // ""

// --- 负数绝对值超过长度当作 0 ---
console.log("hello".mySlice(-100)); // "hello"
console.log("hello".mySlice(-100, -1)); // "hell"

// --- 原字符串不被修改 ---
const original = "hello world";
console.log(original.mySlice(0, 5)); // "hello"
console.log(original); // "hello world"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".slice(0, 5) === "hello world".mySlice(0, 5)); // true
console.log("hello world".slice(-5, -1) === "hello world".mySlice(-5, -1)); // true
console.log("hello".slice(-100) === "hello".mySlice(-100)); // true
