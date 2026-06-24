/**
 * 手写 Class 语法糖（ES5 实现）
 *
 * ES6 的 class 本质上是构造函数 + 原型的语法糖。
 * class 中的 constructor 对应构造函数，方法挂在 prototype 上，
 * getter/setter 通过 Object.defineProperty 实现。
 * 这里用 ES5 模拟 class 的完整行为。
 */

// ES6 写法（用于对比）：
// class Person {
//   constructor(name, age) { this.name = name; this.age = age; }
//   greet() { return `Hi, I'm ${this.name}`; }
//   get info() { return `${this.name} (${this.age})`; }
//   static create(name, age) { return new Person(name, age); }
// }

// ES5 手写实现
function Person(name, age) {
  // 对应 constructor
  if (!(this instanceof Person)) {
    throw new TypeError('Class constructor cannot be invoked without \'new\'');
  }
  this.name = name;
  this.age = age;
}

// 实例方法挂在原型上
Person.prototype.greet = function () {
  return "Hi, I'm " + this.name;
};

Person.prototype.haveBirthday = function () {
  this.age++;
  return this.age;
};

// getter/setter 通过 Object.defineProperty 实现
Object.defineProperty(Person.prototype, 'info', {
  get: function () {
    return this.name + ' (' + this.age + ')';
  },
  enumerable: true,
  configurable: true
});

// 静态方法挂在构造函数上
Person.create = function (name, age) {
  return new Person(name, age);
};

// 防止 prototype 被修改/枚举（class 的原型不可枚举）
Object.defineProperty(Person.prototype, 'constructor', {
  value: Person,
  enumerable: false,
  writable: true,
  configurable: true
});

// 测试
console.log('--- Basic Class ---');
var p = new Person('Alice', 25);
console.log(p.name);        // Alice
console.log(p.age);         // 25
console.log(p.greet());     // Hi, I'm Alice
console.log(p.info);        // Alice (25)

console.log('--- Methods ---');
p.haveBirthday();
console.log(p.age);         // 26
console.log(p.info);        // Alice (26)

console.log('--- Static Method ---');
var p2 = Person.create('Bob', 30);
console.log(p2.name);       // Bob
console.log(p2.greet());    // Hi, I'm Bob

console.log('--- new check ---');
try {
  Person('Charlie', 20); // 不用 new 会抛错
} catch (e) {
  console.log(e.message); // Class constructor cannot be invoked without 'new'
}

console.log('--- instanceof ---');
console.log(p instanceof Person); // true
console.log(p2 instanceof Person); // true

// 验证方法不可枚举（与 class 行为一致）
console.log('--- Non-enumerable methods ---');
console.log(Object.keys(p));           // ['name', 'age']（方法不在其中）
console.log(Object.getOwnPropertyNames(Person.prototype));
// ['constructor', 'greet', 'haveBirthday', 'info']
