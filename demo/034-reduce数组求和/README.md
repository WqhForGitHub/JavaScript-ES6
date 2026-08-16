# 034 - 使用 reduce 对数组求和

## 基础用法

```js
const arr = [1, 2, 3, 4, 5];

// reduce((累加值, 当前值) => ..., 初始值)
const sum = arr.reduce((acc, cur) => acc + cur, 0);

console.log(sum); // 15
```

> 建议始终传入初始值 `0`：
> 不传初始值时，`reduce` 会用数组第一个元素作为初始值，**空数组会直接报错**。

```js
// 不传初始值的隐患
const empty = [];
// empty.reduce((acc, cur) => acc + cur); // TypeError: Reduce of empty array with no initial value
empty.reduce((acc, cur) => acc + cur, 0); // 0，安全
```

## 执行过程解析

```js
const arr = [1, 2, 3, 4];

const sum = arr.reduce((acc, cur, index) => {
  console.log(`第 ${index} 次调用：acc=${acc}, cur=${cur}`);
  return acc + cur;
}, 0);

// 第 0 次调用：acc=0, cur=1
// 第 1 次调用：acc=1, cur=2
// 第 2 次调用：acc=3, cur=3
// 第 3 次调用：acc=6, cur=4
console.log(sum); // 10
```

## 扩展用法

```js
// 1. 对象数组按字段求和
const items = [
  { name: '苹果', price: 5, count: 2 },
  { name: '香蕉', price: 3, count: 4 },
];
const total = items.reduce((sum, item) => sum + item.price * item.count, 0);
console.log(total); // 22

// 2. 二维数组按子数组求和后汇总
const matrix = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const matrixSum = matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
console.log(matrixSum); // 21

// 3. 字符串数组拼接（类似 join）
const words = ['JS', '手写', '代码', '题'];
console.log(words.reduce((acc, cur) => acc + cur, '')); // JS手写代码题

// 4. 统计元素出现次数
const colors = ['red', 'blue', 'red', 'green', 'red'];
const countMap = colors.reduce((map, color) => {
  map[color] = (map[color] || 0) + 1;
  return map;
}, {});
console.log(countMap); // { red: 3, blue: 1, green: 1 }
```
