/**
 * 手写 TypeScript `Includes`（元组是否包含某类型）
 *
 * 类型作用：
 *   判断元组类型 T 是否包含类型 U，返回 true / false 字面量类型。
 *
 * 实现思路：
 *   递归解构元组，逐项用 Equal<First, U> 比较：
 *     type Includes<T extends readonly any[], U> =
 *       T extends [infer First, ...infer Rest]
 *         ? Equal<First, U> extends true
 *           ? true
 *           : Includes<Rest, U>
 *         : false;
 *   Equal 用于精确判断两个类型相等（通常用 (<T>() => T extends X ? 1 : 0)
 *   与 (<T>() => T extends Y ? 1 : 0) 相互 extends 判定）。
 *
 * 运行时模拟：
 *   JS 用 Array.prototype.includes 或 Object.is 逐项比较。
 */

// ===== TypeScript 类型实现 =====
// type Equal<X, Y> =
//   (<T>() => T extends X ? 1 : 0) extends (<T>() => T extends Y ? 1 : 0) ? true : false;
//
// type Includes<T extends readonly any[], U> =
//   T extends [infer First, ...infer Rest]
//     ? Equal<First, U> extends true
//       ? true
//       : Includes<Rest, U>
//     : false;
//
// 示例：
//   type R1 = Includes<[1, 2, 3], 2>; // true
//   type R2 = Includes<[1, 2, 3], 5>; // false

// ===== 运行时模拟函数 =====
/**
 * 模拟 Includes：判断数组是否包含某值（使用 Object.is 严格相等）
 * @param {Array<any>} arr 元组
 * @param {any} value 目标值
 * @returns {boolean}
 */
function includes(arr, value) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  for (const item of arr) {
    if (Object.is(item, value)) return true;
  }
  return false;
}

/**
 * 递归版本（更贴近 TS 类型实现思路）
 * @param {Array<any>} arr
 * @param {any} value
 * @returns {boolean}
 */
function includesRecursive(arr, value) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  if (arr.length === 0) return false;
  const [first, ...rest] = arr;
  if (Object.is(first, value)) return true;
  return includesRecursive(rest, value);
}

/**
 * 按类型判断（对应"类型包含"而非值相等）
 * @param {Array<any>} arr
 * @param {string} typeName 类型名
 * @returns {boolean}
 */
function includesType(arr, typeName) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  return arr.some((v) => {
    if (v === null) return typeName === "null";
    if (typeof v === "function") return typeName === "function";
    const m = Object.prototype.toString.call(v).match(/^\[object (\w+)\]$/);
    return m ? m[1].toLowerCase() === typeName : false;
  });
}

// ===== 测试 =====

// 值包含
console.log(includes([1, 2, 3], 2)); // true
console.log(includes([1, 2, 3], 5)); // false
console.log(includes(["a", "b", "c"], "b")); // true
console.log(includes([], 1)); // false

// 特殊值：NaN
console.log(includes([NaN], NaN)); // true（Object.is 区分 NaN）
console.log(includes([0], -0)); // false（Object.is 区分 +0/-0）

// 递归版本
console.log(includesRecursive([1, 2, 3], 2)); // true
console.log(includesRecursive([1, 2, 3], 5)); // false
console.log(includesRecursive([], 1)); // false

// 类型包含
console.log(includesType([1, "a", true], "number")); // true
console.log(includesType([1, "a", true], "boolean")); // true
console.log(includesType([1, "a", true], "string")); // true
console.log(includesType([1, "a", true], "object")); // false
console.log(includesType([new Date(), 1], "date")); // true

// 非数组抛错
try {
  includes(123, 1);
} catch (e) {
  console.log("catch:", e.message); // Expected an array
}
