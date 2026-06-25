/**
 * 手写 TypeScript `OmitByType`（按值类型移除属性）
 *
 * 类型作用：
 *   从对象类型 T 中移除所有"值类型可分配给 U"的属性，
 *   保留其余属性。常用于过滤掉某类字段（如移除所有函数属性）。
 *
 * 实现思路：
 *   先用映射类型构造一个"键 -> 自身或 never"的字典，
 *   再用索引取键集合，最后 Pick 保留：
 *     type OmitByType<T, U> = Pick<
//        T,
//        { [K in keyof T]: T[K] extends U ? never : K }[keyof T]
//      >;
 *   解释：对每个键 K，若 T[K] 可分配给 U 则映射为 never（被排除），
 *   否则保留键 K，最后用 Pick 选出保留下来的键。
 *
 * 运行时模拟：
 *   JS 通过 typeof / instanceof 判断每个属性的值类型，过滤掉匹配的键。
 */

// ===== TypeScript 类型实现 =====
// type OmitByType<T, U> = Pick<
//   T,
//   { [K in keyof T]: T[K] extends U ? never : K }[keyof T]
// >;
//
// 示例：
//   interface Config { host: string; port: number; handler: () => void; log: boolean }
//   type R = OmitByType<Config, Function>; // { host: string; port: number; log: boolean }

// ===== 运行时模拟函数 =====
/**
 * 模拟 OmitByType：按值类型名移除属性
 * @param {Object} obj 源对象
 * @param {string|Array<string>} typeNames 要移除的值类型名（如 'function'）
 * @returns {Object} 移除指定类型属性后的新对象
 */
function omitByType(obj, typeNames) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  const excludes = Array.isArray(typeNames)
    ? new Set(typeNames)
    : new Set([typeNames]);
  const result = {};
  for (const key of Object.keys(obj)) {
    const valueTypeName = getTypeName(obj[key]);
    if (!excludes.has(valueTypeName)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 按构造函数移除属性（对应 TS 中 U 为具体类）
 * @param {Object} obj
 * @param {Function|Array<Function>} constructors 要移除的构造函数
 * @returns {Object}
 */
function omitByConstructor(obj, constructors) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  const ctors = Array.isArray(constructors) ? constructors : [constructors];
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const shouldOmit = ctors.some(
      (Ctor) =>
        typeof Ctor === "function" && value !== null && value instanceof Ctor,
    );
    if (!shouldOmit) result[key] = value;
  }
  return result;
}

/**
 * 获取值的类型名（小写）
 * @param {any} value
 * @returns {string}
 */
function getTypeName(value) {
  if (value === null) return "null";
  if (typeof value === "function") return "function";
  const m = Object.prototype.toString.call(value).match(/^\[object (\w+)\]$/);
  return m ? m[1].toLowerCase() : "object";
}

// ===== 测试 =====

const config = {
  host: "localhost",
  port: 8080,
  handler: () => {},
  log: true,
  callback: function () {},
  retries: 3,
};

// 移除所有函数属性
console.log(omitByType(config, "function"));
// { host: 'localhost', port: 8080, log: true, retries: 3 }

// 移除字符串属性
console.log(omitByType(config, "string"));
// { port: 8080, handler: [Function], log: true, callback: [Function], retries: 3 }

// 移除多种类型
console.log(omitByType(config, ["function", "boolean"]));
// { host: 'localhost', port: 8080, retries: 3 }

// 按构造函数移除
const data = {
  name: "Alice",
  birth: new Date(1990, 0, 1),
  pattern: /abc/,
  count: 5,
};
console.log(omitByConstructor(data, [Date, RegExp]));
// { name: 'Alice', count: 5 }

// 移除数字属性
console.log(omitByType({ a: 1, b: "x", c: 2, d: true }, "number"));
// { b: 'x', d: true }

// 空对象
console.log(omitByType({}, "function")); // {}
console.log(omitByType(null, "function")); // {}

// 不存在该类型属性
console.log(omitByType({ a: 1, b: 2 }, "string")); // { a: 1, b: 2 }（全部保留）

// null/undefined 处理
console.log(omitByType({ a: null, b: undefined, c: 1 }, ["null", "undefined"]));
// { c: 1 }
