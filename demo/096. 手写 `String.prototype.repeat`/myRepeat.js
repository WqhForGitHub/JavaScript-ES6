/**
 * 手写 String.prototype.repeat
 *
 * 原生 repeat 的作用：
 *   - 将字符串重复指定次数，返回新字符串
 *   - 语法：str.repeat(count)
 *   - 返回新字符串，不修改原字符串
 *
 * 规则：
 *   - count 必须是非负整数
 *   - count 为 0 返回空字符串
 *   - count 为负数或 Infinity 抛出 RangeError
 *   - count 为小数会被截断为整数（向下取整）
 *   - count 为 NaN 当作 0
 *
 * 核心原理：
 *   - 校验 count
 *   - 循环拼接 count 次
 */

String.prototype.myRepeat = function (count) {
  const str = String(this);

  // 将 count 转为数字
  let n = Number(count);

  // NaN 当作 0
  if (Number.isNaN(n)) {
    n = 0;
  }

  // 负数或 Infinity 抛出错误
  if (n < 0 || n === Infinity) {
    throw new RangeError("Invalid count value");
  }

  // 截断为整数
  n = Math.trunc(n);

  // count 为 0 返回空字符串
  if (n === 0) {
    return "";
  }

  // 循环拼接
  let result = "";
  for (let i = 0; i < n; i++) {
    result += str;
  }
  return result;
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.repeat ==========\n");

// --- 基本用法 ---
console.log("abc".myRepeat(3)); // "abcabcabc"
console.log("ab".myRepeat(2)); // "abab"
console.log("x".myRepeat(5)); // "xxxxx"

// --- count 为 0 ---
console.log("abc".myRepeat(0)); // ""

// --- count 为 1 ---
console.log("abc".myRepeat(1)); // "abc"

// --- 小数会被截断 ---
console.log("abc".myRepeat(2.9)); // "abcabc"（截断为 2）
console.log("abc".myRepeat(0.9)); // ""（截断为 0）

// --- NaN 当作 0 ---
console.log("abc".myRepeat(NaN)); // ""
console.log("abc".myRepeat("abc")); // ""

// --- 空字符串 ---
console.log("".myRepeat(5)); // ""
console.log("".myRepeat(0)); // ""

// --- 错误情况 ---
try {
  "abc".myRepeat(-1);
} catch (e) {
  console.log(e.name + ": " + e.message); // RangeError: Invalid count value
}

try {
  "abc".myRepeat(Infinity);
} catch (e) {
  console.log(e.name + ": " + e.message); // RangeError: Invalid count value
}

// --- 原字符串不被修改 ---
const original = "abc";
console.log(original.myRepeat(2)); // "abcabc"
console.log(original); // "abc"

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("abc".repeat(3) === "abc".myRepeat(3)); // true
console.log("abc".repeat(0) === "abc".myRepeat(0)); // true
console.log("abc".repeat(2.9) === "abc".myRepeat(2.9)); // true

// --- 性能优化：使用倍增法（适用于大 count）---
console.log("\n--- 倍增法实现（优化版）---");
function repeatFast(str, count) {
  let n = Math.trunc(count) || 0;
  if (n <= 0) return "";
  let result = "";
  let base = str;
  while (n > 0) {
    if (n & 1) result += base;
    base += base;
    n >>= 1;
  }
  return result;
}
console.log(repeatFast("abc", 4)); // "abcabcabcabc"
console.log(repeatFast("ab", 3)); // "ababab"
