/**
 * 手写 TypeScript `RequiredKeys`（提取必选键）
 *
 * 类型作用：
 *   从类型 T 中提取所有"必选"属性的键，组成一个联合类型。
 *   与 OptionalKeys 互补。
 *
 * 实现思路：
 *   利用 "空对象 {} 不可赋值给 Pick<T, K>" 判定 K 是否必选：
 *     type RequiredKeys<T> = {
 *       [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
 *     }[keyof T];
 *
 * 运行时模拟：
 *   与 OptionalKeys 对偶：通过 schema 过滤 optional !== true 的键。
 */

// ===== TypeScript 类型实现 =====
// type RequiredKeys<T> = {
//   [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
// }[keyof T];
//
// 示例：
//   interface User { name: string; age?: number; email?: string }
//   type R = RequiredKeys<User>; // 'name'

// ===== 运行时模拟函数 =====
/**
 * 通过 schema 提取必选键
 * @param {Object} schema 形如 { key: { optional?: boolean } }
 * @returns {Array<string>}
 */
function requiredKeys(schema) {
  return Object.keys(schema).filter(
    (k) => !(schema[k] && schema[k].optional === true),
  );
}

/**
 * 通过对象实例推断必选键：值非 undefined 的键视为"实际必选提供"
 * @param {Object} obj
 * @returns {Array<string>}
 */
function requiredKeysFromInstance(obj) {
  if (obj === null || typeof obj !== "object") return [];
  return Object.keys(obj).filter((k) => obj[k] !== undefined);
}

/**
 * OptionalKeys 的补集实现
 * @param {Object} schema
 * @returns {Array<string>}
 */
function requiredKeysComplement(schema) {
  const all = Object.keys(schema);
  const optional = new Set(
    Object.keys(schema).filter((k) => schema[k] && schema[k].optional === true),
  );
  return all.filter((k) => !optional.has(k));
}

// ===== 测试 =====

const userSchema = {
  name: { optional: false, type: "string" },
  age: { optional: true, type: "number" },
  email: { optional: true, type: "string" },
  role: { optional: false, type: "string" },
};

console.log(requiredKeys(userSchema)); // [ 'name', 'role' ]
console.log(requiredKeysComplement(userSchema)); // [ 'name', 'role' ]

const instance = {
  name: "Alice",
  age: undefined,
  email: "a@b.com",
  role: "admin",
};
console.log(requiredKeysFromInstance(instance)); // [ 'name', 'email', 'role' ]

// 全部必选
const allRequired = { a: { optional: false }, b: { optional: false } };
console.log(requiredKeys(allRequired)); // [ 'a', 'b' ]

// 全部可选
const allOptional = { a: { optional: true }, b: { optional: true } };
console.log(requiredKeys(allOptional)); // []

// 互斥校验：optionalKeys + requiredKeys = allKeys
const keys = Object.keys(userSchema);
const opt = new Set(
  keys.filter((k) => userSchema[k] && userSchema[k].optional === true),
);
const req = keys.filter((k) => !opt.has(k));
console.log(keys.length === opt.size + req.length); // true
