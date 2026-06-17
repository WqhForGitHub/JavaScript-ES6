// 80. new操作符原理模拟

function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  return result && typeof result === "object" ? result : obj;
}
function User(name) {
  this.name = name;
}
console.log(myNew(User, "Alice") instanceof User);
