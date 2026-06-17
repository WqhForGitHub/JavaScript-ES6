// 89. Object.seal封装测试

const obj = { name: "Alice" };
Object.seal(obj);
obj.name = "Bob";
obj.age = 20;
delete obj.name;
console.log(obj, Object.isSealed(obj));
