/**
 * 手写 Object.getPrototypeOf
 *
 * 原生 Object.getPrototypeOf 的作用：
 *   - 返回指定对象的原型（[[Prototype]]，即 __proto__）
 *
 * 实现思路：
 *   1. 优先使用 obj.__proto__（旧标准但广泛支持）
 *   2. 也可使用 Object.getPrototypeOf（但这等于直接调用原生，不算"手写"）
 *   3. 借助 Object.prototype 的内部 [[GetPrototypeOf]]：用 __proto__ 即可
 *
 * 说明：
 *   - __proto__ 是 Object.prototype 上的访问器属性
 *   - 对于 Object.create(null) 创建的无原型对象，__proto__ 不存在，返回 null
 */

function myGetPrototypeOf(obj) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    throw new TypeError("Object.getPrototypeOf called on non-object");
  }

  // __proto__ 是访问器属性，读取它会返回内部 [[Prototype]]
  // 对于 Object.create(null) 的对象，没有 __proto__ 访问器，返回 undefined
  // 此时内部 [[Prototype]] 本就是 null
  const proto = obj.__proto__;

  // __proto__ 为 undefined 说明对象无原型链（Object.create(null)），返回 null
  return proto === undefined ? null : proto;
}

// ===== 测试 =====

console.log(myGetPrototypeOf({}) === Object.prototype); // true

const arr = [];
console.log(myGetPrototypeOf(arr) === Array.prototype); // true

console.log(myGetPrototypeOf(Array.prototype) === Object.prototype); // true

console.log(myGetPrototypeOf(Object.prototype) === null); // true

// Object.create(null) 无原型
const noProto = Object.create(null);
console.log(myGetPrototypeOf(noProto)); // null

// 自定义类
class Animal {}
class Dog extends Animal {}
const d = new Dog();
console.log(myGetPrototypeOf(d) === Dog.prototype); // true
console.log(myGetPrototypeOf(Dog.prototype) === Animal.prototype); // true

// 函数的原型
function fn() {}
console.log(myGetPrototypeOf(fn) === Function.prototype); // true

// 非对象抛错
try {
  myGetPrototypeOf(123);
} catch (e) {
  console.log(e instanceof TypeError); // true
}
