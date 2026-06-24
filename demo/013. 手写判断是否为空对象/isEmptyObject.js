/**
 * 手写判断是否为空对象
 *
 * "空对象"定义：自身没有可枚举属性的对象
 *
 * 注意：
 *   - 要排除 null/undefined 等非对象值
 *   - 不应把数组/函数当普通对象判断（数组应通过 length 判断）
 *   - 继承属性不算（只看 own enumerable）
 *
 * 实现思路：
 *   1. 先校验传入的是对象
 *   2. 用 Object.keys 检查可枚举自有属性数量是否为 0
 */

function isEmptyObject(value) {
  // 1. 必须是对象，且排除 null
  if (value === null || typeof value !== "object") {
    return false;
  }

  // 2. 数组、Map、Set 等不算"空对象"（语义不符）
  //    若需更严格，可只接受原型为 Object.prototype 的纯对象
  if (Array.isArray(value) || value instanceof Map || value instanceof Set) {
    return false;
  }

  // 3. 自身可枚举属性数量为 0 即视为空对象
  return Object.keys(value).length === 0;
}

// ===== 测试 =====

// --- 空对象 ---
console.log(isEmptyObject({})); // true
console.log(isEmptyObject(Object.create(null))); // true

// --- 非空对象 ---
console.log(isEmptyObject({ a: 1 })); // false
console.log(isEmptyObject({ a: undefined })); // false（undefined 仍是属性）

// --- 只有继承属性的对象（自有属性为空）---
function Person() {}
Person.prototype.name = "Alice";
const p = new Person();
console.log(isEmptyObject(p)); // true（name 在原型上，不是自有属性）

// --- 只有不可枚举属性的对象 ---
const withNonEnum = {};
Object.defineProperty(withNonEnum, "hidden", {
  value: 1,
  enumerable: false,
});
console.log(isEmptyObject(withNonEnum)); // true（不可枚举属性不算）

// --- 非对象 ---
console.log(isEmptyObject(null)); // false
console.log(isEmptyObject(undefined)); // false
console.log(isEmptyObject(123)); // false
console.log(isEmptyObject("hello")); // false
console.log(isEmptyObject(true)); // false

// --- 数组 / Map / Set（按语义不算空对象）---
console.log(isEmptyObject([])); // false
console.log(isEmptyObject(new Map())); // false
console.log(isEmptyObject(new Set())); // false
