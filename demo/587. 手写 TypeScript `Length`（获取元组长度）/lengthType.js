/**
 * 手写 TypeScript `Length`（获取元组长度）
 *
 * 类型作用：
 *   获取元组类型 T 的长度（字面量数字类型）。
 *   例如 [string, number] -> 2。
 *
 * 实现思路：
 *   直接用索引访问 T['length']：
 *     type Length<T extends readonly any[]> = T['length'];
 *   元组的 length 属性是字面量数字类型，可被类型系统捕获。
 *
 * 运行时模拟：
 *   JS 直接访问数组 .length 属性。
 */

// ===== TypeScript 类型实现 =====
// type Length<T extends readonly any[]> = T['length'];
//
// 示例：
//   type L1 = Length<[1, 2, 3]>;       // 3
//   type L2 = Length<readonly string[]>; // number（变长数组）
//   type L3 = Length<[]>;               // 0

// ===== 运行时模拟函数 =====
/**
 * 模拟 Length：获取数组长度
 * @param {Array<any>|{length: number}} tuple 元组或类数组
 * @returns {number}
 */
function length(tuple) {
  // 字符串有 length 但 typeof 为 "string"，需单独放行
  if (typeof tuple === "string") return tuple.length;
  if (tuple === null || typeof tuple !== "object") {
    throw new TypeError("Expected an array or array-like object");
  }
  if (!("length" in tuple)) {
    throw new TypeError("Object has no length property");
  }
  return tuple.length;
}

/**
 * 严格版本：仅接受数组
 * @param {Array<any>} tuple
 * @returns {number}
 */
function lengthStrict(tuple) {
  if (!Array.isArray(tuple)) {
    throw new TypeError("Expected an array");
  }
  return tuple.length;
}

/**
 * 判断是否为定长元组（非稀疏数组、元素数固定）
 * 注意：JS 数组天然可变长，这里仅做"当前长度"判定
 * @param {Array<any>} arr
 * @returns {boolean}
 */
function isFixedLength(arr) {
  if (!Array.isArray(arr)) return false;
  // 检查是否稀疏
  for (let i = 0; i < arr.length; i++) {
    if (!(i in arr)) return false;
  }
  return true;
}

// ===== 测试 =====

console.log(length([1, 2, 3])); // 3
console.log(length([])); // 0
console.log(length(["a", "b", "c", "d"])); // 4
console.log(length([1])); // 1

// 类数组
console.log(length({ length: 5 })); // 5
console.log(length({ 0: "a", 1: "b", length: 2 })); // 2

// arguments 对象
function fn() {
  return length(arguments);
}
console.log(fn(1, 2, 3, 4)); // 4

// 字符串（有 length）
console.log(length("hello")); // 5

// 严格版本
console.log(lengthStrict([1, 2])); // 2
try {
  lengthStrict({ length: 5 });
} catch (e) {
  console.log("catch:", e.message); // Expected an array
}

// 定长判定
console.log(isFixedLength([1, 2, 3])); // true
console.log(isFixedLength(new Array(3))); // false（稀疏）
const sparse = [1, , 3]; // eslint-disable-line no-sparse-arrays
console.log(isFixedLength(sparse)); // false

// 非法输入
try {
  length(123);
} catch (e) {
  console.log("catch:", e.message); // Expected an array or array-like object
}
try {
  length({});
} catch (e) {
  console.log("catch:", e.message); // Object has no length property
}
