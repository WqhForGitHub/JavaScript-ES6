/**
 * 手写 String.prototype.substring
 *
 * 原生 substring 的作用：
 *   - 返回字符串中两个索引之间的子串
 *   - 语法：str.substring(indexStart, indexEnd)
 *   - 包含 indexStart，不包含 indexEnd（左闭右开）
 *   - 不修改原字符串
 *
 * 与 slice 的关键区别：
 *   - substring 会交换参数：如果 indexStart > indexEnd，自动交换
 *   - substring 负数参数当作 0（不从末尾计算）
 *   - slice 负数参数从末尾计算，不交换
 *
 * 核心原理：
 *   - 将参数转为整数，负数和 NaN 当作 0
 *   - 限制到 [0, length] 范围
 *   - 如果 start > end 则交换
 *   - 截取子串
 */

String.prototype.mySubstring = function (indexStart, indexEnd) {
  const str = String(this);
  const len = str.length;

  // 规范化 indexStart
  let s = indexStart === undefined ? 0 : Number(indexStart);
  if (Number.isNaN(s) || s < 0) s = 0;
  s = Math.trunc(s);
  if (s > len) s = len;

  // 规范化 indexEnd
  let e = indexEnd === undefined ? len : Number(indexEnd);
  if (Number.isNaN(e) || e < 0) e = 0;
  e = Math.trunc(e);
  if (e > len) e = len;

  // 如果 start > end，交换
  if (s > e) {
    [s, e] = [e, s];
  }

  // 截取子串
  let result = "";
  for (let i = s; i < e; i++) {
    result += str[i];
  }
  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.substring ==========\n");

// --- 基本用法 ---
console.log("hello world".mySubstring(0, 5)); // "hello"
console.log("hello world".mySubstring(6)); // "world"
console.log("hello world".mySubstring(6, 11)); // "world"

// --- 参数交换（与 slice 的关键区别）---
console.log("hello world".mySubstring(5, 0)); // "hello"（自动交换为 0,5）
console.log("hello".mySubstring(3, 1)); // "el"（自动交换为 1,3）

// --- 负数参数当作 0（与 slice 的关键区别）---
console.log("hello world".mySubstring(-5)); // "hello world"（-5 → 0）
console.log("hello world".mySubstring(0, -6)); // ""（-6 → 0，0,0 → ""）
console.log("hello".mySubstring(-3, 3)); // "hel"（-3 → 0）

// --- 超出范围截断 ---
console.log("hello".mySubstring(0, 100)); // "hello"
console.log("hello".mySubstring(100)); // ""
console.log("hello".mySubstring(100, 200)); // ""

// --- start === end ---
console.log("hello".mySubstring(2, 2)); // ""

// --- 省略参数 ---
console.log("hello".mySubstring()); // "hello"

// --- NaN 当作 0 ---
console.log("hello".mySubstring("abc", 3)); // "hel"
console.log("hello".mySubstring(0, "abc")); // ""

// --- 与 slice 对比 ---
console.log("\n--- substring vs slice 对比 ---");
console.log("hello".substring(3, 1)); // "el"（交换）
console.log("hello".slice(3, 1)); // ""（不交换）
console.log("hello".substring(-1)); // "hello"（负数→0）
console.log("hello".slice(-1)); // "o"（负数从末尾算）

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".substring(0, 5) === "hello world".mySubstring(0, 5)); // true
console.log("hello".substring(3, 1) === "hello".mySubstring(3, 1)); // true
console.log("hello".substring(-3, 3) === "hello".mySubstring(-3, 3)); // true
