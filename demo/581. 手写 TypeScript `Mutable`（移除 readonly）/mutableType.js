/**
 * 手写 TypeScript `Mutable`（移除 readonly）
 *
 * 类型作用：
 *   将类型 T 的所有 readonly 属性变为可变（移除 readonly 修饰符）。
 *   是 Readonly 的逆操作，也称 Writable。
 *
 * 实现思路：
 *   使用 mapped type 的 -readonly 修饰符移除只读：
 *     type Mutable<T> = {
 *       -readonly [P in keyof T]: T[P];
 *     };
 *
 * 运行时模拟：
 *   JS 中 Object.freeze 是只读的运行时实现，Mutable 对应"解冻"——
 *   返回一个全新的可变浅拷贝（无法真正解冻已被 freeze 的对象本身）。
 */

// ===== TypeScript 类型实现 =====
// type Mutable<T> = {
//   -readonly [P in keyof T]: T[P];
// };
//
// 示例：
//   interface R { readonly a: number; readonly b: string }
//   type M = Mutable<R>; // { a: number; b: string }

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Object} MutableT 等价于 TS 的 Mutable<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Mutable：返回一个可变的浅拷贝（即使原对象被冻结）
 * @param {Object} source 源对象（可能被冻结）
 * @returns {Object} 可变的新对象
 */
function mutable(source) {
  if (source === null || typeof source !== "object") {
    return source;
  }
  if (Array.isArray(source)) {
    return [...source];
  }
  return { ...source };
}

/**
 * 深度解冻：递归返回一个完全可变的深拷贝
 * @param {any} source
 * @returns {any}
 */
function deepMutable(source) {
  if (source === null || typeof source !== "object") {
    return source;
  }
  if (Array.isArray(source)) {
    return source.map(deepMutable);
  }
  const result = {};
  for (const key of Object.keys(source)) {
    result[key] = deepMutable(source[key]);
  }
  return result;
}

/**
 * 判断对象是否可变（未被冻结）
 * @param {Object} obj
 * @returns {boolean}
 */
function isMutable(obj) {
  if (obj === null || typeof obj !== "object") return true;
  return !Object.isFrozen(obj);
}

// ===== 测试 =====

const frozen = Object.freeze({ a: 1, b: { c: 2 } });
console.log(Object.isFrozen(frozen)); // true
console.log(isMutable(frozen)); // false

// Mutable 后返回可变副本
const unfrozen = mutable(frozen);
console.log(unfrozen); // { a: 1, b: { c: 2 } }
console.log(isMutable(unfrozen)); // true

// 现在可以修改
unfrozen.a = 99;
console.log(unfrozen.a); // 99

// 浅 mutable 不递归解冻嵌套对象
console.log(Object.isFrozen(unfrozen.b)); // true（b 仍是冻结的）
try {
  unfrozen.b.c = 100;
} catch (e) {
  console.log("catch:", e.message); // Cannot assign to read only property 'c'
}

// 深度解冻
const deepUnfrozen = deepMutable(frozen);
console.log(Object.isFrozen(deepUnfrozen)); // false
console.log(Object.isFrozen(deepUnfrozen.b)); // false
deepUnfrozen.b.c = 100;
console.log(deepUnfrozen.b.c); // 100

// 数组解冻
const frozenArr = Object.freeze([1, 2, 3]);
const unfrozenArr = mutable(frozenArr);
console.log(Object.isFrozen(frozenArr)); // true
console.log(Object.isFrozen(unfrozenArr)); // false
unfrozenArr.push(4);
console.log(unfrozenArr); // [ 1, 2, 3, 4 ]

// 原始值直接返回
console.log(mutable(42)); // 42
console.log(mutable(null)); // null
