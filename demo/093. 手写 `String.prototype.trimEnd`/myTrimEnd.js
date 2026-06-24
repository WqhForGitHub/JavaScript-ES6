/**
 * 手写 String.prototype.trimEnd
 *
 * 原生 trimEnd 的作用：
 *   - 移除字符串末尾的空白字符，返回新字符串
 *   - 语法：str.trimEnd()
 *   - 别名：str.trimRight()（功能相同）
 *   - 不修改原字符串
 *
 * 空白字符包括：
 *   - 空格、制表符(\t)、换行符(\n)、回车符(\r) 等
 *
 * 核心原理：
 *   - 从右向左找到最后一个非空白字符的位置
 *   - 截取从开头到该位置（含）的子串
 */

String.prototype.myTrimEnd = function () {
  const str = String(this);
  const len = str.length;

  let end = len - 1;

  // 从右找到最后一个非空白字符
  while (end >= 0 && /\s/.test(str[end])) {
    end--;
  }

  // 截取从开头到 end（含）
  return str.slice(0, end + 1);
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.trimEnd ==========\n");

// --- 基本用法 ---
console.log("  hello  ".myTrimEnd()); // "  hello"（只去掉右侧）
console.log("hello".myTrimEnd()); // "hello"（无尾部空白）
console.log("   ".myTrimEnd()); // ""（全空白）
console.log("".myTrimEnd()); // ""（空字符串）

// --- 不同空白字符 ---
console.log("hello\t".myTrimEnd()); // "hello"（制表符）
console.log("hello\n".myTrimEnd()); // "hello"（换行符）
console.log("hello \t\n ".myTrimEnd()); // "hello"（混合空白）

// --- 左侧空白保留 ---
console.log("  hello".myTrimEnd()); // "  hello"（左侧空白保留）
console.log("\t\nhello  ".myTrimEnd()); // "\t\nhello"

// --- 中间空白保留 ---
console.log("hello world  ".myTrimEnd()); // "hello world"

// --- 原字符串不被修改 ---
const original = "  hello  ";
console.log(original.myTrimEnd()); // "  hello"
console.log(original); // "  hello  "

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("  hello  ".trimEnd() === "  hello  ".myTrimEnd()); // true
console.log("hello\t\n".trimEnd() === "hello\t\n".myTrimEnd()); // true
console.log("   ".trimEnd() === "   ".myTrimEnd()); // true

// --- trimRight 别名对比 ---
console.log("\n--- trimRight 别名 ---");
console.log("hello  ".trimRight === String.prototype.trimEnd); // true（trimRight 是 trimEnd 的别名）
