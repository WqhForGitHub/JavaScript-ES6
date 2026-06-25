/**
 * 手写 TypeScript `Required` 类型
 *
 * 类型作用：
 *   将类型 T 的所有属性变为必选（移除 ? 修饰符）。
 *   是 Partial 的逆操作。
 *
 * 实现思路：
 *   使用 mapped type 遍历 keyof T，用 -? 移除可选修饰符：
 *     [P in keyof T]-?: T[P]
 *
 * 运行时模拟：
 *   JS 没有"必选"概念，这里通过运行时校验：检查对象是否包含全部必需字段，
 *   缺少任意字段则抛出错误，模拟 TS 在编译期对 Required 的强约束。
 */

// ===== TypeScript 类型实现 =====
// type Required<T> = {
//   [P in keyof T]-?: T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T
 * @typedef {Object} RequiredT 等价于 TS 的 Required<T>
 * @property {NonNullable<T[keyof T]>} key 所有属性都变为必选且非 undefined
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Required：校验对象是否包含全部必选字段（值不为 undefined）
 * @param {Object} source 待校验对象
 * @param {string[]} requiredKeys 必选字段列表
 * @returns {Object} 校验通过返回原对象
 * @throws {Error} 缺少字段或字段值为 undefined 时抛错
 */
function enforceRequired(source, requiredKeys) {
  if (source === null || typeof source !== "object") {
    throw new Error("source must be an object");
  }
  for (const key of requiredKeys) {
    if (!(key in source) || source[key] === undefined) {
      throw new Error(`Required property "${key}" is missing or undefined`);
    }
  }
  return source;
}

/**
 * 从一个"模板对象"推断必选字段集合，返回校验函数
 * @param {Object} template 模板（所有键视为必选）
 * @returns {(obj: Object) => Object}
 */
function createRequiredValidator(template) {
  const keys = Object.keys(template);
  return (obj) => enforceRequired(obj, keys);
}

// ===== 测试 =====

const userRequired = createRequiredValidator({
  name: "",
  age: 0,
  email: "",
});

// 合法：包含全部字段
console.log(userRequired({ name: "Alice", age: 18, email: "a@b.com" }));
// { name: 'Alice', age: 18, email: 'a@b.com' }

// 非法：缺少字段
try {
  userRequired({ name: "Alice", age: 18 });
} catch (e) {
  console.log("catch:", e.message); // catch: Required property "email" is missing or undefined
}

// 非法：字段值为 undefined
try {
  userRequired({ name: "Alice", age: 18, email: undefined });
} catch (e) {
  console.log("catch:", e.message); // catch: Required property "email" is missing or undefined
}
