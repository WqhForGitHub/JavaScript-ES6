/**
 * 手写 super 关键字（ES5 模拟）
 *
 * ES6 的 super 在子类中用于调用父类的构造函数和方法。
 * - super(...) 在 constructor 中调用父类构造函数
 * - super.method() 调用父类的方法
 * 这里在 ES5 中通过保存父类原型引用来模拟 super 的行为。
 */

// 父类
function Shape(type) {
  this.type = type;
}

Shape.prototype.describe = function () {
  return 'A ' + this.type;
};

Shape.prototype.area = function () {
  return 0;
};

Shape.prototype.toString = function () {
  return 'Shape: ' + this.type;
};

// 子类：手动模拟 super
function Circle(radius) {
  // 模拟 super(type) -> 调用父类构造函数
  var Super = Circle.__super__; // 保存的父类引用
  Super.constructor.call(this, 'circle');
  this.radius = radius;
}

// 建立继承关系
Circle.__super__ = Shape.prototype; // 模拟 super 的引用
Circle.prototype = Object.create(Shape.prototype);
Object.defineProperty(Circle.prototype, 'constructor', {
  value: Circle,
  enumerable: false,
  writable: true,
  configurable: true
});

// 模拟 super.method() 调用父类方法
Circle.prototype.area = function () {
  return Math.PI * this.radius * this.radius;
};

// 重写 toString 但调用父类的 toString（模拟 super.toString()）
Circle.prototype.toString = function () {
  // super.toString() -> Circle.__super__.toString.call(this)
  var parentResult = Circle.__super__.toString.call(this);
  return parentResult + ' with radius ' + this.radius;
};

// 通用 helper：创建可调用 super 的方法
function createSuperMethod(parentProto, methodName, fn) {
  return function () {
    var self = this;
    var superMethod = function () {
      return parentProto[methodName].apply(self, arguments);
    };
    return fn.call(this, superMethod, arguments);
  };
}

// 使用 helper 创建带 super 调用的方法
function Rectangle(width, height) {
  Rectangle.__super__.constructor.call(this, 'rectangle');
  this.width = width;
  this.height = height;
}
Rectangle.__super__ = Shape.prototype;
Rectangle.prototype = Object.create(Shape.prototype);
Object.defineProperty(Rectangle.prototype, 'constructor', {
  value: Rectangle,
  enumerable: false,
  writable: true,
  configurable: true
});

Rectangle.prototype.describe = createSuperMethod(
  Rectangle.__super__,
  'describe',
  function (superMethod) {
    // 调用 super.describe() 并在此基础上扩展
    return superMethod() + ' (' + this.width + 'x' + this.height + ')';
  }
);

Rectangle.prototype.area = function () {
  return this.width * this.height;
};

// 测试
console.log('--- Circle (super in constructor) ---');
var circle = new Circle(5);
console.log(circle.type);     // circle（由 super 设置）
console.log(circle.radius);   // 5
console.log(circle.area().toFixed(2)); // 78.54
console.log(circle.describe()); // A circle
console.log(circle.toString()); // Shape: circle with radius 5（调用了 super.toString()）

console.log('--- Rectangle (super in method) ---');
var rect = new Rectangle(4, 6);
console.log(rect.type);       // rectangle
console.log(rect.area());     // 24
console.log(rect.describe()); // A rectangle (4x6)（调用了 super.describe()）

console.log('--- instanceof ---');
console.log(circle instanceof Circle); // true
console.log(circle instanceof Shape);  // true
console.log(rect instanceof Rectangle); // true
console.log(rect instanceof Shape);     // true

// 验证 super 调用的是父类方法
console.log('--- Verify super call ---');
console.log(Shape.prototype.toString.call(circle)); // Shape: circle（父类原始方法）
console.log(circle.toString()); // Shape: circle with radius 5（子类 + super 扩展）
