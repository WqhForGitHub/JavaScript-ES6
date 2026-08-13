// 82. Object.assign浅拷贝

const source = { name: 'Alice', info: { age: 20 } };
const copy = Object.assign({}, source);
copy.info.age = 21;
console.log(source.info.age, copy.info.age);
