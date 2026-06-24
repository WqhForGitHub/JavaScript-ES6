/**
 * 手写 Object.entries
 *
 * 原生 Object.entries 的作用：
 *   - 返回对象自身可枚举属性的 [key, value] 二元组数组
 *   - 不包含继承属性，不包含 Symbol 属性
 *
 * 实现思路：
 *   1. 遍历对象自身可枚举属性
 *   2. 把每个 [key, value] 组成二元数组
 *   3. 返回二维数组
 */

function myObjectEntries(obj) {
  if (obj === null || obj === undefined) {
    throw new TypeError("Cannot convert undefined or null to object");
  }

  const target = Object(obj);
  const entries = [];
  const hasOwn = Object.prototype.hasOwnProperty;
  const isEnumerable = Object.prototype.propertyIsEnumerable;

  for (const key in target) {
    if (hasOwn.call(target, key) && isEnumerable.call(target, key)) {
      entries.push([key, target[key]]);
    }
  }

  return entries;
}

// ===== 测试 =====

console.log(myObjectEntries({ a: 1, b: 2 })); // [['a', 1], ['b', 2]]

// 转换为 Map
const map = new Map(myObjectEntries({ x: 10, y: 20 }));
console.log(map.get("x")); // 10
console.log(map.get("y")); // 20

// 继承属性
function Base() {
  this.own = 1;
}
Base.prototype.inherited = 2;
const b = new Base();
console.log(myObjectEntries(b)); // [['own', 1]]

// 不可枚举
const obj = { a: 1 };
Object.defineProperty(obj, "b", { value: 2, enumerable: false });
console.log(myObjectEntries(obj)); // [['a', 1]]

// 数组
console.log(myObjectEntries(["x", "y"])); // [['0', 'x'], ['1', 'y']]

// 字符串
console.log(myObjectEntries("ab")); // [['0', 'a'], ['1', 'b']]

// 空对象
console.log(myObjectEntries({})); // []

try {
  myObjectEntries(null);
} catch (e) {
  console.log(e.message); // Cannot convert undefined or null to object
}
