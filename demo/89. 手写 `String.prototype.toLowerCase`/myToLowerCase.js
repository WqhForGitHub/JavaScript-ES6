/**
 * 手写 String.prototype.toLowerCase
 *
 * 原生 toLowerCase 的作用：
 *   - 将字符串中所有大写字母转为小写，返回新字符串
 *   - 语法：str.toLowerCase()
 *   - 不修改原字符串
 *
 * 核心原理：
 *   - ASCII 大写字母 A-Z（65-90）对应小写 a-z（97-122）
 *   - 大写转小写：码元 + 32
 *   - 利用 charCodeAt / fromCharCode 进行转换
 *
 * 注意：
 *   - 本实现主要处理 ASCII 范围（A-Z → a-z）
 *   - 完整 Unicode 转换（如德语 ß、土耳其语 İ 等）需要更复杂的映射表
 *   - 原生 toLowerCase 基于 Unicode 标准支持所有字符
 */

String.prototype.myToLowerCase = function () {
  const str = String(this);
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // A-Z (65-90) → a-z (97-122)，加 32
    if (code >= 65 && code <= 90) {
      result += String.fromCharCode(code + 32);
    } else {
      result += str[i];
    }
  }

  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.toLowerCase ==========\n");

// --- 基本用法 ---
console.log("HELLO".myToLowerCase()); // "hello"
console.log("Hello World".myToLowerCase()); // "hello world"
console.log("ABC123".myToLowerCase()); // "abc123"

// --- 全小写（不变）---
console.log("hello".myToLowerCase()); // "hello"

// --- 混合数字和符号 ---
console.log("Test 123! @#".myToLowerCase()); // "test 123! @#"

// --- 空字符串 ---
console.log("".myToLowerCase()); // ""

// --- 原字符串不被修改 ---
const original = "HELLO";
console.log(original.myToLowerCase()); // "hello"
console.log(original); // "HELLO"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("HELLO World".toLowerCase() === "HELLO World".myToLowerCase()); // true
console.log("ABC123!".toLowerCase() === "ABC123!".myToLowerCase()); // true

// --- 码元验证 ---
console.log("\n--- 码元验证 ---");
console.log("A".charCodeAt(0)); // 65
console.log("a".charCodeAt(0)); // 97
console.log(97 - 65); // 32（大小写码元差）
