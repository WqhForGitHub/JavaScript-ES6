/**
 * 手写对象映射 mapKeys
 *
 * 作用：
 *   - 遍历对象的属性，对每个 key 应用回调函数，生成新 key
 *   - 值保持不变，返回新对象
 *   - 类似 lodash.mapKeys
 *
 * 示例：
 *   mapKeys({ a: 1, b: 2 }, (value, key) => key.toUpperCase()) → { A: 1, B: 2 }
 *
 * 实现思路：
 *   1. 遍历原对象自身可枚举属性
 *   2. 对每个 (value, key) 调用回调得到新 key
 *   3. 用新 key 和原 value 写入结果对象
 *   4. 不修改原对象
 */

function mapKeys(obj, iteratee) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  if (typeof iteratee !== "function") {
    throw new TypeError("iteratee must be a function");
  }

  const result = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = iteratee(value, key, obj);
    result[newKey] = value;
  }

  // Symbol 属性：回调通常针对字符串 key，Symbol 直接保留或按需处理
  const symbols = Object.getOwnPropertySymbols(obj);
  const isEnumerable = Object.prototype.propertyIsEnumerable;
  for (const sym of symbols) {
    if (isEnumerable.call(obj, sym)) {
      const value = obj[sym];
      const newKey = iteratee(value, sym, obj);
      result[newKey] = value;
    }
  }

  return result;
}

// ===== 测试 =====

// key 转大写
console.log(mapKeys({ a: 1, b: 2 }, (value, key) => key.toUpperCase()));
// { A: 1, B: 2 }

// 加前缀
console.log(mapKeys({ name: "Tom", age: 20 }, (value, key) => "user_" + key));
// { user_name: 'Tom', user_age: 20 }

// 根据值生成 key
console.log(mapKeys({ x: 1, y: 2 }, (value) => "key_" + value));
// { key_1: 1, key_2: 2 }

// 嵌套对象（值不变，引用相同）
console.log(mapKeys({ a: { x: 1 } }, (v, k) => k + "_new"));
// { a_new: { x: 1 } }

// 不修改原对象
const original = { a: 1, b: 2 };
const mapped = mapKeys(original, (v, k) => k + "!");
console.log(mapped); // { 'a!': 1, 'b!': 2 }
console.log(original); // { a: 1, b: 2 }

// 实用场景：数组转对象，用某个字段作为 key
const users = [{ id: "u1", name: "Tom" }, { id: "u2", name: "Jerry" }];
const usersById = mapKeys(
  Object.fromEntries(users.map((u, i) => [i, u])),
  (value) => value.id
);
console.log(usersById.u1.name); // 'Tom'
console.log(usersById.u2.name); // 'Jerry'

// 带 index 信息的 key
console.log(mapKeys({ a: 10, b: 20, c: 30 }, (value, key) => `${key}_${value}`));
// { 'a_10': 10, 'b_20': 20, 'c_30': 30 }
