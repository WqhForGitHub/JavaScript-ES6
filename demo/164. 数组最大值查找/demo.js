// 164. 数组最大值查找

const values = [5, 9, 1, 12, 3];
console.log(values.reduce((a, b) => (a > b ? a : b)));
console.log(Math.max(...values));
