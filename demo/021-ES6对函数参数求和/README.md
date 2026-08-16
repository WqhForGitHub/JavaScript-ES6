# 021 - ES6 语法对函数所有参数求和

## 方式一：rest 参数 + reduce（推荐）

```js
function sum(...nums) {
  return nums.reduce((acc, cur) => acc + cur, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(sum()); // 0
```

## 方式二：rest 参数 + for 循环

```js
function sum(...nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}

console.log(sum(1, 2, 3, 4)); // 10
```

## 方式三：rest 参数结合普通参数

```js
// 计算从 base 开始的所有参数之和
function sumFrom(base, ...nums) {
  return nums.reduce((acc, cur) => acc + cur, base);
}

console.log(sumFrom(100, 1, 2, 3)); // 106
```

## 方式四：箭头函数一行实现

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);

console.log(sum(10, 20, 30)); // 60
```

## 对比：ES5 使用 arguments

```js
// rest 参数必须是最后一个形参；arguments 是类数组对象
function sumEs5() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

console.log(sumEs5(1, 2, 3)); // 6
```

> rest 参数是真正的数组，可以直接使用 `reduce`、`map` 等数组方法，
> 且箭头函数中没有 `arguments`，只能用 rest 参数获取参数列表。
