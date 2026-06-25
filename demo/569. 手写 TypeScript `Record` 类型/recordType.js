/**
 * 手写 TypeScript `Record` 类型
 *
 * 类型作用：
 *   构造一个对象类型，其属性键为 K（联合类型），属性值统一为 T。
 *   常用于映射表、字典、状态机等场景。
 *
 * 实现思路：
 *   使用 mapped type 遍历键集合 K：
 *     [P in K]: T
 *   约束 K extends keyof any（即 string | number | symbol）。
 *
 * 运行时模拟：
 *   JS 提供一个工厂函数，给定键数组和值工厂，生成一个完整的映射对象。
 */

// ===== TypeScript 类型实现 =====
// type Record<K extends keyof any, T> = {
//   [P in K]: T;
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template K, T
 * @typedef {Object} RecordT 等价于 TS 的 Record<K, T>
 * @property {T} key 每个键 K 对应值 T
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Record：用键数组与默认值（或值工厂）构造一个映射对象
 * @param {Array<string|number|symbol>} keys 键集合
 * @param {T|((key: string|number|symbol) => T)} valueOrFactory 值或值工厂
 * @returns {Record<string, T>} 映射对象
 */
function record(keys, valueOrFactory) {
  const result = {};
  const isFactory = typeof valueOrFactory === "function";
  for (const key of keys) {
    result[key] = isFactory ? valueOrFactory(key) : valueOrFactory;
  }
  return result;
}

/**
 * 断言对象符合 Record 语义：所有给定键都存在且值类型一致
 * @param {Object} obj
 * @param {Array<string>} keys
 * @param {(value: any) => boolean} predicate
 * @returns {boolean}
 */
function isRecordOf(obj, keys, predicate) {
  if (obj === null || typeof obj !== "object") return false;
  for (const key of keys) {
    if (!(key in obj) || !predicate(obj[key])) return false;
  }
  return true;
}

// ===== 测试 =====

// 用固定值构造映射
const zeroMap = record(["a", "b", "c"], 0);
console.log(zeroMap); // { a: 0, b: 0, c: 0 }

// 用值工厂构造映射
const indexMap = record(["x", "y", "z"], (k) => `value-${k}`);
console.log(indexMap); // { x: 'value-x', y: 'value-y', z: 'value-z' }

// 数字键
const numMap = record([1, 2, 3], true);
console.log(numMap); // { '1': true, '2': true, '3': true }

// 类型断言
console.log(
  isRecordOf({ a: 1, b: 2 }, ["a", "b"], (v) => typeof v === "number"),
); // true
console.log(isRecordOf({ a: 1 }, ["a", "b"], (v) => typeof v === "number")); // false（缺 b）
console.log(
  isRecordOf({ a: "x", b: 2 }, ["a", "b"], (v) => typeof v === "number"),
); // false（a 非数字）
