// 94. Reflect方法调用测试

const obj = { name: 'Alice' };
console.log(Reflect.has(obj, 'name'));
Reflect.set(obj, 'age', 20);
console.log(Reflect.get(obj, 'age'));
console.log(Reflect.ownKeys(obj));
