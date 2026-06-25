/**
 * 手写对象属性选取 pick
 *
 * 作用：
 *   - 创建一个新对象，只包含指定的属性
 *   - 类似 lodash.pick
 *   - 不修改原对象
 *
 * 示例：
 *   pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) → { a: 1, c: 3 }
 *
 * 实现思路：
 *   1. 遍历指定的 keys 列表
 *   2. 若 key 存在于原对象，则拷贝到新对象
 *   3. 返回新对象
 *
 * 与 omit 互为反向操作
 */

function pick(obj, keys) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }

  const keysToPick = Array.isArray(keys) ? keys : [keys];
  const result = {};

  for (const key of keysToPick) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  // 处理 Symbol 属性
  for (const key of keysToPick) {
    if (
      typeof key === "symbol" &&
      Object.prototype.hasOwnProperty.call(obj, key)
    ) {
      result[key] = obj[key];
    }
  }

  return result;
}

// ===== 测试 =====

console.log(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])); // { a: 1, c: 3 }
console.log(pick({ a: 1, b: 2 }, "a")); // { a: 1 }（单个 key）
console.log(pick({ x: 1, y: 2, z: 3 }, ["x", "z"])); // { x: 1, z: 3 }

// 选取不存在的 key（忽略）
console.log(pick({ a: 1 }, ["a", "nope"])); // { a: 1 }

// 空数组
console.log(pick({ a: 1, b: 2 }, [])); // {}

// 选取全部
console.log(pick({ a: 1, b: 2 }, ["a", "b"])); // { a: 1, b: 2 }

// 不修改原对象
const original = { a: 1, b: 2 };
const picked = pick(original, ["a"]);
console.log(picked); // { a: 1 }
console.log(original); // { a: 1, b: 2 }（原对象不变）

// 浅拷贝（嵌套对象引用相同）
const nested = { a: { x: 1 }, b: 2 };
const pickedNested = pick(nested, ["a"]);
console.log(pickedNested.a === nested.a); // true

// Symbol 属性
const sym = Symbol("s");
const obj = { a: 1, [sym]: "sym", b: 2 };
console.log(pick(obj, [sym])); // { [Symbol(s)]: 'sym' }
console.log(pick(obj, ["a", sym])); // { a: 1, [Symbol(s)]: 'sym' }

// 与 omit 互逆
const source = { a: 1, b: 2, c: 3 };
const pickedAll = pick(source, ["a", "c"]);
const omittedRest = {};
for (const k of Object.keys(source)) {
  if (!["a", "c"].includes(k)) omittedRest[k] = source[k];
}
console.log(pickedAll); // { a: 1, c: 3 }
console.log(omittedRest); // { b: 2 }
