// 34. 普通函数this指向测试

function show() {
  return this.name;
}
const user = { name: 'Alice', show };
console.log(user.show());
console.log(show.call({ name: 'Bob' }));
