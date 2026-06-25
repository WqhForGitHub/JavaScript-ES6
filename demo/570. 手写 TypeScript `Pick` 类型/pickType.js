/**
 * 手写 TypeScript `Pick` 类型
 *
 * 类型作用：
 *   从类型 T 中挑选一组属性 K（K 必须是 keyof T 的子集），
 *   构造一个只包含这些属性的新类型。
 *
 * 实现思路：
 *   使用 mapped type 遍历键集合 K（约束 K extends keyof T）：
 *     [P in K]: T[P]
 *
 * 运行时模拟：
 *   JS 通过遍历指定的键集合，从源对象上摘取对应属性组成新对象。
 */

// ===== TypeScript 类型实现 =====
// type Pick<T, K extends keyof T> = {
//   [P in K]: T[P];
// };

// ===== JSDoc 等价类型表示 =====
/**
 * @template T, K
 * @typedef {Pick<T, K>} PickT 等价于 TS 的 Pick<T, K>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Pick：从源对象摘取指定键集合
 * @param {Object} source 源对象
 * @param {Array<string>} keys 要摘取的键
 * @returns {Object} 仅包含指定键的新对象
 */
function pick(source, keys) {
  if (source === null || typeof source !== "object") {
    return {};
  }
  const result = {};
  for (const key of keys) {
    if (key in source) {
      result[key] = source[key];
    }
  }
  return result;
}

// ===== 测试 =====

const user = { name: "Alice", age: 18, email: "a@b.com", role: "admin" };

// 摘取部分字段
console.log(pick(user, ["name", "age"])); // { name: 'Alice', age: 18 }

// 摘取单个字段
console.log(pick(user, ["email"])); // { email: 'a@b.com' }

// 摘取不存在的键（安全忽略）
console.log(pick(user, ["name", "nonExist"])); // { name: 'Alice' }

// 摘取全部字段
console.log(pick(user, ["name", "age", "email", "role"]));
// { name: 'Alice', age: 18, email: 'a@b.com', role: 'admin' }

// 空 keys
console.log(pick(user, [])); // {}

// 源非对象
console.log(pick(null, ["a"])); // {}
