// 37. bind绑定函数测试

function greet(word) {
  return `${word}, ${this.name}`;
}
const hiAlice = greet.bind({ name: "Alice" }, "Hi");
console.log(hiAlice());
