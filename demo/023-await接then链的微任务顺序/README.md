# 023 - await 接 then 链的微任务顺序

## 题目

```javascript
async function runAsync() {
  console.log("async start");
  await new Promise((resolve, reject) => {
    console.log("promise");
    resolve("promise resolve");
  }).then((res) => console.log(res));
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
```

## 题目分析

考查 **await 等待的是整条 then 链的最终结果**：

- `await` 后面接的是 `new Promise(...).then(...)` **整个表达式**，实际等待的是 then 返回的 **新 Promise（P2）**，而不是内层的 Promise。
- 执行器同步执行：`promise` 输出后立即 resolve，then 的回调进入微任务队列（微任务 ①）。
- runAsync 在 await 处暂停，主线程继续：`main start` 之后输出 `main end`。
- 微任务按顺序执行：
  1. 微任务 ①：then 回调输出 `promise resolve`，P2 随之落定 → await 恢复，async 后续代码入队（微任务 ②）。
  2. 微任务 ②：`async end` 输出，runAsync 的 Promise resolve → 外层 then 入队（微任务 ③）。
  3. 微任务 ③：`async result` 输出。

## 运行结果

```
main start
async start
promise
main end
promise resolve
async end
async result
```

## 运行

```bash
node index.js
```
