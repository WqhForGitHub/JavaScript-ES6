// 88. Object.freeze冻结测试

const obj = Object.freeze({ name: 'Alice', nested: { age: 20 } });
obj.name = 'Bob';
obj.nested.age = 21;
console.log(obj.name, obj.nested.age, Object.isFrozen(obj));
