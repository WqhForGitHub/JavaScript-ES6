/**
 * 手写对象映射 mapValues
 *
 * 作用：
 *   - 遍历对象的属性，对每个 value 应用回调函数，生成新 value
 *   - key 保持不变，返回新对象
 *   - 类似 lodash.mapValues
 *
 * 示例：
 *   mapValues({ a: 1, b: 2 }, v => v * 2) → { a: 2, b: 4 }
 *
 * 实现思路：
 *   1. 遍历原对象自身可枚举属性
 *   2. 对每个 (value, key) 调用回调得到新 value
 *   3. 用原 key 和新 value 写入结果对象
 *   4. 不修改原对象
 */

function mapValues(obj, iteratee) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  if (typeof iteratee !== "function") {
    throw new TypeError("iteratee must be a function");
  }

  const result = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    result[key] = iteratee(value, key, obj);
  }

  // Symbol 属性
  const symbols = Object.getOwnPropertySymbols(obj);
  const isEnumerable = Object.prototype.propertyIsEnumerable;
  for (const sym of symbols) {
    if (isEnumerable.call(obj, sym)) {
      const value = obj[sym];
      result[sym] = iteratee(value, sym, obj);
    }
  }

  return result;
}

// ===== 测试 =====

// 值翻倍
console.log(mapValues({ a: 1, b: 2 }, (v) => v * 2));
// { a: 2, b: 4 }

// 值转字符串
console.log(mapValues({ a: 1, b: true }, (v) => String(v)));
// { a: '1', b: 'true' }

// 根据 key 处理值
console.log(mapValues({ price: 100, count: 5 }, (v, k) => `${k}=${v}`));
// { price: 'price=100', count: 'count=5' }

// 提取嵌套对象的某个字段
const users = {
  tom: { name: "Tom", age: 20 },
  jerry: { name: "Jerry", age: 22 },
};
console.log(mapValues(users, (v) => v.name));
// { tom: 'Tom', jerry: 'Jerry' }
console.log(mapValues(users, (v) => v.age));
// { tom: 20, jerry: 22 }

// 不修改原对象
const original = { a: 1, b: 2 };
const mapped = mapValues(original, (v) => v + 10);
console.log(mapped); // { a: 11, b: 12 }
console.log(original); // { a: 1, b: 2 }

// 实用场景：批量格式化配置
const config = { port: "3000", debug: "true", timeout: "5000" };
const normalized = mapValues(config, (v, k) => {
  if (k === "debug") return v === "true";
  return Number(v);
});
console.log(normalized);
// { port: 3000, debug: true, timeout: 5000 }

// 嵌套对象值会被替换（不递归）
console.log(mapValues({ a: { x: 1 } }, (v) => Object.keys(v)));
// { a: ['x'] }
