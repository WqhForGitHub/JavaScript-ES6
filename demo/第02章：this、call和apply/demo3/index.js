// ==============================
// bind 的实现
// ==============================

console.log('=== 简化版 bind 实现 ===');

Function.prototype.bind = function(context) {
  var self = this; // 保存原函数

  return function() {
    return self.apply(context, arguments); // 绑定 context
  };
};

var obj = {
  name: 'sven'
};

var func = function() {
  console.log(this.name);
}.bind(obj);

func(); // sven

// ==============================
// bind 带偏函数（预设参数）
// ==============================

console.log('\n=== bind 实现偏函数 ===');

Function.prototype.bind = function(context) {
  var self = this;
  // 获取 bind 时传入的预设参数（除第一个 context 外）
  var presetArgs = Array.prototype.slice.call(arguments, 1);

  return function() {
    // 合并预设参数和调用时传入的参数
    var runtimeArgs = Array.prototype.slice.call(arguments);
    var finalArgs = presetArgs.concat(runtimeArgs);
    return self.apply(context, finalArgs);
  };
};

// 示例：预设乘数
var multiply = function(a, b) {
  return a * b;
};

// 创建一个始终乘以 2 的函数
var double = multiply.bind(null, 2);
console.log('double(5):', double(5));   // 10
console.log('double(10):', double(10)); // 20

// 创建一个始终乘以 3 的函数
var triple = multiply.bind(null, 3);
console.log('triple(5):', triple(5));   // 15

// ==============================
// 更完整的 bind 实现
// ==============================

console.log('\n=== 更完整的 bind 实现 ===');

Function.prototype.bind = function(context) {
  var self = this;
  var presetArgs = Array.prototype.slice.call(arguments, 1);
  var fBound = function() {
    var runtimeArgs = Array.prototype.slice.call(arguments);
    // 当作为构造函数时，this 指向实例，此时不需要绑定 context
    // 当作为普通函数时，this 指向 context
    var bindContext = this instanceof fBound ? this : context;
    return self.apply(bindContext, presetArgs.concat(runtimeArgs));
  };
  // 维护原型关系
  fBound.prototype = self.prototype;
  return fBound;
};

// 示例：作为普通函数使用
var obj2 = {
  name: 'anne'
};

var greet = function(greeting) {
  console.log(greeting + ', ' + this.name);
};

var greetAnne = greet.bind(obj2, 'Hello');
greetAnne(); // Hello, anne

// 示例：作为构造函数使用
var Person = function(name, age) {
  this.name = name;
  this.age = age;
};

Person.prototype.sayHi = function() {
  console.log('Hi, I am ' + this.name + ', ' + this.age + ' years old');
};

// 绑定预设 name 参数
var PersonWithName = Person.bind(null, 'sven');

var p = new PersonWithName(25);
console.log('p.name:', p.name); // sven
console.log('p.age:', p.age);   // 25
p.sayHi(); // Hi, I am sven, 25 years old
