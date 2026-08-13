// 111. ES6 class定义测试

class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    return 'Hi ' + this.name;
  }
}
console.log(new Person('Ada').sayHi());
