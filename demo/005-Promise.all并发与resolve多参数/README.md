# 005 - Promise.all 并发与 resolve 多参数

## 题目

```javascript
function runAsync(num) {
  return new Promise((r) => setTimeout(() => r(num, console.log(num)), 1000));
}

Promise.all([runAsync(1), runAsync(2), runAsync(3)]).then((res) =>
  console.log(res),
);
```

## 题目分析

考查 **Promise.all 并发执行**、**resolve 只取第一个参数** 与 **结果顺序**：

- 三个 `runAsync` 在构建数组时 **同步立即执行**，三个 `setTimeout` 几乎同时注册，1 秒后按注册顺序依次触发。
- `r(num, console.log(num))`：`console.log(num)` 会立即执行输出；`resolve` **只接收第一个参数**，多余参数被忽略。
- `Promise.all` 的结果顺序由 **输入数组的顺序** 决定，与各 Promise 完成先后无关。

执行过程：

1. 三个 setTimeout 注册，1 秒后依次触发：输出 `1`、`2`、`3`，各自 resolve。
2. `Promise.all` 全部完成后 resolve：输出 `[ 1, 2, 3 ]`。

## 运行结果

```
1
2
3
[ 1, 2, 3 ]
```

## 运行

```bash
node index.js
```
