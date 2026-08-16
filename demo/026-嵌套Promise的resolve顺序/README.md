# 026 - 嵌套 Promise 的 resolve 顺序

## 题目

```javascript
const promiseWrapper = () =>
  new Promise((resolve, reject) => {
    console.log("A");
    let p = new Promise((resolve, reject) => {
      console.log("B");
      setTimeout(() => {
        console.log("timer start");
        resolve("timer succeed");
        console.log("timer end");
      }, 0);
      resolve("inner succeed");
    });
    resolve("outer succeed");
    p.then((res) => {
      console.log(res);
    });
  });

promiseWrapper().then((res) => {
  console.log(res);
});
console.log(4);
```

## 题目分析

考查 **嵌套 Promise 的状态互不影响** 与 **先落定者生效**：

同步阶段（两个执行器都会同步执行）：

1. 外层执行器：输出 `A`。
2. 内层执行器：输出 `B`，注册定时器，`resolve("inner succeed")` → 内层 Promise（p）立即落定，`resolve("timer succeed")` 之后将被忽略。
3. 外层 `resolve("outer succeed")` → 外层 Promise 落定（与内层完全独立）。
4. `p.then` 回调入微任务队列（微任务 ①）；`promiseWrapper().then` 回调入队（微任务 ②）。
5. 输出 `4`。

异步阶段：

6. 微任务 ①：`inner succeed`。
7. 微任务 ②：`outer succeed`。
8. 宏任务（定时器）：`timer start`（resolve 被忽略）、`timer end`。

## 运行结果

```
A
B
4
inner succeed
outer succeed
timer start
timer end
```

## 运行

```bash
node index.js
```
