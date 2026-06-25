/**
 * 手写 String.prototype.lastIndexOf
 *
 * 原生 lastIndexOf 的作用：
 *   - 返回子串最后一次出现的索引，找不到返回 -1
 *   - 语法：str.lastIndexOf(searchValue, fromIndex)
 *   - 从右向左搜索（但返回的索引仍是正向的）
 *   - fromIndex 默认为 +Infinity，表示从末尾开始向前搜索
 *
 * 与 indexOf 的区别：
 *   - indexOf 从左向右找第一个
 *   - lastIndexOf 从指定位置向左找最后一个
 *
 * 核心原理：
 *   - 从 min(fromIndex, n - m) 开始向左逐个位置尝试匹配
 *   - 在每个起始位置比较 searchValue 的所有字符
 */

String.prototype.myLastIndexOf = function (searchValue, fromIndex) {
  const str = String(this);
  const search = String(searchValue);

  const n = str.length;
  const m = search.length;

  // 空字符串特殊处理
  if (search === "") {
    let pos = fromIndex === undefined ? n : Number(fromIndex);
    if (Number.isNaN(pos)) pos = n;
    pos = Math.trunc(pos);
    if (pos < 0) return 0;
    return Math.min(pos, n);
  }

  // 处理 fromIndex
  let start = fromIndex === undefined ? n : Number(fromIndex);
  if (Number.isNaN(start)) start = n;
  start = Math.trunc(start);

  // 负的 fromIndex 且非空搜索串直接返回 -1
  if (start < 0) return -1;

  // 搜索起始位置不能超过 n - m
  let i = Math.min(start, n - m);

  // 从右向左搜索
  for (; i >= 0; i--) {
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

console.log("========== 手写 String.prototype.lastIndexOf ==========\n");

// --- 基本用法 ---
console.log("hello world".myLastIndexOf("o")); // 7（最后一个 o）
console.log("hello world".myLastIndexOf("world")); // 6
console.log("hello world".myLastIndexOf("hello")); // 0
console.log("hello world".myLastIndexOf("xyz")); // -1

// --- 多次出现 ---
console.log("ababab".myLastIndexOf("ab")); // 4
console.log("aaaa".myLastIndexOf("aa")); // 2

// --- 区分大小写 ---
console.log("Hello".myLastIndexOf("h")); // -1

// --- 空字符串搜索 ---
console.log("hello".myLastIndexOf("")); // 5
console.log("hello".myLastIndexOf("", 3)); // 3

// --- 使用 fromIndex（从该位置向左搜索）---
console.log("hello world".myLastIndexOf("o", 6)); // 4（从索引 6 向左找，找到索引 4 的 o）
console.log("hello world".myLastIndexOf("o", 7)); // 7
console.log("ababab".myLastIndexOf("ab", 3)); // 2

// --- 负的 fromIndex ---
console.log("hello".myLastIndexOf("h", -1)); // -1

// --- 超大 fromIndex ---
console.log("hello".myLastIndexOf("o", 1000)); // 4

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log(
  "hello world".lastIndexOf("o") === "hello world".myLastIndexOf("o"),
); // true
console.log("ababab".lastIndexOf("ab", 3) === "ababab".myLastIndexOf("ab", 3)); // true
console.log("hello".lastIndexOf("") === "hello".myLastIndexOf("")); // true
