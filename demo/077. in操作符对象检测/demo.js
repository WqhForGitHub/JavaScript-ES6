// 77. in操作符对象检测

const obj = Object.create({ inherited: 1 });
obj.own = 2;
console.log("own" in obj);
console.log("inherited" in obj);
console.log("missing" in obj);
