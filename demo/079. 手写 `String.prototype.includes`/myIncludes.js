/**
 * 手写 String.prototype.includes
 *
 * 原生 includes 的作用：
 *   - 判断字符串中是否包含指定子串，返回布尔值
 *   - 语法：str.includes(searchString, position)
 *   - 区分大小写
 *   - position 为起始搜索位置，默认 0
 *   - 找到返回 true，找不到返回 false
 *
 * 核心原理：
 *   - 从 position 开始，检查 searchString 是否作为子串出现
 *   - 使用 indexOf 判断结果是否 !== -1
 */

String.prototype.myIncludes = function (searchString, position) {
  const str = String(this);

  // 搜索内容转为字符串
  const search = String(searchString);

  // 起始位置处理：默认 0，转为整数，限制在 [0, length] 范围
  let pos = position === undefined ? 0 : Number(position);
  if (Number.isNaN(pos)) pos = 0;
  pos = Math.trunc(pos);
  if (pos < 0) pos = 0;
  if (pos > str.length) pos = str.length;

  // 利用 indexOf 判断：如果能在 pos 之后找到，说明包含
  return str.indexOf(search, pos) !== -1;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.includes ==========\n");

// --- 基本用法 ---
console.log("hello world".myIncludes("world")); // true
console.log("hello world".myIncludes("hello")); // true
console.log("hello world".myIncludes("xyz")); // false
console.log("hello world".myIncludes("")); // true（空串总是包含）

// --- 区分大小写 ---
console.log("Hello".myIncludes("hello")); // false（区分大小写）
console.log("Hello".myIncludes("Hello")); // true

// --- 使用 position 参数 ---
console.log("hello world".myIncludes("world", 6)); // true（从索引 6 开始找）
console.log("hello world".myIncludes("hello", 6)); // false（从索引 6 开始找不到 hello）
console.log("hello world".myIncludes("o", 5)); // true（从索引 5 开始能找到 "o world" 中的 o）
console.log("aaa".myIncludes("a", 1)); // true

// --- 边界情况 ---
console.log("hello".myIncludes("hello", 5)); // false（从末尾开始找不到）
console.log("".myIncludes("")); // true
console.log("".myIncludes("a")); // false

// --- 参数转为字符串 ---
console.log("abc123".myIncludes(123)); // true（数字 123 转为 "123"）

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log(
  "hello world".includes("world") === "hello world".myIncludes("world"),
); // true
console.log(
  "hello world".includes("hello", 6) === "hello world".myIncludes("hello", 6),
); // true
