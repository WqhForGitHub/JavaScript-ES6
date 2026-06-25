/**
 * 手写 TypeScript `InstanceType` 类型
 *
 * 类型作用：
 *   获取构造函数类型 T 的实例类型。
 *   常用于根据类构造器推断其实例类型。
 *
 * 实现思路：
 *   使用条件类型 + infer 推断 new 之后的实例类型 R：
 *     type InstanceType<T extends abstract new (...args: any) => any> =
 *       T extends abstract new (...args: any) => infer R ? R : never;
 *
 * 运行时模拟：
 *   JS 通过 new 调用构造器创建实例，或通过 Object.getPrototypeOf(instance).constructor
 *   反向获取构造器；这里演示 new 出实例并取其构造函数名。
 */

// ===== TypeScript 类型实现 =====
// type InstanceType<T extends abstract new (...args: any) => any> =
//   T extends abstract new (...args: any) => infer R ? R : never;
//
// 示例：
//   class Dog { bark() {} }
//   type D = InstanceType<typeof Dog>; // Dog

// ===== JSDoc 等价类型表示 =====
/**
 * @template {Function} T
 * @typedef {InstanceType<T>} InstanceT 等价于 TS 的 InstanceType<T>
 */

// ===== 运行时模拟函数 =====
/**
 * 模拟 InstanceType：根据构造函数创建一个实例
 * @param {Function} Constructor 构造函数
 * @param {Array<any>} [args] 构造参数
 * @returns {Object} 实例
 */
function instanceType(Constructor, args = []) {
  if (typeof Constructor !== "function") {
    throw new TypeError("Expected a constructor function");
  }
  return new Constructor(...args);
}

/**
 * 获取实例的构造函数名（对应 TS 实例类型名）
 * @param {Object} instance
 * @returns {string}
 */
function instanceTypeName(instance) {
  if (instance === null || typeof instance !== "object") {
    return typeof instance;
  }
  const ctor = instance.constructor;
  return ctor ? ctor.name : "Object";
}

/**
 * 判断构造器是否可被 new（构造函数/类，箭头函数不可）
 * @param {any} fn
 * @returns {boolean}
 */
function isConstructable(fn) {
  if (typeof fn !== "function") return false;
  try {
    Reflect.construct(fn, []);
    return true;
  } catch {
    return false;
  }
}

// ===== 测试 =====

class Dog {
  constructor(name) {
    this.name = name;
  }
  bark() {
    return `${this.name}: woof`;
  }
}

function Person(name, age) {
  this.name = name;
  this.age = age;
}

const d = instanceType(Dog, ["Rex"]);
console.log(d); // Dog { name: 'Rex' }
console.log(d.bark()); // Rex: woof
console.log(instanceTypeName(d)); // Dog

const p = instanceType(Person, ["Alice", 18]);
console.log(p); // { name: 'Alice', age: 18 }
console.log(instanceTypeName(p)); // Person

// 内置构造器
const date = instanceType(Date, [2020, 0, 1]);
console.log(instanceTypeName(date)); // Date

const arr = instanceType(Array, [3]);
console.log(Array.isArray(arr)); // true
console.log(instanceTypeName(arr)); // Array

// 可构造性判断
console.log(isConstructable(Dog)); // true
console.log(isConstructable(Date)); // true
console.log(isConstructable((x) => x)); // false（箭头函数不可 new）
console.log(isConstructable(123)); // false

// 非构造器抛错
try {
  instanceType(123);
} catch (e) {
  console.log("catch:", e.message); // Expected a constructor function
}
