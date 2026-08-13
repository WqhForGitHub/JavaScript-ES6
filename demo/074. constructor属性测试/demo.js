// 74. constructor属性测试

function Person(name) {
  this.name = name;
}
const alice = new Person('Alice');
console.log(alice.constructor === Person);
console.log(Person.prototype.constructor === Person);
