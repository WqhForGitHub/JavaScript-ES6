// 18. Object.keys遍历工具

const obj = Object.create({ inherited: true });
Object.defineProperty(obj, "hidden", { value: 1, enumerable: false });
obj.name = "Alice";
obj.age = 20;
console.log(Object.keys(obj));
console.log(Object.getOwnPropertyNames(obj));
