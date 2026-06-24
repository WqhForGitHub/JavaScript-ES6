/**
 * 手写根据函数条件查找对象属性 findKey
 *
 * 作用：
 *   - 遍历对象，返回第一个使回调返回 truthy 的 key
 *   - 找不到返回 undefined
 *   - 类似 lodash.findKey
 *
 * 示例：
 *   findKey({ a: 1, b: 2, c: 3 }, v => v > 1) → 'b'
 *
 * 实现思路：
 *   1. 遍历对象自身可枚举属性
 *   2. 对每个 (value, key) 调用谓词函数
 *   3. 第一个返回 truthy 的即返回该 key
 *   4. 全部不满足返回 undefined
 */

function findKey(obj, predicate) {
  if (obj === null || typeof obj !== "object") {
    return undefined;
  }
  if (typeof predicate !== "function") {
    throw new TypeError("predicate must be a function");
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (predicate(value, key, obj)) {
      return key;
    }
  }

  return undefined;
}

// findLastKey：从后往前找（按属性顺序逆序）
function findLastKey(obj, predicate) {
  if (obj === null || typeof obj !== "object") {
    return undefined;
  }
  if (typeof predicate !== "function") {
    throw new TypeError("predicate must be a function");
  }

  const keys = Object.keys(obj);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    const value = obj[key];
    if (predicate(value, key, obj)) {
      return key;
    }
  }

  return undefined;
}

// ===== 测试 =====

const users = {
  barney: { name: "Barney", age: 36, active: true },
  fred: { name: "Fred", age: 40, active: false },
  pebbles: { name: "Pebbles", age: 1, active: true },
};

// 找第一个 active 为 true 的 key
console.log(findKey(users, (o) => o.active)); // 'barney'

// 找第一个 age > 30 的 key
console.log(findKey(users, (o) => o.age > 30)); // 'barney'

// 找第一个 age > 38 的 key
console.log(findKey(users, (o) => o.age > 38)); // 'fred'

// 找第一个 age < 2 的 key
console.log(findKey(users, (o) => o.age < 2)); // 'pebbles'

// 简单值对象
console.log(findKey({ a: 1, b: 2, c: 3 }, (v) => v > 1)); // 'b'
console.log(findKey({ a: 1, b: 2, c: 3 }, (v) => v > 10)); // undefined

// findLastKey
console.log(findLastKey(users, (o) => o.active)); // 'pebbles'
console.log(findLastKey({ a: 1, b: 2, c: 3, d: 4 }, (v) => v > 1)); // 'd'

// 字符串匹配
console.log(findKey(users, (o) => o.name.startsWith("F"))); // 'fred'

// 找不到返回 undefined
console.log(findKey({ a: 1, b: 2 }, (v) => v > 100)); // undefined

// 空对象
console.log(findKey({}, (v) => true)); // undefined

// 利用 key 参数
console.log(findKey({ apple: 1, banana: 2, cherry: 3 }, (v, k) => k.length > 5)); // 'banana'
