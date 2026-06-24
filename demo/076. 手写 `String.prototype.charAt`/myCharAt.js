/**
 * 手写 String.prototype.charAt
 *
 * 原生 charAt 的作用：
 *   - 返回字符串指定索引位置的字符
 *   - 语法：str.charAt(index)
 *   - 索引从 0 开始
 *   - 如果索引超出范围或为负数，返回空字符串 ""
 *   - 如果省略 index，默认为 0
 *   - 如果 index 不是整数，会被转换为整数
 *
 * 核心原理：
 *   - 将 index 转换为整数
 *   - 检查索引是否在有效范围 [0, length - 1] 内
 *   - 在范围内则返回对应字符，否则返回空字符串
 */

String.prototype.myCharAt = function (index) {
  // 1. this 经过抽象 ToString 转为字符串（这里 this 已经是字符串）
  const str = String(this);

  // 2. 将 index 转为数字，未传参时默认为 0
  const position = index === undefined ? 0 : Number(index);

  // 3. 转为整数（截断小数部分，处理 NaN）
  const intPosition = Number.isNaN(position) ? 0 : Math.trunc(position);

  // 4. 检查索引范围，超出范围返回空字符串
  if (intPosition < 0 || intPosition >= str.length) {
    return "";
  }

  // 5. 返回对应位置的字符
  return str[intPosition];
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.charAt ==========\n");

// --- 基本用法 ---
console.log("hello".myCharAt(0)); // "h"
console.log("hello".myCharAt(1)); // "e"
console.log("hello".myCharAt(4)); // "o"

// --- 边界情况 ---
console.log("hello".myCharAt(-1)); // ""（负数索引返回空字符串）
console.log("hello".myCharAt(5)); // ""（超出长度返回空字符串）
console.log("hello".myCharAt(100)); // ""（远超长度返回空字符串）

// --- 省略参数 ---
console.log("hello".myCharAt()); // "h"（默认索引 0）

// --- 非整数索引（会被截断为整数）---
console.log("hello".myCharAt(1.9)); // "e"（1.9 截断为 1）
console.log("hello".myCharAt(0.5)); // "h"（0.5 截断为 0）

// --- 非数字索引（转为 NaN 后当作 0）---
console.log("hello".myCharAt("abc")); // "h"（NaN 当作 0）
console.log("hello".myCharAt(null)); // "h"（null 转为 0）
console.log("hello".myCharAt(true)); // "e"（true 转为 1）

// --- 空字符串 ---
console.log("".myCharAt(0)); // ""

// --- 与原生 charAt 对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello".charAt(0) === "hello".myCharAt(0)); // true
console.log("hello".charAt(5) === "hello".myCharAt(5)); // true
console.log("hello".charAt(-1) === "hello".myCharAt(-1)); // true
