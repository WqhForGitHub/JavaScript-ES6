// 26. Symbol唯一性测试

const a = Symbol("id");
const b = Symbol("id");
console.log(a === b);
console.log(Symbol.for("x") === Symbol.for("x"));
const obj = { [a]: 1, id: 2 };
console.log(Object.keys(obj), Object.getOwnPropertySymbols(obj));
