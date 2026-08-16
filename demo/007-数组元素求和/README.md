# 007 - 数组元素的求和

## 方式一：for 循环

```js
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 方式二：for...of

```js
function sum(arr) {
  let total = 0;
  for (const num of arr) {
    total += num;
  }
  return total;
}

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 方式三：reduce（推荐）

```js
const sum = (arr) => arr.reduce((acc, cur) => acc + cur, 0);

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 方式四：递归

```js
function sum(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sum(arr.slice(1));
}

console.log(sum([1, 2, 3, 4, 5])); // 15
```

## 方式五：eval（不推荐，仅了解）

```js
const sum = (arr) => eval(arr.join('+'));

console.log(sum([1, 2, 3, 4, 5])); // 15
```

> `eval` 有性能和安全问题，实际开发中禁止使用。

## 扩展：对象数组按某字段求和

```js
const items = [
  { name: '苹果', price: 5, count: 2 },
  { name: '香蕉', price: 3, count: 4 },
  { name: '橙子', price: 6, count: 1 },
];

const total = items.reduce((acc, item) => acc + item.price * item.count, 0);
console.log(total); // 28
```
