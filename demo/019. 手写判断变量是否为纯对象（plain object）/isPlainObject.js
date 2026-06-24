/**
 * 手写判断变量是否为纯对象（plain object）
 *
 * "纯对象"定义：
 *   - 由 {} 或 new Object() 创建
 *   - 或由 Object.create(null) 创建（无原型对象）
 *   - 不是数组、Date、RegExp、Map、Set、Error 等内置子类型
 *   - 不是自定义类的实例
 *
 * 常见用途：
 *   - 深拷贝/合并时区分普通对象与其他对象
 *   - Redux/状态管理判断 action 是否为纯对象
 *
 * 实现思路：
 *   1. 排除基本类型、null
 *   2. 用 Object.prototype.toString 确认是 "[object Object]"
 *   3. 检查原型：原型为 null 或 Object.prototype
 */

function isPlainObject(value) {
  // 1. 基本类型 / null 直接排除
  if (value === null || typeof value !== "object") {
    return false;
  }

  // 2. 用 toString 排除 Date/RegExp/Map/Set/Error 等内置对象
  const tag = Object.prototype.toString.call(value);
  if (tag !== "[object Object]") {
    return false;
  }

  // 3. 检查原型链
  //    - Object.create(null) 创建的对象原型为 null，视为纯对象
  //    - 普通纯对象原型最终应指向 Object.prototype
  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  // 4. 沿原型链找，确认顶层是 Object.prototype
  //    自定义类的实例原型链不会直接是 Object.prototype（中间有类原型）
  let current = proto;
  while (current !== null) {
    if (current === Object.prototype) {
      // 进一步确认该原型直接由 value 引用（即 value 的直接原型是 Object.prototype）
      return proto === Object.prototype;
    }
    current = Object.getPrototypeOf(current);
  }

  return proto === Object.prototype;
}

// ===== 测试 =====

// --- 纯对象 ---
console.log(isPlainObject({})); // true
console.log(isPlainObject({ a: 1 })); // true
console.log(isPlainObject(new Object())); // true
console.log(isPlainObject(Object.create(null))); // true（无原型对象，视为纯对象）

// --- 非对象 ---
console.log(isPlainObject(null)); // false
console.log(isPlainObject(undefined)); // false
console.log(isPlainObject(123)); // false
console.log(isPlainObject("hello")); // false
console.log(isPlainObject(true)); // false
console.log(isPlainObject(Symbol("s"))); // false
console.log(isPlainObject(10n)); // false

// --- 内置对象类型 ---
console.log(isPlainObject([])); // false
console.log(isPlainObject(new Date())); // false
console.log(isPlainObject(/regex/)); // false
console.log(isPlainObject(new Map())); // false
console.log(isPlainObject(new Set())); // false
console.log(isPlainObject(new Error())); // false
console.log(isPlainObject(function () {})); // false

// --- 自定义类实例 ---
class Person {
  constructor(name) {
    this.name = name;
  }
}
console.log(isPlainObject(new Person("Alice"))); // false

function Animal() {}
Animal.prototype.species = "animal";
console.log(isPlainObject(new Animal())); // false

// --- 包装对象（不是纯对象）---
console.log(isPlainObject(new Number(1))); // false
console.log(isPlainObject(new String("a"))); // false
console.log(isPlainObject(new Boolean(false))); // false
