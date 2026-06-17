// 99. 类数组对象转换

const arrayLike = { 0: "a", 1: "b", length: 2 };
console.log(Array.from(arrayLike));
console.log(Array.prototype.slice.call(arrayLike));
