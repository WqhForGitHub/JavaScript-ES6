/**
 * 手写 Function.prototype.bind（支持 new 调用）
 *
 * 作用：
 *   - 与原生 bind 一致：返回新函数，固定 this 与预设参数
 *   - 额外要求：当返回的函数被 new 调用时，this 应指向新创建的实例，
 *     而不是 bind 指定的 thisArg（这是 ES5 bind 规范的行为）
 *
 * 实现思路：
 *   1. 返回的 bound 函数内部判断是否被 new 调用：
 *        - 通过 new.target !== undefined 判断
 *        - 或通过 this instanceof bound 判断（更兼容）
 *   2. 若 new 调用：this 指向新实例，原函数作为构造器执行
 *   3. 若普通调用：this 固定为 thisArg
 *   4. new 调用时还需让实例继承原函数的原型（bound 原型指向 fn 原型）
 */

/* eslint-disable no-extend-native */
Function.prototype.myBindNew = function (thisArg, ...presetArgs) {
  if (typeof this !== "function") {
    throw new TypeError("myBindNew called on non-callable");
  }

  const fn = this;

  if (thisArg == null) {
    thisArg = globalThis;
  } else {
    thisArg = Object(thisArg);
  }

  // 中介函数，用于原型继承（避免直接修改 fn.prototype）
  function NOP() {}
  NOP.prototype = fn.prototype;

  const bound = function (...laterArgs) {
    const allArgs = [...presetArgs, ...laterArgs];
    // 判断是否通过 new 调用：new.target 最可靠；兜底用 this instanceof bound
    const isCalledWithNew =
      (typeof new.target !== "undefined" && new.target !== undefined) ||
      this instanceof bound;

    if (isCalledWithNew) {
      // 作为构造器：new 已创建好 this（原型链为 this → bound.prototype → fn.prototype）
      // 直接把原函数以 this 执行，无需再手动 Object.create
      const result = fn.apply(this, allArgs);
      // 原函数若返回对象则用该对象，否则用 this（即新实例）
      return typeof result === "object" && result !== null ? result : this;
    }

    // 普通调用：this 固定为 thisArg
    return fn.apply(thisArg, allArgs);
  };

  // 让 bound 的原型链指向 fn 原型：
  //   bound.prototype (NOP 实例) → NOP.prototype === fn.prototype
  //   这样 new bound() 产生的实例既能 instanceof bound，又能 instanceof fn
  // 用 NOP 中介避免直接引用导致的原型污染问题
  bound.prototype = new NOP();
  bound.prototype.constructor = bound;

  return bound;
};

// ===== 测试 =====

// 普通调用：this 固定
const obj = { name: "Tom" };
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
const boundGreet = greet.myBindNew(obj, "Hello");
console.log(boundGreet()); // 'Hello, Tom'

// new 调用：this 指向新实例，而非 obj
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.introduce = function () {
  return `I'm ${this.name}, ${this.age} years old`;
};

// 预设第一个参数，再用 new 传入第二个
const Tom = Person.myBindNew(null, "Tom");
const person = new Tom(20);
console.log(person.name); // 'Tom'
console.log(person.age); // 20
console.log(person.introduce()); // "I'm Tom, 20 years old"

// instanceof 检查
console.log(person instanceof Person); // true
console.log(person instanceof Tom); // true

// 普通调用 vs new 调用对比
function Maker(x) {
  this.x = x;
  return this.x;
}
const boundMaker = Maker.myBindNew({ x: "fixed" }, 99);
console.log(boundMaker()); // 99（普通调用 this.x = 99，返回 99）
console.log(new boundMaker().x); // 99（new 调用实例 x=99）

// 原函数返回对象时，new 结果用该对象
function Factory() {
  return { custom: true };
}
const BoundFactory = Factory.myBindNew(null);
console.log(new BoundFactory().custom); // true
