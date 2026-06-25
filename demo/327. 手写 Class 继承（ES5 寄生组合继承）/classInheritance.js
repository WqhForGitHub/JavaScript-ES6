/**
 * 手写 Class 继承（ES5 寄生组合继承）
 *
 * ES6 的 extends 本质上是寄生组合式继承：
 * 1. 子类原型指向父类原型的副本（Object.create），避免调用父类构造函数
 * 2. 在子类构造函数中调用父类构造函数（call/apply），继承实例属性
 * 3. 修正 constructor 指向
 * 这里用 ES5 实现完整的继承链。
 */

// 父类
function Animal(name) {
  if (!(this instanceof Animal)) {
    throw new TypeError("Class constructor cannot be invoked without 'new'");
  }
  this.name = name;
}

Animal.prototype.speak = function () {
  return this.name + " makes a sound";
};

Animal.prototype.eat = function () {
  return this.name + " is eating";
};

// 静态方法
Animal.create = function (name) {
  return new Animal(name);
};

// 子类（寄生组合继承）
function Dog(name, breed) {
  if (!(this instanceof Dog)) {
    throw new TypeError("Class constructor cannot be invoked without 'new'");
  }
  // 调用父类构造函数（继承实例属性）
  Animal.call(this, name);
  this.breed = breed;
}

// 寄生组合继承核心：创建一个以父类原型为原型的空对象作为子类原型
Dog.prototype = Object.create(Animal.prototype);
// 修正 constructor 指向
Object.defineProperty(Dog.prototype, "constructor", {
  value: Dog,
  enumerable: false,
  writable: true,
  configurable: true,
});

// 子类方法
Dog.prototype.bark = function () {
  return this.name + " (" + this.breed + ") barks: Woof!";
};

// 重写父类方法
Dog.prototype.speak = function () {
  return this.name + " barks";
};

// 子类静态方法（继承父类静态方法）
Dog.create = function (name, breed) {
  return new Dog(name, breed);
};

// 通用继承工具函数（封装寄生组合继承）
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Object.defineProperty(Child.prototype, "constructor", {
    value: Child,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  // 继承静态方法
  Object.keys(Parent).forEach(function (key) {
    Child[key] = Parent[key];
  });
}

// 再定义一个子类测试通用继承
function Cat(name, color) {
  Animal.call(this, name);
  this.color = color;
}
inherit(Cat, Animal);
Cat.prototype.meow = function () {
  return this.name + " (" + this.color + ") meows";
};

// 测试
console.log("--- Dog inherits Animal ---");
var dog = new Dog("Rex", "Labrador");
console.log(dog.name); // Rex
console.log(dog.breed); // Labrador
console.log(dog.speak()); // Rex barks（重写的方法）
console.log(dog.eat()); // Rex is eating（继承的方法）
console.log(dog.bark()); // Rex (Labrador) barks: Woof!

console.log("--- instanceof ---");
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true

console.log("--- Cat inherits Animal ---");
var cat = new Cat("Whiskers", "black");
console.log(cat.name); // Whiskers
console.log(cat.color); // black
console.log(cat.speak()); // Whiskers makes a sound（未重写，使用父类）
console.log(cat.meow()); // Whiskers (black) meows
console.log(cat instanceof Cat); // true
console.log(cat instanceof Animal); // true

console.log("--- Static inheritance ---");
var d2 = Dog.create("Buddy", "Golden");
console.log(d2.bark()); // Buddy (Golden) barks: Woof!

// 验证原型链
console.log("--- Prototype chain ---");
console.log(Dog.prototype.constructor === Dog); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true
