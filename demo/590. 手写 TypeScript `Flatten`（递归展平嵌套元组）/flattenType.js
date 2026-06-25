/**
 * 手写 TypeScript `Flatten`（递归展平嵌套元组）
 *
 * 类型作用：
 *   将任意深度嵌套的元组类型递归展平为一维元组。
 *   例如 [1, [2, [3]], 4] -> [1, 2, 3, 4]。
 *
 * 实现思路：
 *   递归解构元组：若当前元素是元组则递归展平它，否则保留：
 *     type Flatten<T extends readonly any[]> =
 *       T extends [infer First, ...infer Rest]
//          ? First extends readonly any[]
//            ? [...Flatten<First>, ...Flatten<Rest>]
//            : [First, ...Flatten<Rest>]
//          : [];
 *
 * 运行时模拟：
 *   JS 提供递归展平实现（Array.prototype.flat(Infinity) 或手写递归）。
 */

// ===== TypeScript 类型实现 =====
// type Flatten<T extends readonly any[]> =
//   T extends [infer First, ...infer Rest]
//     ? First extends readonly any[]
//       ? [...Flatten<First>, ...Flatten<Rest>]
//       : [First, ...Flatten<Rest>]
//     : [];
//
// 示例：
//   type R = Flatten<[1, [2, [3]], 4]>; // [1, 2, 3, 4]

// ===== 运行时模拟函数 =====
/**
 * 模拟 Flatten：递归展平任意深度嵌套的数组
 * @param {Array<any>} arr 嵌套数组
 * @returns {Array<any>} 一维数组
 */
function flatten(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * 递归 reduce 版本
 * @param {Array<any>} arr
 * @returns {Array<any>}
 */
function flattenReduce(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  return arr.reduce(
    (acc, item) =>
      Array.isArray(item) ? acc.concat(flattenReduce(item)) : acc.concat(item),
    [],
  );
}

/**
 * 使用原生 flat(Infinity)
 * @param {Array<any>} arr
 * @returns {Array<any>}
 */
function flattenNative(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  return arr.flat(Infinity);
}

// ===== 测试 =====

console.log(flatten([1, [2, [3]], 4])); // [ 1, 2, 3, 4 ]
console.log(flatten([1, [2, [3, [4, [5]]]]])); // [ 1, 2, 3, 4, 5 ]
console.log(flatten([])); // []
console.log(flatten([1, 2, 3])); // [ 1, 2, 3 ]（已是一维）
console.log(flatten([[1], [2], [3]])); // [ 1, 2, 3 ]
console.log(flatten([1, [2, [3, [4]], 5], 6])); // [ 1, 2, 3, 4, 5, 6 ]

// 混合元素
console.log(flatten([1, ["a", [true, [null]]], "b"])); // [ 1, 'a', true, null, 'b' ]

// reduce 版本
console.log(flattenReduce([1, [2, [3]], 4])); // [ 1, 2, 3, 4 ]

// 原生版本
console.log(flattenNative([1, [2, [3]], 4])); // [ 1, 2, 3, 4 ]

// 空嵌套
console.log(flatten([[[[]]]])); // []
console.log(flatten([[], [[]], [[], []]])); // []

// 不修改原数组
const original = [1, [2, [3]]];
const flat = flatten(original);
console.log(original); // [ 1, [ 2, [3] ] ]（未变）
console.log(flat); // [ 1, 2, 3 ]

// 非数组抛错
try {
  flatten(123);
} catch (e) {
  console.log("catch:", e.message); // Expected an array
}
