// 91. Symbol属性对象测试

const id = Symbol('id');
const user = { name: 'Alice', [id]: 123 };
console.log(Object.keys(user));
console.log(Object.getOwnPropertySymbols(user));
console.log(user[id]);
