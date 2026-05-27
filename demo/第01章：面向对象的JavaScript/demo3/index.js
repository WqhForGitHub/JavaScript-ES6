// ==============================
// 原型继承与 Object.create
// ==============================

console.log('=== 原型链继承 ===');

var obj = {
  name: 'sven',
  getName: function() {
    return this.name;
  }
};

var A = function() {};
A.prototype = obj;

var a = new A();
console.log(a.getName());          // sven
console.log(a.name);               // sven

// a 通过原型链访问到 obj 的属性和方法
// a.__proto__ === A.prototype === obj

// ==============================
// Object.create —— 基于原型的克隆
// ==============================

console.log('\n=== Object.create ===');

var Plane = function() {
  this.blood = 100;
  this.attackLevel = 1;
  this.defenseLevel = 1;
};

var plane = new Plane();
plane.blood = 500;
plane.attackLevel = 10;
plane.defenseLevel = 7;

var clonePlane = Object.create(plane);
console.log('clonePlane.blood:', clonePlane.blood);           // 500
console.log('clonePlane.attackLevel:', clonePlane.attackLevel); // 10
console.log('clonePlane.defenseLevel:', clonePlane.defenseLevel); // 7

// clonePlane 并非 Plane 的实例，而是以 plane 为原型的对象
console.log('clonePlane instanceof Plane:', clonePlane instanceof Plane); // false

// clonePlane 通过原型链访问 plane 的属性
console.log('clonePlane.__proto__ === plane:', clonePlane.__proto__ === plane); // true

// 修改 clonePlane 的属性不影响 plane
clonePlane.blood = 200;
console.log('clonePlane.blood:', clonePlane.blood);  // 200 (自身属性)
console.log('plane.blood:', plane.blood);            // 500 (不变)

// ==============================
// 模拟 new 操作符 —— objectFactory
// ==============================

console.log('\n=== objectFactory 模拟 new ===');

var objectFactory = function() {
  var Constructor = [].shift.call(arguments); // 取出构造函数
  var obj = new Object();                     // 创建新对象
  obj.__proto__ = Constructor.prototype;      // 指向构造函数的原型
  var ret = Constructor.apply(obj, arguments); // 执行构造函数，绑定 this
  return typeof ret === 'object' ? ret : obj;  // 确保返回对象
};

var Person = function(name) {
  this.name = name;
};

Person.prototype.getName = function() {
  return this.name;
};

var p1 = objectFactory(Person, 'sven');
console.log('p1.name:', p1.name);               // sven
console.log('p1.getName():', p1.getName());     // sven
console.log('p1 instanceof Person:', p1 instanceof Person); // true
console.log('p1.__proto__ === Person.prototype:', p1.__proto__ === Person.prototype); // true

// 与原生 new 对比
var p2 = new Person('Tom');
console.log('p2.name:', p2.name);               // Tom
console.log('p2.getName():', p2.getName());     // Tom
console.log('p2 instanceof Person:', p2 instanceof Person); // true

// ==============================
// __proto__ 与 Constructor.prototype 的关系
// ==============================

console.log('\n=== __proto__ 与 prototype ===');

var Animal = function(name) {
  this.name = name;
};

Animal.prototype.run = function() {
  console.log(this.name + ' is running');
};

var cat = new Animal('kitty');
cat.run(); // kitty is running

// cat.__proto__ 指向 Animal.prototype
console.log('cat.__proto__ === Animal.prototype:', cat.__proto__ === Animal.prototype); // true

// 原型链查找：cat 自身没有 run 方法，通过 __proto__ 在 Animal.prototype 上找到
console.log('cat.hasOwnProperty("name"):', cat.hasOwnProperty('name')); // true
console.log('cat.hasOwnProperty("run"):', cat.hasOwnProperty('run'));   // false
