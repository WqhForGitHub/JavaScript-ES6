/**
 * 手写 String.prototype.toUpperCase
 *
 * 原生 toUpperCase 的作用：
 *   - 将字符串中所有小写字母转为大写，返回新字符串
 *   - 语法：str.toUpperCase()
 *   - 不修改原字符串
 *
 * 核心原理：
 *   - ASCII 小写字母 a-z（97-122）对应大写 A-Z（65-90）
 *   - 小写转大写：码元 - 32
 *   - 利用 charCodeAt / fromCharCode 进行转换
 *
 * 注意：
 *   - 本实现主要处理 ASCII 范围（a-z → A-Z）
 *   - 完整 Unicode 转换需要更复杂的映射表
 *   - 原生 toUpperCase 基于 Unicode 标准支持所有字符
 */

String.prototype.myToUpperCase = function () {
  const str = String(this);
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // a-z (97-122) → A-Z (65-90)，减 32
    if (code >= 97 && code <= 122) {
      result += String.fromCharCode(code - 32);
    } else {
      result += str[i];
    }
  }

  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.toUpperCase ==========\n");

// --- 基本用法 ---
console.log("hello".myToUpperCase()); // "HELLO"
console.log("Hello World".myToUpperCase()); // "HELLO WORLD"
console.log("abc123".myToUpperCase()); // "ABC123"

// --- 全大写（不变）---
console.log("HELLO".myToUpperCase()); // "HELLO"

// --- 混合数字和符号 ---
console.log("Test 123! @#".myToUpperCase()); // "TEST 123! @#"

// --- 空字符串 ---
console.log("".myToUpperCase()); // ""

// --- 原字符串不被修改 ---
const original = "hello";
console.log(original.myToUpperCase()); // "HELLO"
console.log(original); // "hello"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("hello world".toUpperCase() === "hello world".myToUpperCase()); // true
console.log("abc123!".toUpperCase() === "abc123!".myToUpperCase()); // true

// --- 码元验证 ---
console.log("\n--- 码元验证 ---");
console.log("a".charCodeAt(0)); // 97
console.log("A".charCodeAt(0)); // 65
console.log(97 - 65); // 32（大小写码元差）

// --- 配合 toLowerCase 互转 ---
console.log("Hello".myToUpperCase().toLowerCase()); // "hello"
