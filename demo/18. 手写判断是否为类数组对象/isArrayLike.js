/**
 * 手写判断是否为类数组对象
 *
 * 类数组（array-like）特征：
 *   - 不是数组，也不是函数
 *   - 有 length 属性，且为非负整数
 *   - 通常有按数字索引的属性（如 arguments、NodeList、字符串）
 *
 * 常见类数组：
 *   - arguments
 *   - 字符串（"abc" 有 length 和索引，但通常也算类数组）
 *   - { length: 0 }
 *   - NodeList、HTMLCollection（DOM 环境）
 *
 * 实现思路：
 *   1. 排除 null/undefined
 *   2. 排除数组和函数（按需，部分实现允许函数）
 *   3. length 是 number，非负，整数，有限
 *   4. length 不超过 2^32 - 1（与数组一致）
 */

function isArrayLike(value) {
  // 1. null / undefined
  if (value == null) {
    return false;
  }

  // 2. 函数不算类数组（函数有 length，但是形参个数）
  if (typeof value === "function") {
    return false;
  }

  // 3. 字符串天然是类数组（有 length 和索引），可选择返回 true
  if (typeof value === "string") {
    return true;
  }

  // 4. 数组本身就是数组，不算"类数组"
  if (Array.isArray(value)) {
    return false;
  }

  // 5. 必须有 length 属性，且为合法的非负整数
  const length = value.length;
  if (typeof length !== "number") {
    return false;
  }

  // 6. length 必须是有限数、非负、整数，且不超过 2^32 - 1
  if (
    !Number.isFinite(length) ||
    length < 0 ||
    Math.floor(length) !== length ||
    length > 2 ** 32 - 1
  ) {
    return false;
  }

  return true;
}

// ===== 测试 =====

// --- 典型类数组 ---
console.log(isArrayLike({ 0: "a", 1: "b", length: 2 })); // true
console.log(isArrayLike({ length: 0 })); // true
console.log(isArrayLike({ length: 3 })); // true

// --- arguments ---
function fn() {
  return arguments;
}
console.log(isArrayLike(fn(1, 2, 3))); // true

// --- 字符串 ---
console.log(isArrayLike("hello")); // true

// --- 数组（本身是数组，不算类数组）---
console.log(isArrayLike([1, 2, 3])); // false
console.log(isArrayLike([])); // false

// --- 函数（length 是形参个数，不算类数组）---
console.log(isArrayLike(function (a, b) {})); // false

// --- 非类数组对象 ---
console.log(isArrayLike({})); // false（无 length）
console.log(isArrayLike({ length: -1 })); // false（负数）
console.log(isArrayLike({ length: 1.5 })); // false（非整数）
console.log(isArrayLike({ length: Infinity })); // false（非有限）
console.log(isArrayLike({ length: "2" })); // false（length 不是 number）
console.log(isArrayLike({ length: 2 ** 32 })); // false（超过最大长度）

// --- Map / Set（有 size 但无 length，不算类数组）---
console.log(isArrayLike(new Map())); // false
console.log(isArrayLike(new Set())); // false

// --- null / undefined / 基本类型 ---
console.log(isArrayLike(null)); // false
console.log(isArrayLike(undefined)); // false
console.log(isArrayLike(123)); // false（number 没有 length）
console.log(isArrayLike(true)); // false
