// 95. 对象遍历性能测试

const obj = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
console.time('Object.keys');
let sum = 0;
for (const key of Object.keys(obj)) sum += obj[key];
console.timeEnd('Object.keys');
console.log(sum);
