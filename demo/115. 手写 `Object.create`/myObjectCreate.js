/**
 * 手写 Object.create
 *
 * 原生 Object.create 的作用：
 *   - 创建一个新对象，使用现有对象作为新对象的原型（__proto__）
 *   - 可选第二个参数定义属性描述符（类似 Object.defineProperties）
 *
 * 实现思路：
 *   1. 用一个临时构造函数，让其 prototype 指向传入的原型
 *   2. new 这个构造函数得到新对象
 *   3. 若提供第二个参数 propertiesObject，用 Object.defineProperties 定义
 *
 * 特殊情况：
 *   - proto 为 null 时，创建的对象没有原型（[[Prototype]] 为 null）
 */

function myObjectCreate(proto, propertiesObject) {
  // proto 必须是对象或 null
  if (
    proto !== null &&
    typeof proto !== "object" &&
    typeof proto !== "function"
  ) {
    throw new TypeError("Object prototype may only be an Object or null");
  }

  // 使用临时构造函数法
  function F() {}
  F.prototype = proto;

  const obj = new F();
  // new F() 后 obj 的 __proto__ 指向 proto
  // 注意：F.prototype = proto 后，构造函数本身的 prototype 属性也变了，
  // 但这不影响 obj，obj 已经创建好

  // 如果提供了属性描述符，用 defineProperties 定义
  if (propertiesObject !== undefined) {
    if (propertiesObject === null || typeof propertiesObject !== "object") {
      throw new TypeError("Property description must be an object");
    }
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
}

// ===== 测试 =====

// 用对象作为原型
const animal = {
  eat() {
    return "eating";
  },
};
const dog = myObjectCreate(animal);
console.log(dog.eat()); // 'eating'
console.log(Object.getPrototypeOf(dog) === animal); // true

// 原型链验证
console.log(dog.__proto__ === animal); // true

// 创建无原型对象
const noProto = myObjectCreate(null);
console.log(Object.getPrototypeOf(noProto)); // null
console.log(noProto.toString); // undefined（无原型方法）

// 模拟继承
function Shape() {}
Shape.prototype.area = function () {
  return 0;
};
const circle = myObjectCreate(Shape.prototype);
console.log(circle.area()); // 0
console.log(circle instanceof Shape); // true

// 第二个参数：属性描述符
const obj = myObjectCreate(
  { inherited: 1 },
  {
    own: { value: 2, enumerable: true },
    readOnly: { value: 100, writable: false },
  },
);
console.log(obj.inherited); // 1
console.log(obj.own); // 2
console.log(obj.readOnly); // 100
obj.readOnly = 999; // 静默失败（严格模式抛错）
console.log(obj.readOnly); // 100

// proto 为非对象抛错
try {
  myObjectCreate(42);
} catch (e) {
  console.log(e.message); // Object prototype may only be an Object or null
}
