// 22. 深浅拷贝类型测试

const source = { name: 'Alice', info: { age: 20 } };
const shallow = { ...source };
const deep = structuredClone(source);
shallow.info.age = 21;
console.log(source.info.age);
deep.info.age = 30;
console.log(source.info.age, deep.info.age);
