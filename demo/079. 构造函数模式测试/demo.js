// 79. 构造函数模式测试

function User(name) {
  this.name = name;
}
User.prototype.sayHi = function () {
  return `Hi, ${this.name}`;
};
const user = new User("Alice");
console.log(user.sayHi(), user instanceof User);
