# 020 - await 暂停与同步代码优先执行

## 题目

```javascript
async function runAsync() {
  console.log("runAsync start");
  await asyncFunc();
  console.log("runAsync end");
}

async function asyncFunc() {
  console.log("do something");
}

runAsync();
console.log("start");
```

## 题目分析

考查 **async/await 的基础执行时机**：

- async 函数中 **await 之前的代码是同步执行** 的：`runAsync start`、`do something` 都在调用时立即输出。
- asyncFunc 是 async 函数，没有 return，返回的是 fulfilled（undefined）的 Promise。
- `await` 会 **暂停当前 async 函数**，把 `await` 之后的代码（`runAsync end`）放入 **微任务队列**，让出主线程。
- 主线程的同步代码 `start` 先执行，最后微任务输出 `runAsync end`。

## 运行结果

```
runAsync start
do something
start
runAsync end
```

## 运行

```bash
node index.js
```
