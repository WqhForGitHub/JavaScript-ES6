/**
 * 手写对象属性过滤 omit
 *
 * 作用：
 *   - 创建一个新对象，过滤掉指定的属性
 *   - 类似 lodash.omit
 *   - 不修改原对象
 *
 * 示例：
 *   omit({ a: 1, b: 2, c: 3 }, ['a', 'c']) → { b: 2 }
 *
 * 实现思路：
 *   1. 遍历原对象的自身可枚举属性
 *   2. 若 key 不在忽略列表中，则拷贝到新对象
 *   3. 返回新对象
 */

function omit(obj, keys) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }

  // 将 keys 统一为数组，并转为 Set 提升查找性能
  const keysToOmit = new Set(
    Array.isArray(keys) ? keys : [keys]
  );

  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keysToOmit.has(key)) {
      result[key] = obj[key];
    }
  }

  // Symbol 属性也一并处理
  const symbols = Object.getOwnPropertySymbols(obj);
  const isEnumerable = Object.prototype.propertyIsEnumerable;
  for (const sym of symbols) {
    if (isEnumerable.call(obj, sym) && !keysToOmit.has(sym)) {
      result[sym] = obj[sym];
    }
  }

  return result;
}

// ===== 测试 =====

console.log(omit({ a: 1, b: 2, c: 3 }, ["a", "c"])); // { b: 2 }
console.log(omit({ a: 1, b: 2 }, "b")); // { a: 1 }（单个 key）
console.log(omit({ x: 1, y: 2, z: 3 }, ["y"])); // { x: 1, z: 3 }

// 过滤不存在的 key（无副作用）
console.log(omit({ a: 1 }, ["nope"])); // { a: 1 }

// 过滤全部
console.log(omit({ a: 1, b: 2 }, ["a", "b"])); // {}

// 空数组：返回包含全部属性的副本
console.log(omit({ a: 1 }, [])); // { a: 1 }

// 不修改原对象
const original = { a: 1, b: 2 };
const omitted = omit(original, ["a"]);
console.log(omitted); // { b: 2 }
console.log(original); // { a: 1, b: 2 }（原对象不变）

// 浅拷贝（嵌套对象引用相同）
const nested = { a: { x: 1 }, b: 2 };
const omittedNested = omit(nested, ["b"]);
console.log(omittedNested.a === nested.a); // true（浅拷贝）

// Symbol 属性
const sym = Symbol("s");
const obj = { a: 1, [sym]: "sym", b: 2 };
console.log(omit(obj, ["a"])); // { b: 2, [Symbol(s)]: 'sym' }
console.log(omit(obj, [sym])); // { a: 1, b: 2 }

// 非对象入参
console.log(omit(null, ["a"])); // {}
