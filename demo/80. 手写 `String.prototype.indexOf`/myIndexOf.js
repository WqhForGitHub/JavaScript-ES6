/**
 * 手写 String.prototype.indexOf
 *
 * 原生 indexOf 的作用：
 *   - 返回子串第一次出现的索引，找不到返回 -1
 *   - 语法：str.indexOf(searchValue, fromIndex)
 *   - 区分大小写
 *   - fromIndex 为起始搜索位置，默认 0
 *
 * 核心原理：
 *   - 从 fromIndex 开始逐个位置尝试匹配子串
 *   - 使用暴力匹配（朴素字符串匹配算法）
 *   - 在每个起始位置比较 searchValue 的所有字符
 */

String.prototype.myIndexOf = function (searchValue, fromIndex) {
  const str = String(this);
  const search = String(searchValue);

  // 处理 fromIndex
  let start = fromIndex === undefined ? 0 : Number(fromIndex);
  if (Number.isNaN(start)) start = 0;
  start = Math.trunc(start);

  // 空字符串特殊处理：返回 min(start, length)，但不小于 0
  if (search === "") {
    if (start < 0) return 0;
    return Math.min(start, str.length);
  }

  // 负的 fromIndex 当作 0
  if (start < 0) start = 0;

  const n = str.length;
  const m = search.length;

  // 从 start 开始遍历每个可能的起始位置
  for (let i = start; i <= n - m; i++) {
    // 在位置 i 处尝试匹配整个 search
    let matched = true;
    for (let j = 0; j < m; j++) {
      if (str[i + j] !== search[j]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return i;
    }
  }

  return -1;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.indexOf ==========\n");

// --- 基本用法 ---
console.log("hello world".myIndexOf("world")); // 6
console.log("hello world".myIndexOf("hello")); // 0
console.log("hello world".myIndexOf("o")); // 4（第一个 o）
console.log("hello world".myIndexOf("xyz")); // -1

// --- 区分大小写 ---
console.log("Hello".myIndexOf("h")); // -1
console.log("Hello".myIndexOf("H")); // 0

// --- 空字符串搜索 ---
console.log("hello".myIndexOf("")); // 0
console.log("hello".myIndexOf("", 3)); // 3
console.log("hello".myIndexOf("", 10)); // 5（不超过字符串长度）

// --- 使用 fromIndex ---
console.log("hello world".myIndexOf("o", 5)); // 7（从索引 5 开始找第一个 o）
console.log("aaa".myIndexOf("a", 1)); // 1
console.log("hello".myIndexOf("o", 10)); // -1（起始位置超出长度）

// --- 负的 fromIndex ---
console.log("hello".myIndexOf("h", -1)); // 0（负数当作 0）

// --- 多次出现 ---
console.log("ababab".myIndexOf("ab")); // 0
console.log("ababab".myIndexOf("ab", 1)); // 2

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".indexOf("world") === "hello world".myIndexOf("world")); // true
console.log("hello world".indexOf("o", 5) === "hello world".myIndexOf("o", 5)); // true
console.log("hello".indexOf("") === "hello".myIndexOf("")); // true
