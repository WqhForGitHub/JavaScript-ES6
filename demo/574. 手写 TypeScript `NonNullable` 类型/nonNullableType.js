/**
 * 手写 TypeScript `NonNullable` 类型
 *
 * 类型作用：
 *   从类型 T 中排除 null 和 undefined，构造一个非空类型。
 *   常用于接收可能为空的外部输入后做收窄。
 *
 * 实现思路：
 *   利用条件类型与联合：
 *     type NonNullable<T> = T extends null | undefined ? never : T;
 *   当 T 是联合类型（如 string | null）时分发，过滤掉 null/undefined。
 *
 * 运行时模拟：
 *   JS 提供函数过滤掉数组中的 null/undefined，或对单值做断言。
 */

// ===== TypeScript 类型实现 =====
// type NonNullable<T> = T extends null | undefined ? never : T;
//
// 示例：
//   type T1 = NonNullable<string | null | undefined>; // string
//   type T2 = NonNullable<number[] | null>;           // number[]

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Exclude<T, null | undefined>} NonNullableT 等价于 TS 的 NonNullable<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 NonNullable：对单值断言非空
 * @param {any} value
 * @returns {NonNullable<any>} 非空值
 * @throws {Error} 值为 null/undefined 时抛错
 */
function nonNullable(value) {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
  return value;
}

/**
 * 判断值是否非空
 * @param {any} value
 * @returns {boolean}
 */
function isNonNullable(value) {
  return value !== null && value !== undefined;
}

/**
 * 从数组中过滤掉 null 和 undefined
 * @template T
 * @param {Array<T>} arr
 * @returns {Array<NonNullable<T>>}
 */
function filterNonNullable(arr) {
  return arr.filter(isNonNullable);
}

// ===== 测试 =====

// 单值断言
console.log(nonNullable("hello")); // 'hello'
console.log(nonNullable(0)); // 0（0 是有效值，不被排除）
console.log(nonNullable("")); // ''（空串是有效值，不被排除）

try {
  nonNullable(null);
} catch (e) {
  console.log("catch:", e.message); // Value is null or undefined
}

try {
  nonNullable(undefined);
} catch (e) {
  console.log("catch:", e.message); // Value is null or undefined
}

// 判定函数
console.log(isNonNullable(null)); // false
console.log(isNonNullable(undefined)); // false
console.log(isNonNullable(0)); // true
console.log(isNonNullable(false)); // true
console.log(isNonNullable("")); // true

// 数组过滤
console.log(filterNonNullable([1, null, 2, undefined, 3])); // [ 1, 2, 3 ]
console.log(filterNonNullable(["a", null, "b", undefined])); // [ 'a', 'b' ]
console.log(filterNonNullable([null, undefined])); // []
console.log(filterNonNullable([0, false, ""])); // [ 0, false, '' ]（falsy 但非空值保留）
