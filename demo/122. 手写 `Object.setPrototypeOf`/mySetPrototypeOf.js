/**
 * 手写 Object.setPrototypeOf
 *
 * 原生 Object.setPrototypeOf 的作用：
 *   - 设置对象的原型（[[Prototype]]），返回该对象
 *   - 性能较差，不推荐在生产中使用（推荐 Object.create）
 *
 * 实现思路：
 *   1. 通过 __proto__ 赋值修改原型（__proto__ 是 setter）
 *   2. 若对象不可扩展或循环引用，应抛错
 *   3. 返回原对象
 *
 * 注意：
 *   - 原型循环会抛错（proto 链上不能出现 obj 自身）
 *   - 不可扩展对象不能修改原型
 */

function mySetPrototypeOf(obj, proto) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    throw new TypeError("Object.setPrototypeOf called on non-object");
  }

  // proto 必须是对象或 null
  if (proto !== null && (typeof proto !== "object" && typeof proto !== "function")) {
    throw new TypeError("Object prototype may only be an Object or null");
  }

  // 检查原型循环：proto 不能是 obj 自身或 obj 的原型链上
  // （原生会抛 "Cyclic __proto__ value" 错误）
  if (proto !== null) {
    let p = proto;
    while (p !== null) {
      if (p === obj) {
        throw new TypeError("Cyclic __proto__ value");
      }
      p = Object.getPrototypeOf(p);
    }
  }

  // 不可扩展的对象不能修改原型
  if (!Object.isExtensible(obj)) {
    throw new TypeError("Cannot set prototype: object is not extensible");
  }

  // 通过 __proto__ setter 设置原型
  obj.__proto__ = proto;

  return obj;
}

// ===== 测试 =====

const obj = { a: 1 };
const proto = { greet() { return "hi"; } };

mySetPrototypeOf(obj, proto);
console.log(obj.greet()); // 'hi'
console.log(Object.getPrototypeOf(obj) === proto); // true

// 设为 null：对象失去原型方法
const obj2 = {};
mySetPrototypeOf(obj2, null);
console.log(Object.getPrototypeOf(obj2)); // null
console.log(obj2.toString); // undefined

// 改变原型后 instanceof 行为变化
class A {}
class B {}
const instance = Object.create(A.prototype);
console.log(instance instanceof A); // true
console.log(instance instanceof B); // false
mySetPrototypeOf(instance, B.prototype);
console.log(instance instanceof A); // false
console.log(instance instanceof B); // true

// 返回的是同一对象
const target = {};
const returned = mySetPrototypeOf(target, {});
console.log(returned === target); // true

// 循环原型抛错
try {
  const x = {};
  mySetPrototypeOf(x, x);
} catch (e) {
  console.log("循环原型:", e instanceof TypeError); // true
}

// proto 非对象抛错
try {
  mySetPrototypeOf({}, 42);
} catch (e) {
  console.log("proto 非对象:", e instanceof TypeError); // true
}
