// 112. class构造函数模拟

function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return 'Hi ' + this.name;
};
console.log(new Person('Grace').sayHi());
