# 003 - 每隔一秒打印 1、2、3、4

## 方式一：let 块级作用域 + setInterval

```js
let timer = setInterval(() => {
  for (let i = 1; i < 5; i++) {
    setTimeout(() => {
      console.log(i);
      if (i === 4) clearInterval(timer);
    }, i * 1000);
  }
}, 0);
```

## 方式二：let + setInterval（最简洁）

```js
let i = 1;
let timer = setInterval(() => {
  console.log(i);
  i++;
  if (i > 4) clearInterval(timer);
}, 1000);
```

## 方式三：IIFE + var（经典面试题解法）

```js
for (var i = 1; i < 5; i++) {
  (function (j) {
    setTimeout(() => {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

> 使用 `var` 时，`setTimeout` 的回调是异步的，循环结束后 `i` 已经变成 5，
> 通过 IIFE（立即执行函数）把每次循环的 `i` 保存到参数 `j` 中。

## 方式四：setTimeout 递归（利用闭包）

```js
function print(n) {
  setTimeout(() => {
    console.log(n);
    if (n < 4) print(n + 1);
  }, 1000);
}

print(1);
```

## 方式五：async/await + sleep

```js
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function print() {
  for (let i = 1; i <= 4; i++) {
    await sleep(1000);
    console.log(i);
  }
}

print();
```
