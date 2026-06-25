/**
 * 手写 String.prototype.endsWith
 *
 * 原生 endsWith 的作用：
 *   - 判断字符串是否以指定子串结尾，返回布尔值
 *   - 语法：str.endsWith(searchString, endPosition)
 *   - 区分大小写
 *   - endPosition 默认为字符串长度，表示在 [0, endPosition) 范围内检查
 *
 * 注意：
 *   - 与 startsWith 的 position 不同
 *   - endsWith 的 endPosition 表示"当作字符串只有前 endPosition 个字符"
 *   - 即检查 str.slice(0, endPosition) 是否以 searchString 结尾
 *
 * 核心原理：
 *   - 计算 search 在截断字符串中的起始位置
 *   - 逐字符比较
 */

String.prototype.myEndsWith = function (searchString, endPosition) {
  const str = String(this);
  const search = String(searchString);

  // 处理 endPosition，默认为字符串长度
  let end = endPosition === undefined ? str.length : Number(endPosition);
  if (Number.isNaN(end)) end = str.length;
  end = Math.trunc(end);
  if (end < 0) end = 0;
  if (end > str.length) end = str.length;

  // 计算 search 应该开始比较的位置
  const start = end - search.length;

  // 如果起始位置小于 0，说明 search 比可用部分长，返回 false
  if (start < 0) {
    return false;
  }

  // 逐字符比较
  for (let i = 0; i < search.length; i++) {
    if (str[start + i] !== search[i]) {
      return false;
    }
  }

  return true;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.endsWith ==========\n");

// --- 基本用法 ---
console.log("hello world".myEndsWith("world")); // true
console.log("hello world".myEndsWith("hello")); // false
console.log("hello world".myEndsWith("")); // true（空串总是匹配）

// --- 区分大小写 ---
console.log("Hello".myEndsWith("hello")); // false
console.log("Hello".myEndsWith("Hello")); // true

// --- 使用 endPosition 参数 ---
// endPosition 表示"当作字符串只有前 N 个字符"
console.log("hello world".myEndsWith("hello", 5)); // true（前 5 个字符 "hello" 以 "hello" 结尾）
console.log("hello world".myEndsWith("world", 5)); // false（前 5 个字符不以 "world" 结尾）
console.log("hello world".myEndsWith("o", 5)); // true（前 5 个字符 "hello" 以 "o" 结尾）
console.log("hello world".myEndsWith("ell", 5)); // true（"hello" 以 "ell" 结尾）

// --- 边界情况 ---
console.log("hello".myEndsWith("hello", 0)); // false（前 0 个字符无法以 "hello" 结尾）
console.log("hello".myEndsWith("", 0)); // true（空串总是匹配）
console.log("hello".myEndsWith("hello")); // true
console.log("".myEndsWith("")); // true
console.log("".myEndsWith("a")); // false

// --- search 比原串长 ---
console.log("hi".myEndsWith("hello")); // false

// --- 参数转为字符串 ---
console.log("abc123".myEndsWith(123)); // true（数字 123 转为 "123"）

// --- 负的 endPosition ---
console.log("hello".myEndsWith("o", -1)); // false（endPosition 当作 0）

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log(
  "hello world".endsWith("world") === "hello world".myEndsWith("world"),
); // true
console.log(
  "hello world".endsWith("hello", 5) === "hello world".myEndsWith("hello", 5),
); // true
console.log("hello".endsWith("", 0) === "hello".myEndsWith("", 0)); // true
