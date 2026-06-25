/**
 * 手写 String.prototype.charCodeAt
 *
 * 原生 charCodeAt 的作用：
 *   - 返回字符串指定索引位置字符的 UTF-16 码元（code unit）
 *   - 语法：str.charCodeAt(index)
 *   - 返回值是 0 ~ 65535 之间的整数
 *   - 索引超出范围或为负数时返回 NaN
 *   - 省略 index 时默认为 0
 *
 * 注意：
 *   - charCodeAt 返回的是 UTF-16 码元，不是码点（code point）
 *   - 对于 BMP 之外的字符（如 emoji），需要两个码元（代理对）
 *   - 获取码点应使用 codePointAt
 *
 * 核心原理：
 *   - 将 index 转换为整数
 *   - 检查索引是否在有效范围 [0, length - 1] 内
 *   - 在范围内则返回字符的 charCode，否则返回 NaN
 */

String.prototype.myCharCodeAt = function (index) {
  const str = String(this);

  // 未传参时默认为 0
  const position = index === undefined ? 0 : Number(index);

  // 转为整数
  const intPosition = Number.isNaN(position) ? 0 : Math.trunc(position);

  // 索引超出范围返回 NaN
  if (intPosition < 0 || intPosition >= str.length) {
    return NaN;
  }

  // 返回对应字符的 UTF-16 码元
  return str.charCodeAt(intPosition);
};

// ===== 测试 =====

console.log("========== 手写 String.prototype.charCodeAt ==========\n");

// --- 基本用法 ---
console.log("ABC".myCharCodeAt(0)); // 65（A 的码元）
console.log("ABC".myCharCodeAt(1)); // 66（B 的码元）
console.log("ABC".myCharCodeAt(2)); // 67（C 的码元）
console.log("abc".myCharCodeAt(0)); // 97（a 的码元）
console.log("0".myCharCodeAt(0)); // 48（字符 0 的码元）
console.log(" ".myCharCodeAt(0)); // 32（空格的码元）

// --- 边界情况 ---
console.log("hello".myCharCodeAt(-1)); // NaN（负数索引）
console.log("hello".myCharCodeAt(5)); // NaN（超出长度）
console.log("hello".myCharCodeAt(100)); // NaN（远超长度）

// --- 省略参数 ---
console.log("hello".myCharCodeAt()); // 104（默认索引 0，'h' 的码元）

// --- 非整数索引 ---
console.log("hello".myCharCodeAt(1.9)); // 101（截断为 1，'e' 的码元）

// --- 空字符串 ---
console.log("".myCharCodeAt(0)); // NaN

// --- 中文 ---
console.log("中".myCharCodeAt(0)); // 20013（"中" 的码元）

// --- 与原生对比 ---
console.log("\n--- 与原生对比 ---");
console.log("ABC".charCodeAt(0) === "ABC".myCharCodeAt(0)); // true
console.log(
  Number.isNaN("hello".charCodeAt(5)) === Number.isNaN("hello".myCharCodeAt(5)),
); // true

// --- 常见字符码元对照 ---
console.log("\n--- 常见字符码元 ---");
console.log("A = " + "A".myCharCodeAt(0)); // 65
console.log("Z = " + "Z".myCharCodeAt(0)); // 90
console.log("a = " + "a".myCharCodeAt(0)); // 97
console.log("z = " + "z".myCharCodeAt(0)); // 122
console.log("0 = " + "0".myCharCodeAt(0)); // 48
console.log("9 = " + "9".myCharCodeAt(0)); // 57
