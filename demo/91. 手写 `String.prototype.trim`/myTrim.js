/**
 * 手写 String.prototype.trim
 *
 * 原生 trim 的作用：
 *   - 移除字符串两端的空白字符，返回新字符串
 *   - 语法：str.trim()
 *   - 不修改原字符串
 *
 * 空白字符包括：
 *   - 空格、制表符(\t)、换行符(\n)、回车符(\r)
 *   - 换页符(\f)、垂直制表符(\v)
 *   - 不间断空格(\u00A0)、BOM(\uFEFF) 等 Unicode 空白
 *
 * 核心原理：
 *   - 方法1：使用正则 /^\s+|\s+$/g 匹配两端空白并替换为空
 *   - 方法2：手动找到第一个和最后一个非空白字符的位置，截取
 */

String.prototype.myTrim = function () {
  const str = String(this);
  const len = str.length;

  let start = 0;
  let end = len - 1;

  // 从左找到第一个非空白字符
  while (start <= end && isWhitespace(str[start])) {
    start++;
  }

  // 从右找到最后一个非空白字符
  while (end >= start && isWhitespace(str[end])) {
    end--;
  }

  // 截取非空白部分
  return str.slice(start, end + 1);

  // 判断是否为空白字符（覆盖常见 Unicode 空白）
  function isWhitespace(ch) {
    return /\s/.test(ch);
  }
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.trim ==========\n");

// --- 基本用法 ---
console.log("  hello  ".myTrim()); // "hello"
console.log("hello".myTrim()); // "hello"（无空白不变）
console.log("   ".myTrim()); // ""（全空白）
console.log("".myTrim()); // ""（空字符串）

// --- 不同空白字符 ---
console.log("\thello\t".myTrim()); // "hello"（制表符）
console.log("\nhello\n".myTrim()); // "hello"（换行符）
console.log("\r\nhello\r\n".myTrim()); // "hello"（回车换行）
console.log(" \t\n hello \n\t ".myTrim()); // "hello"（混合空白）

// --- 仅一侧有空白 ---
console.log("  hello".myTrim()); // "hello"（左侧）
console.log("hello  ".myTrim()); // "hello"（右侧）

// --- 中间空白保留 ---
console.log("  hello world  ".myTrim()); // "hello world"
console.log("  a  b  c  ".myTrim()); // "a  b  c"

// --- 原字符串不被修改 ---
const original = "  hello  ";
console.log(original.myTrim()); // "hello"
console.log(original); // "  hello  "

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("  hello  ".trim() === "  hello  ".myTrim()); // true
console.log("\t\nhello\n\t".trim() === "\t\nhello\n\t".myTrim()); // true
console.log("   ".trim() === "   ".myTrim()); // true
