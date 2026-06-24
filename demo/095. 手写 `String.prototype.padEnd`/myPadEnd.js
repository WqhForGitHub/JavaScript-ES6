/**
 * 手写 String.prototype.padEnd
 *
 * 原生 padEnd 的作用：
 *   - 用指定字符串在末尾填充，使字符串达到目标长度
 *   - 语法：str.padEnd(targetLength, padString)
 *   - 返回新字符串，不修改原字符串
 *
 * 填充规则：
 *   - 如果当前长度 >= targetLength，直接返回原字符串
 *   - padString 默认为空格 " "
 *   - padString 会被重复截取以填充到刚好达到 targetLength
 *   - 如果 padString 太长，会被截断
 *
 * 核心原理：
 *   - 计算需要填充的长度
 *   - 重复 padString 并截取到所需长度
 *   - 拼接到原字符串末尾
 */

String.prototype.myPadEnd = function (targetLength, padString) {
  const str = String(this);
  const target = Math.trunc(Number(targetLength)) || 0;

  // 如果当前长度已满足，直接返回原字符串
  if (str.length >= target) {
    return str;
  }

  // padString 默认为空格
  let pad = padString === undefined ? " " : String(padString);

  // 如果 padString 为空字符串，无法填充，直接返回原字符串
  if (pad === "") {
    return str;
  }

  // 计算需要填充的长度
  const fillLen = target - str.length;

  // 重复 padString 并截取到 fillLen
  let padding = "";
  while (padding.length < fillLen) {
    padding += pad;
  }
  padding = padding.slice(0, fillLen);

  // 拼接到末尾
  return str + padding;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.padEnd ==========\n");

// --- 基本用法 ---
console.log("5".myPadEnd(3, "0")); // "500"
console.log("abc".myPadEnd(5, " ")); // "abc  "
console.log("abc".myPadEnd(10, "0")); // "abc0000000"

// --- 省略 padString（默认空格）---
console.log("abc".myPadEnd(5)); // "abc  "
console.log("hi".myPadEnd(5)); // "hi   "

// --- 当前长度已满足（直接返回原字符串）---
console.log("hello".myPadEnd(3, "0")); // "hello"
console.log("hello".myPadEnd(5, "0")); // "hello"
console.log("hello".myPadEnd(5)); // "hello"

// --- padString 太长会被截断 ---
console.log("abc".myPadEnd(5, "123456")); // "abc12"（只需 2 个字符）

// --- padString 多字符重复填充 ---
console.log("abc".myPadEnd(10, "xy")); // "abcxyxyxyx"
console.log("abc".myPadEnd(8, "ab")); // "abcababa"

// --- 空字符串 ---
console.log("".myPadEnd(3, "x")); // "xxx"
console.log("".myPadEnd(3)); // "   "

// --- padString 为空字符串 ---
console.log("abc".myPadEnd(5, "")); // "abc"（无法填充）

// --- targetLength 为 0 ---
console.log("abc".myPadEnd(0, "x")); // "abc"

// --- 原字符串不被修改 ---
const original = "abc";
console.log(original.myPadEnd(5, "0")); // "abc00"
console.log(original); // "abc"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("5".padEnd(3, "0") === "5".myPadEnd(3, "0")); // true
console.log("abc".padEnd(10, "xy") === "abc".myPadEnd(10, "xy")); // true
console.log("abc".padEnd(5) === "abc".myPadEnd(5)); // true
