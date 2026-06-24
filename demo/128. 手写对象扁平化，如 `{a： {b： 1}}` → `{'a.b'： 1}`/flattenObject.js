/**
 * 手写对象扁平化
 *
 * 作用：
 *   - 将嵌套对象转换为单层对象，key 用点号连接路径
 *   - 例如 { a: { b: 1 } } → { 'a.b': 1 }
 *   - 例如 { a: { b: { c: 2 } }, d: 3 } → { 'a.b.c': 2, d: 3 }
 *
 * 规则：
 *   - 基本类型值（number/string/boolean/null 等）直接放到结果
 *   - 普通对象递归扁平化，路径用 '.' 连接
 *   - 数组：扁平化为 'a.0'、'a.1' 形式（索引作为路径段）
 *   - 空对象 {}：保留路径指向空对象
 *
 * 实现思路：
 *   - 递归遍历，维护当前路径前缀 prefix
 *   - 拼接 key 作为新路径
 *   - 遇到基本类型则写入结果
 */

function isObject(val) {
  return val !== null && typeof val === "object";
}

function flattenObject(obj, prefix = "", result = {}) {
  if (!isObject(obj)) {
    return obj;
  }

  // 数组处理：用索引作为路径段
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result[prefix] = [];
      return result;
    }
    obj.forEach((item, index) => {
      const path = prefix ? `${prefix}.${index}` : String(index);
      if (isObject(item)) {
        flattenObject(item, path, result);
      } else {
        result[path] = item;
      }
    });
    return result;
  }

  // 普通对象
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    result[prefix] = {};
    return result;
  }

  for (const key of keys) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  }

  return result;
}

// ===== 测试 =====

console.log(flattenObject({ a: { b: 1 } }));
// { 'a.b': 1 }

console.log(flattenObject({ a: { b: { c: 2 } }, d: 3 }));
// { 'a.b.c': 2, d: 3 }

console.log(flattenObject({ a: 1, b: 2, c: 3 }));
// { a: 1, b: 2, c: 3 }

// 数组扁平化（索引作为路径）
console.log(flattenObject({ a: [1, 2, 3] }));
// { 'a.0': 1, 'a.1': 2, 'a.2': 3 }

// 混合嵌套
console.log(flattenObject({ user: { name: "Tom", address: { city: "BJ" } }, tags: ["a", "b"] }));
// { 'user.name': 'Tom', 'user.address.city': 'BJ', 'tags.0': 'a', 'tags.1': 'b' }

// 空对象 / 空数组
console.log(flattenObject({ a: {} }));
// { a: {} }
console.log(flattenObject({ a: [] }));
// { a: [] }

// 多层混合
console.log(flattenObject({
  level1: {
    level2: {
      level3: "deep",
      num: 42,
    },
  },
  top: true,
}));
// { 'level1.level2.level3': 'deep', 'level1.level2.num': 42, top: true }

// null 值保留
console.log(flattenObject({ a: { b: null, c: undefined } }));
// { 'a.b': null, 'a.c': undefined }
