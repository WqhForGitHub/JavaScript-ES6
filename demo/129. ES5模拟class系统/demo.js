// 129. ES5模拟class系统

function Person(name) {
  this.name = name;
}
Person.prototype.say = function () {
  return this.name;
};
console.log(new Person('ES5').say());
