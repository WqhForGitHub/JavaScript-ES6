/**
 * 手写 instanceof 操作符
 *
 * 原生 instanceof 的作用：
 *   - 判断对象的原型链上是否存在构造函数的 prototype
 *   - 语法：object instanceof Constructor
 *
 * 核心原理：
 *   - 沿着对象的原型链 (__proto__) 逐层向上查找
 *   - 看是否能找到 Constructor.prototype
 *   - 如果原型链尽头 (null) 还没找到，返回 false
 */

function myInstanceof(instance, Constructor) {
  // 1. 基本类型直接返回 false（基本类型没有原型链）
  if (
    instance === null ||
    (typeof instance !== "object" && typeof instance !== "function")
  ) {
    return false;
  }

  // 2. 构造函数必须是函数且必须有 prototype
  if (typeof Constructor !== "function" || !Constructor.prototype) {
    throw new TypeError("Right-hand side of instanceof is not callable");
  }

  // 3. 获取对象的原型
  let proto = Object.getPrototypeOf(instance);

  // 4. 沿原型链向上查找
  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  // 5. 原型链尽头仍未找到，返回 false
  return false;
}

// ===== 测试 =====

// --- 对象与构造函数 ---
console.log(myInstanceof({}, Object)); // true
console.log(myInstanceof({}, Array)); // false
console.log(myInstanceof([], Array)); // true
console.log(myInstanceof([], Object)); // true（Array 继承自 Object）

// --- 函数 ---
console.log(myInstanceof(function () {}, Function)); // true
console.log(myInstanceof(function () {}, Object)); // true

// --- 基本类型（始终返回 false）---
console.log(myInstanceof("hello", String)); // false
console.log(myInstanceof(123, Number)); // false
console.log(myInstanceof(true, Boolean)); // false
console.log(myInstanceof(null, Object)); // false
console.log(myInstanceof(undefined, Object)); // false

// --- 包装对象（通过 new 创建的返回 true）---
console.log(myInstanceof(new String("hello"), String)); // true
console.log(myInstanceof(new Number(123), Number)); // true
console.log(myInstanceof(new Boolean(true), Boolean)); // true

// --- 自定义类 ---
class Person {}
class Student extends Person {}

const student = new Student();

console.log(myInstanceof(student, Student)); // true
console.log(myInstanceof(student, Person)); // true
console.log(myInstanceof(student, Object)); // true

// --- Object.create ---
const obj = Object.create(null); // 无原型对象
console.log(myInstanceof(obj, Object)); // false

// --- Symbol.hasInstance（原生 instanceof 支持，手写版不涉及）---
// 原生 instanceof 会检查 Constructor[Symbol.hasInstance]
// 手写版仅模拟原型链查找，不包含此特性
