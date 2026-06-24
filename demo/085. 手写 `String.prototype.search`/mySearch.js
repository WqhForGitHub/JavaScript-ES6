/**
 * 手写 String.prototype.search
 *
 * 原生 search 的作用：
 *   - 使用正则表达式搜索匹配，返回第一个匹配的索引
 *   - 语法：str.search(regexp)
 *   - 找到返回索引（>= 0），找不到返回 -1
 *   - 总是返回第一个匹配的位置，忽略 g 标志
 *   - 如果传入非正则，会被 new RegExp() 包装
 *
 * 与 indexOf 的区别：
 *   - indexOf 只能匹配固定字符串
 *   - search 支持正则模式
 *   - search 不支持 fromIndex 参数
 *
 * 核心原理：
 *   - 将参数包装为正则
 *   - 使用 exec 找到第一个匹配
 *   - 返回 match.index，无匹配返回 -1
 */

String.prototype.mySearch = function (regexp) {
  const str = String(this);

  // 非正则参数包装为正则（忽略 g 标志）
  const rx = regexp instanceof RegExp ? regexp : new RegExp(regexp);

  // 执行一次匹配
  const match = rx.exec(str);

  // 返回第一个匹配的索引，无匹配返回 -1
  return match === null ? -1 : match.index;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.search ==========\n");

// --- 基本用法 ---
console.log("hello world".mySearch(/world/)); // 6
console.log("hello world".mySearch(/hello/)); // 0
console.log("hello world".mySearch(/o/)); // 4（第一个 o）
console.log("hello world".mySearch(/xyz/)); // -1

// --- 传入字符串（包装为正则）---
console.log("hello world".mySearch("world")); // 6
console.log("hello world".mySearch("o")); // 4
console.log("hello world".mySearch("xyz")); // -1

// --- 使用正则特性 ---
console.log("abc123def".mySearch(/\d/)); // 3（第一个数字的位置）
console.log("hello".mySearch(/[A-Z]/)); // -1（无大写字母）
console.log("Hello".mySearch(/[A-Z]/)); // 0

// --- g 标志被忽略（总是返回第一个匹配）---
console.log("aaa".mySearch(/a/g)); // 0
console.log("ababab".mySearch(/ab/g)); // 0

// --- 空正则 ---
console.log("hello".mySearch(/(?:)/)); // 0（空正则匹配在索引 0）

// --- 边界情况 ---
console.log("".mySearch(/a/)); // -1

// --- 复杂正则 ---
console.log("2024-01-15".mySearch(/-\d{2}-/)); // 4（匹配 "-01-"）
console.log("test@example.com".mySearch(/@/)); // 4

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".search(/world/) === "hello world".mySearch(/world/)); // true
console.log("hello world".search("o") === "hello world".mySearch("o")); // true
console.log("hello".search(/xyz/) === "hello".mySearch(/xyz/)); // true
