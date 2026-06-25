/**
 * 手写 TypeScript `PickByType`（按值类型选取属性）
 *
 * 类型作用：
 *   从对象类型 T 中选取所有"值类型可分配给 U"的属性，
 *   保留这些属性。与 OmitByType 互补。
 *   常用于提取某类字段（如提取所有函数属性作为方法集）。
 *
 * 实现思路：
 *   与 OmitByType 对偶——映射时把匹配的键保留，不匹配的设为 never：
 *     type PickByType<T, U> = Pick<
//        T,
//        { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
//      >;
 *
 * 运行时模拟：
 *   JS 通过 typeof / instanceof 判断每个属性的值类型，只保留匹配的键。
 */

// ===== TypeScript 类型实现 =====
// type PickByType<T, U> = Pick<
//   T,
//   { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
// >;
//
// 示例：
//   interface Config { host: string; port: number; handler: () => void; log: boolean }
//   type R = PickByType<Config, Function>; // { handler: () => void }

// ===== 运行时模拟函数 =====
/**
 * 模拟 PickByType：按值类型名选取属性
 * @param {Object} obj 源对象
 * @param {string|Array<string>} typeNames 要选取的值类型名（如 'function'）
 * @returns {Object} 仅包含匹配类型属性的新对象
 */
function pickByType(obj, typeNames) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  const includes = Array.isArray(typeNames)
    ? new Set(typeNames)
    : new Set([typeNames]);
  const result = {};
  for (const key of Object.keys(obj)) {
    const valueTypeName = getTypeName(obj[key]);
    if (includes.has(valueTypeName)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 按构造函数选取属性（对应 TS 中 U 为具体类）
 * @param {Object} obj
 * @param {Function|Array<Function>} constructors
 * @returns {Object}
 */
function pickByConstructor(obj, constructors) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  const ctors = Array.isArray(constructors) ? constructors : [constructors];
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const shouldPick = ctors.some(
      (Ctor) =>
        typeof Ctor === "function" && value !== null && value instanceof Ctor,
    );
    if (shouldPick) result[key] = value;
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

// 选取所有函数属性
console.log(pickByType(config, "function"));
// { handler: [Function], callback: [Function] }

// 选取字符串属性
console.log(pickByType(config, "string"));
// { host: 'localhost' }

// 选取多种类型
console.log(pickByType(config, ["function", "boolean"]));
// { handler: [Function], log: true, callback: [Function] }

// 选取数字属性
console.log(pickByType({ a: 1, b: "x", c: 2, d: true }, "number"));
// { a: 1, c: 2 }

// 按构造函数选取
const data = {
  name: "Alice",
  birth: new Date(1990, 0, 1),
  pattern: /abc/,
  count: 5,
};
console.log(pickByConstructor(data, Date));
// { birth: 1990-01-01T00:00:00.000Z }
console.log(pickByConstructor(data, [Date, RegExp]));
// { birth: ..., pattern: /abc/ }

// 空对象
console.log(pickByType({}, "function")); // {}
console.log(pickByType(null, "function")); // {}

// 不存在该类型属性
console.log(pickByType({ a: 1, b: 2 }, "string")); // {}（无字符串属性）

// null/undefined 处理
console.log(pickByType({ a: null, b: undefined, c: 1 }, ["null", "undefined"]));
// { a: null, b: undefined }

// 互补验证：pickByType + omitByType = 原对象（键集合）
// 内联实现 omitByType 以验证互补性
function omitByType(obj, typeNames) {
  if (obj === null || typeof obj !== "object") return {};
  const excludes = Array.isArray(typeNames)
    ? new Set(typeNames)
    : new Set([typeNames]);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!excludes.has(getTypeName(obj[key]))) result[key] = obj[key];
  }
  return result;
}

const allKeys = new Set(Object.keys(config));
const pickedKeys = new Set(Object.keys(pickByType(config, "function")));
const omittedKeys = new Set(Object.keys(omitByType(config, "function")));
console.log([...allKeys].every((k) => pickedKeys.has(k) || omittedKeys.has(k))); // true
