// 20. for-of遍历数组

const numbers = [10, 20, 30];
for (const value of numbers) console.log(value);
for (const [index, value] of numbers.entries()) console.log(index, value);
