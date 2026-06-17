// 123. 类表达式使用

const User = class {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
};
console.log(new User("Lin").getName());
