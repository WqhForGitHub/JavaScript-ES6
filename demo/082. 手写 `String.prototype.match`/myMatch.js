/**
 * 手写 String.prototype.match
 *
 * 原生 match 的作用：
 *   - 使用正则表达式匹配字符串
 *   - 语法：str.match(regexp)
 *   - 如果传入非正则，会被 new RegExp() 包装
 *
 * 返回值规则：
 *   - 无 "g" 标志：返回第一个匹配结果的数组（含捕获组），无匹配返回 null
 *     数组第 0 项是完整匹配，后续是捕获组
 *     数组带 index（匹配位置）和 input（原字符串）属性
 *   - 有 "g" 标志：返回所有匹配结果的数组（仅完整匹配），无匹配返回 null
 *
 * 核心原理：
 *   - 利用 RegExp.prototype.exec 进行匹配
 *   - 无 g 标志时执行一次 exec
 *   - 有 g 标志时循环 exec 收集所有匹配
 */

String.prototype.myMatch = function (regexp) {
  const str = String(this);

  // 非正则参数包装为正则
  const rx = regexp instanceof RegExp ? regexp : new RegExp(regexp);

  // 全局标志
  const global = rx.global;

  if (!global) {
    // 无 g 标志：执行一次 exec，返回带 index/input 的数组
    const result = rx.exec(str);
    return result; // exec 已经返回 null 或带属性的数组
  }

  // 有 g 标志：循环收集所有匹配
  const matches = [];
  let match;
  // 重置 lastIndex 以防正则已被使用过
  rx.lastIndex = 0;
  while ((match = rx.exec(str)) !== null) {
    matches.push(match[0]);
    // 防止零宽匹配导致死循环
    if (match[0] === "") {
      rx.lastIndex++;
    }
  }

  return matches.length === 0 ? null : matches;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.match ==========\n");

// --- 无 g 标志：返回第一个匹配（含捕获组、index、input）---
const m1 = "hello world".myMatch(/(\w)(\w)/);
console.log(m1); // ["he", "h", "e", index: 0, input: "hello world"]
console.log(m1[0]); // "he"
console.log(m1[1]); // "h"
console.log(m1[2]); // "e"
console.log(m1.index); // 0
console.log(m1.input); // "hello world"

// --- 无匹配返回 null ---
console.log("hello".myMatch(/xyz/)); // null

// --- 有 g 标志：返回所有完整匹配 ---
console.log("hello world".myMatch(/\w+/g)); // ["hello", "world"]
console.log("abc123def456".myMatch(/\d+/g)); // ["123", "456"]
console.log("a1b2c3".myMatch(/[a-z]/g)); // ["a", "b", "c"]

// --- 无匹配（g 标志）返回 null ---
console.log("hello".myMatch(/\d/g)); // null

// --- 传入字符串（会被包装为正则）---
console.log("hello".myMatch("ll")); // ["ll", index: 2, input: "hello"]
console.log("hello world".myMatch("o", "g")); // 注意：字符串作为第二参数的 flags 在新版已废弃

// --- 空匹配 ---
console.log("abc".myMatch(/(?:)/g)); // ["", "", "", ""]

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
const native = "hello world".match(/\w+/g);
const mine = "hello world".myMatch(/\w+/g);
console.log(JSON.stringify(native) === JSON.stringify(mine)); // true
