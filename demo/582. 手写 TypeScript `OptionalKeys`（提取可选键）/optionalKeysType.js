/**
 * 手写 TypeScript `OptionalKeys`（提取可选键）
 *
 * 类型作用：
 *   从类型 T 中提取所有"可选"属性的键，组成一个联合类型。
 *   常用于生成 Patch / Update 类型时只允许修改可选字段。
 *
 * 实现思路：
 *   利用 "空对象 {} 可赋值给 Pick<T, K>" 这一特性判定 K 是否可选：
 *     type OptionalKeys<T> = {
 *       [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
 *     }[keyof T];
 *   因为可选属性允许缺失，所以 {} 可赋给 Pick<T, K>；必选属性则不行。
 *
 * 运行时模拟：
 *   JS 没有静态可选信息，这里通过"属性描述符 + 默认值约定"模拟——
 *   以一个 schema（声明哪些键可选）作为输入，返回可选键列表。
 */

// ===== TypeScript 类型实现 =====
// type OptionalKeys<T> = {
//   [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
// }[keyof T];
//
// 示例：
//   interface User { name: string; age?: number; email?: string }
//   type O = OptionalKeys<User>; // 'age' | 'email'

// ===== 运行时模拟函数 =====
/**
 * 通过 schema 提取可选键
 * schema 形如 { key: { optional: true, type: 'string' } }
 * @param {Object} schema
 * @returns {Array<string>}
 */
function optionalKeys(schema) {
  return Object.keys(schema).filter(
    (k) => schema[k] && schema[k].optional === true,
  );
}

/**
 * 通过对象实例推断可选键：值为 undefined 的键视为"实际可选"
 * 注意：这只能反映运行时实际值，不能等同于类型上的可选
 * @param {Object} obj
 * @returns {Array<string>}
 */
function optionalKeysFromInstance(obj) {
  if (obj === null || typeof obj !== "object") return [];
  return Object.keys(obj).filter((k) => obj[k] === undefined);
}

/**
 * 利用"空对象赋值兼容性"模拟 TS 的 {} extends Pick<T, K> 判定
 * 给定键集合，返回其中"可缺省"（即使不提供也算合法）的键
 * @param {Object} schema 形如 { key: { optional?: boolean } }
 * @returns {Array<string>}
 */
function inferOptionalKeys(schema) {
  return Object.keys(schema).filter((k) => {
    const def = schema[k] || {};
    return def.optional === true;
  });
}

// ===== 测试 =====

const userSchema = {
  name: { optional: false, type: "string" },
  age: { optional: true, type: "number" },
  email: { optional: true, type: "string" },
  role: { optional: false, type: "string" },
};

console.log(optionalKeys(userSchema)); // [ 'age', 'email' ]

const withDefaults = {
  name: "Alice",
  age: undefined,
  email: "a@b.com",
  role: "admin",
};
console.log(optionalKeysFromInstance(withDefaults)); // [ 'age' ]

// 不同 schema
const productSchema = {
  id: { optional: false },
  name: { optional: false },
  discount: { optional: true },
  tags: { optional: true },
};
console.log(inferOptionalKeys(productSchema)); // [ 'discount', 'tags' ]

// 全部必选
const allRequired = { a: { optional: false }, b: { optional: false } };
console.log(optionalKeys(allRequired)); // []

// 全部可选
const allOptional = { a: { optional: true }, b: { optional: true } };
console.log(optionalKeys(allOptional)); // [ 'a', 'b' ]
