# 013 - setTimeout 中 resolve 与微任务时机

## 题目

```javascript
const newPromise = new Promise((resolve, reject) => {
  console.log("A");
  setTimeout(() => {
    console.log("timer start");
    resolve("succeed");
    console.log("timer end");
  }, 0);
  console.log("B");
});
newPromise.then((result) => {
  console.log(result);
});
console.log("C");
```

## 题目分析

考查 **宏任务、微任务的执行顺序** 以及 **resolve 只是将回调入队**：

- 执行器同步执行：输出 `A`、`B`（setTimeout 只是注册回调，不立即执行）。
- `then` 的回调被注册，但 Promise 还未落定，暂不进入微任务队列。
- 同步输出 `C`。
- 定时器回调（宏任务）执行：`timer start` → `resolve("succeed")`（此时才把 `then` 的回调放入 **微任务队列**）→ `timer end`。
- **当前宏任务执行完才会清空微任务队列**，所以 `succeed` 在 `timer end` 之后输出。

## 运行结果

```
A
B
C
timer start
timer end
succeed
```

## 运行

```bash
node index.js
```
