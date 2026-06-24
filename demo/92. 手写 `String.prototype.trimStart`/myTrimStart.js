/**
 * 手写 String.prototype.trimStart
 *
 * 原生 trimStart 的作用：
 *   - 移除字符串开头的空白字符，返回新字符串
 *   - 语法：str.trimStart()
 *   - 别名：str.trimLeft()（功能相同）
 *   - 不修改原字符串
 *
 * 空白字符包括：
 *   - 空格、制表符(\t)、换行符(\n)、回车符(\r) 等
 *
 * 核心原理：
 *   - 从左向右找到第一个非空白字符的位置
 *   - 截取从该位置到末尾的子串
 */

String.prototype.myTrimStart = function () {
  const str = String(this);
  const len = str.length;

  let start = 0;

  // 从左找到第一个非空白字符
  while (start < len && /\s/.test(str[start])) {
    start++;
  }

  // 截取从 start 到末尾
  return str.slice(start);
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.trimStart ==========\n");

// --- 基本用法 ---
console.log("  hello  ".myTrimStart()); // "hello  "（只去掉左侧）
console.log("hello".myTrimStart()); // "hello"（无前导空白）
console.log("   ".myTrimStart()); // ""（全空白）
console.log("".myTrimStart()); // ""（空字符串）

// --- 不同空白字符 ---
console.log("\thello".myTrimStart()); // "hello"（制表符）
console.log("\nhello".myTrimStart()); // "hello"（换行符）
console.log(" \t\n hello".myTrimStart()); // "hello"（混合空白）

// --- 右侧空白保留 ---
console.log("hello  ".myTrimStart()); // "hello  "（右侧空白保留）
console.log("  hello\n\t".myTrimStart()); // "hello\n\t"

// --- 中间空白保留 ---
console.log("  hello world".myTrimStart()); // "hello world"

// --- 原字符串不被修改 ---
const original = "  hello  ";
console.log(original.myTrimStart()); // "hello  "
console.log(original); // "  hello  "

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("  hello  ".trimStart() === "  hello  ".myTrimStart()); // true
console.log("\t\nhello".trimStart() === "\t\nhello".myTrimStart()); // true
console.log("   ".trimStart() === "   ".myTrimStart()); // true

// --- trimLeft 别名对比 ---
console.log("\n--- trimLeft 别名 ---");
console.log("  hello".trimLeft === String.prototype.trimStart); // true（trimLeft 是 trimStart 的别名）
