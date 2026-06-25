/**
 * 手写 TypeScript `Concat`（元组拼接）
 *
 * 类型作用：
 *   将两个元组类型 T 和 U 拼接成一个新元组。
 *   例如 [1, 2] + [3, 4] -> [1, 2, 3, 4]。
 *
 * 实现思路：
 *   利用 variadic tuple types 的展开语法：
 *     type Concat<T extends readonly any[], U extends readonly any[]> =
 *       [...T, ...U];
 *
 * 运行时模拟：
 *   JS 直接用 [...t, ...u] 或 arr.concat()。
 */

// ===== TypeScript 类型实现 =====
// type Concat<T extends readonly any[], U extends readonly any[]> =
//   [...T, ...U];
//
// 示例：
//   type R = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]

// ===== 运行时模拟函数 =====
/**
 * 模拟 Concat：拼接两个数组
 * @param {Array<any>} a 元组 a
 * @param {Array<any>} b 元组 b
 * @returns {Array<any>} 拼接后的新元组
 */
function concat(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError("Expected two arrays");
  }
  return [...a, ...b];
}

/**
 * 不可变拼接：使用 Array.prototype.concat
 * @param {Array<any>} a
 * @param {Array<any>} b
 * @returns {Array<any>}
 */
function concatNative(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError("Expected two arrays");
  }
  return a.concat(b);
}

/**
 * 多元组拼接
 * @param {...Array<any>} arrays
 * @returns {Array<any>}
 */
function concatMany(...arrays) {
  const result = [];
  for (const arr of arrays) {
    if (!Array.isArray(arr)) {
      throw new TypeError("All arguments must be arrays");
    }
    for (const item of arr) result.push(item);
  }
  return result;
}

// ===== 测试 =====

console.log(concat([1, 2], [3, 4])); // [ 1, 2, 3, 4 ]
console.log(concat([], [1, 2])); // [ 1, 2 ]
console.log(concat([1, 2], [])); // [ 1, 2 ]
console.log(concat([], [])); // []

// 不同类型元素
console.log(concat([1, "a"], [true, null])); // [ 1, 'a', true, null ]

// 原生版本
console.log(concatNative([1, 2], [3, 4])); // [ 1, 2, 3, 4 ]

// 多元组
console.log(concatMany([1], [2], [3], [4])); // [ 1, 2, 3, 4 ]
console.log(concatMany([1, 2], [3], [], [4, 5])); // [ 1, 2, 3, 4, 5 ]

// 不修改原数组
const a = [1, 2];
const b = [3, 4];
const c = concat(a, b);
console.log(a); // [ 1, 2 ]（未变）
console.log(b); // [ 3, 4 ]（未变）
console.log(c); // [ 1, 2, 3, 4 ]

// 非数组抛错
try {
  concat([1], 2);
} catch (e) {
  console.log("catch:", e.message); // Expected two arrays
}
