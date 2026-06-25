/**
 * 手写对象键值反转 invert
 *
 * 作用：
 *   - 将对象的 key 和 value 互换：原 key 变 value，原 value 变 key
 *   - 类似 lodash.invert
 *   - 值必须能作为 key（字符串/数字会被转为字符串）
 *
 * 示例：
 *   invert({ a: 1, b: 2 }) → { '1': 'a', '2': 'b' }
 *
 * 注意：
 *   - 若多个 key 有相同 value，后面的会覆盖前面的
 *   - invertBy 会把相同 value 的 key 收集为数组（额外提供）
 *
 * 实现思路：
 *   1. 遍历原对象属性
 *   2. 以原 value 为新 key，原 key 为新 value
 *   3. 写入新对象
 */

function invert(obj) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    // value 转为字符串作为新 key（对象 key 只能是 string/Symbol）
    const newKey = typeof value === "symbol" ? value : String(value);
    result[newKey] = key;
  }
  return result;
}

// invertBy：相同 value 的 key 收集为数组
function invertBy(obj, iteratee) {
  if (obj === null || typeof obj !== "object") {
    return {};
  }

  const transform =
    typeof iteratee === "function" ? iteratee : (v) => String(v);
  const result = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = transform(value);
    if (result[newKey] === undefined) {
      result[newKey] = [key];
    } else {
      result[newKey].push(key);
    }
  }

  return result;
}

// ===== 测试 =====

// 基本反转
console.log(invert({ a: 1, b: 2, c: 3 }));
// { '1': 'a', '2': 'b', '3': 'c' }

// 字符串值反转
console.log(invert({ name: "Tom", role: "admin" }));
// { Tom: 'name', admin: 'role' }

// 数字值会转为字符串 key
console.log(invert({ a: 100, b: 200 }));
// { '100': 'a', '200': 'b' }

// 相同 value 时后者覆盖前者
console.log(invert({ a: 1, b: 1, c: 2 }));
// { '1': 'b', '2': 'c' }

// 空对象
console.log(invert({})); // {}

// 不修改原对象
const original = { x: 10, y: 20 };
const inverted = invert(original);
console.log(inverted); // { '10': 'x', '20': 'y' }
console.log(original); // { x: 10, y: 20 }

// invertBy：相同值收集为数组
console.log(invertBy({ a: 1, b: 1, c: 2 }));
// { '1': ['a', 'b'], '2': ['c'] }

console.log(invertBy({ x: "yes", y: "no", z: "yes" }));
// { yes: ['x', 'z'], no: ['y'] }

// invertBy 带转换函数
console.log(invertBy({ a: 1.1, b: 1.9, c: 2.5 }, (v) => Math.floor(v)));
// { '1': ['a', 'b'], '2': ['c'] }

// 实用场景：值查找 key
const colorMap = { red: "#f00", green: "#0f0", blue: "#00f" };
const hexToName = invert(colorMap);
console.log(hexToName["#f00"]); // 'red'
console.log(hexToName["#0f0"]); // 'green'
