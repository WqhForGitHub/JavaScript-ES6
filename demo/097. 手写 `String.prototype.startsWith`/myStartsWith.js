/**
 * 手写 String.prototype.startsWith
 *
 * 原生 startsWith 的作用：
 *   - 判断字符串是否以指定子串开头，返回布尔值
 *   - 语法：str.startsWith(searchString, position)
 *   - 区分大小写
 *   - position 为起始检查位置，默认 0
 *
 * 核心原理：
 *   - 从 position 开始，检查 searchString 是否与原字符串对应位置的字串完全相同
 *   - 比较长度为 searchString.length 的子串
 */

String.prototype.myStartsWith = function (searchString, position) {
  const str = String(this);
  const search = String(searchString);

  // 处理 position
  let pos = position === undefined ? 0 : Number(position);
  if (Number.isNaN(pos)) pos = 0;
  pos = Math.trunc(pos);
  if (pos < 0) pos = 0;
  if (pos > str.length) pos = str.length;

  // 如果从 pos 开始剩余长度不足 search 长度，直接返回 false
  if (str.length - pos < search.length) {
    return false;
  }

  // 逐字符比较
  for (let i = 0; i < search.length; i++) {
    if (str[pos + i] !== search[i]) {
      return false;
    }
  }

  return true;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.startsWith ==========\n");

// --- 基本用法 ---
console.log("hello world".myStartsWith("hello")); // true
console.log("hello world".myStartsWith("world")); // false
console.log("hello world".myStartsWith("")); // true（空串总是匹配）

// --- 区分大小写 ---
console.log("Hello".myStartsWith("hello")); // false
console.log("Hello".myStartsWith("Hello")); // true

// --- 使用 position 参数 ---
console.log("hello world".myStartsWith("world", 6)); // true（从索引 6 开始检查）
console.log("hello world".myStartsWith("hello", 6)); // false
console.log("hello world".myStartsWith("o", 4)); // true（从索引 4 检查 "o world"）
console.log("hello world".myStartsWith("o w", 4)); // true

// --- 边界情况 ---
console.log("hello".myStartsWith("hello", 5)); // false（从末尾开始长度不足）
console.log("hello".myStartsWith("", 5)); // true（空串总是匹配）
console.log("hello".myStartsWith("hello", 0)); // true
console.log("".myStartsWith("")); // true
console.log("".myStartsWith("a")); // false

// --- search 比原串长 ---
console.log("hi".myStartsWith("hello")); // false

// --- 参数转为字符串 ---
console.log("123abc".myStartsWith(123)); // true（数字 123 转为 "123"）

// --- 负的 position 当作 0 ---
console.log("hello".myStartsWith("h", -1)); // true

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log(
  "hello world".startsWith("hello") === "hello world".myStartsWith("hello"),
); // true
console.log(
  "hello world".startsWith("world", 6) ===
    "hello world".myStartsWith("world", 6),
); // true
console.log("hello".startsWith("", 5) === "hello".myStartsWith("", 5)); // true
