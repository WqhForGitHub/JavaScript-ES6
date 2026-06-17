// 76. hasOwnProperty检测器

const obj = Object.create({ inherited: true });
obj.own = true;
console.log(obj.hasOwnProperty("own"));
console.log(obj.hasOwnProperty("inherited"));
console.log(Object.prototype.hasOwnProperty.call(obj, "own"));
