/**
 * 手写 TypeScript `Omit` 类型
 *
 * 类型作用：
 *   从类型 T 中剔除一组属性 K，构造一个不包含这些属性的新类型。
 *   是 Pick 的反向操作。
 *
 * 实现思路：
 *   先用 Exclude<keyof T, K> 求出"要保留的键"，再用 Pick 选取：
 *     type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
 *
 * 运行时模拟：
 *   JS 通过浅拷贝源对象后 delete 指定键，或遍历非排除键构造新对象。
 */

// ===== TypeScript 类型实现 =====
// type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// ===== JSDoc 等价类型表示 =====
/**
 * @template T, K
 * @typedef {Omit<T, K>} OmitT 等价于 TS 的 Omit<T, K>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 Omit：从源对象剔除指定键集合
 * @param {Object} source 源对象
 * @param {Array<string>} keys 要剔除的键
 * @returns {Object} 不包含指定键的新对象
 */
function omit(source, keys) {
  if (source === null || typeof source !== "object") {
    return {};
  }
  const exclude = new Set(keys);
  const result = {};
  for (const key of Object.keys(source)) {
    if (!exclude.has(key)) {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * 基于解构的 Omit 实现（更函数式）
 * @param {Object} source
 * @param {Array<string>} keys
 * @returns {Object}
 */
function omitByDestruct(source, keys) {
  if (source === null || typeof source !== "object") return {};
  const rest = { ...source };
  for (const key of keys) {
    delete rest[key];
  }
  return rest;
}

// ===== 测试 =====

const user = { name: "Alice", age: 18, email: "a@b.com", role: "admin" };

// 剔除部分字段
console.log(omit(user, ["email", "role"])); // { name: 'Alice', age: 18 }

// 剔除单个字段
console.log(omit(user, ["age"])); // { name: 'Alice', email: 'a@b.com', role: 'admin' }

// 剔除不存在的键（安全忽略）
console.log(omit(user, ["nonExist"])); // 原样返回四个字段

// 剔除全部字段
console.log(omit(user, ["name", "age", "email", "role"])); // {}

// 解构版
console.log(omitByDestruct(user, ["age", "role"])); // { name: 'Alice', email: 'a@b.com' }

// 源非对象
console.log(omit(null, ["a"])); // {}
