# 022 - await 未决议 Promise 永久阻塞

## 题目

```javascript
async function runAsync() {
  console.log("async start");
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
```

## 题目分析

考查 **await 一个永远不落定的 Promise**：

- Promise 执行器中没有调用 `resolve` / `reject`，该 Promise **永远是 pending**。
- `await` 会一直等待这个 pending 的 Promise，函数被 **永久暂停** 在 await 处。
- 因此 `async end`、`return "async result"` 永远不会执行，外层 `.then` 也永远不会触发。
- 同步代码正常执行：`main start` → `async start` → `promise`（执行器同步执行）→ `main end`。
- 事件循环中没有剩余任务后进程直接退出（pending 的 Promise 不会阻止进程退出）。

## 运行结果

```
main start
async start
promise
main end
```

## 运行

```bash
node index.js
```
