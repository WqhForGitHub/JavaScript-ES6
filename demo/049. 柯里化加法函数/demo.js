// 49. 柯里化加法函数

const add = (a) => (b) => (c) => a + b + c;
console.log(add(1)(2)(3));
