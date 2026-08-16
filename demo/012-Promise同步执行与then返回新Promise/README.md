# 012 - Promise 同步执行与 then 返回新 Promise

## 题目

```javascript
const newPromise1 = new Promise((resolve, reject) => {
  console.log("A");
  resolve("B");
});
const newPromise2 = newPromise1.then((res) => {
  console.log(res);
});
console.log("C", newPromise1);
console.log("D", newPromise2);
```

## 题目分析

考查 **Promise 执行器同步执行** 与 **then 返回新 Promise**：

- Promise 构造函数的执行器（executor）是 **同步执行** 的，所以 `A` 最先输出。
- `resolve("B")` 之后 `newPromise1` 的状态立即变为 **fulfilled**，值为 `"B"`。
- `then` 会返回一个 **全新的 Promise**（`newPromise2`），此时其回调还在微任务队列中等待，所以打印时它是 **pending** 状态。
- `then` 的回调是微任务，要等所有同步代码执行完才运行，所以 `"B"` 最后输出。

执行过程：

1. 执行器同步执行：输出 `A`，`newPromise1` 变为 fulfilled（`"B"`）。
2. `then` 注册回调进入微任务队列，返回 pending 的 `newPromise2`。
3. 同步输出 `C` + `newPromise1`（已是 `Promise { 'B' }`）。
4. 同步输出 `D` + `newPromise2`（还是 `Promise { <pending> }`）。
5. 同步代码执行完，微任务执行：输出 `B`。

## 运行结果

```
A
C Promise { 'B' }
D Promise { <pending> }
B
```

## 运行

```bash
node index.js
```
