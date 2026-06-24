/**
 * 手写判断是否为空数组
 *
 * "空数组"定义：是一个数组，且 length === 0
 *
 * 注意：
 *   - 必须先判断是数组，再判断长度
 *   - 非数组值（null、对象、字符串等）应返回 false
 *
 * 实现思路：
 *   1. 用 Array.isArray 判断是否为数组
 *   2. 检查 length 属性是否为 0
 */

function isEmptyArray(value) {
  // 1. 必须是数组
  if (!Array.isArray(value)) {
    return false;
  }
  // 2. 长度为 0 即空数组
  return value.length === 0;
}

// ===== 测试 =====

// --- 空数组 ---
console.log(isEmptyArray([])); // true
console.log(isEmptyArray(new Array())); // true

// --- 非空数组 ---
console.log(isEmptyArray([1, 2, 3])); // false
console.log(isEmptyArray([undefined])); // false（有一个元素）
console.log(isEmptyArray([null])); // false
console.log(isEmptyArray(new Array(3))); // false（长度为 3 的稀疏数组）

// --- 非数组 ---
console.log(isEmptyArray(null)); // false
console.log(isEmptyArray(undefined)); // false
console.log(isEmptyArray({})); // false
console.log(isEmptyArray({ length: 0 })); // false（类数组对象不算数组）
console.log(isEmptyArray("")); // false（空字符串不算数组）
console.log(isEmptyArray(new Set())); // false
console.log(isEmptyArray(new Map())); // false
console.log(isEmptyArray(42)); // false
