# 024 - 微任务与宏任务综合执行顺序

## 题目

```javascript
async function runAsync() {
  await asyncFunc();
  console.log("async");
  return "async result";
}

async function asyncFunc() {
  console.log("do something");
}

console.log("main start");
setTimeout(function () {
  console.log("timer");
}, 0);
runAsync();
new Promise((resolve) => {
  console.log("promise");
  resolve();
}).then(function () {
  console.log("promise then");
});
console.log("main end");
```

## 题目分析

考查 **同步代码、微任务（await 恢复 + then）、宏任务（setTimeout）的综合排序**：

同步阶段：

1. `main start`。
2. 注册定时器（宏任务，暂不执行）。
3. `runAsync()`：asyncFunc 同步执行输出 `do something`；await 处暂停，`async` 入微任务队列（微任务 ①）。
4. `new Promise` 执行器同步输出 `promise`，then 回调入微任务队列（微任务 ②）。
5. `main end`。

异步阶段：

6. 微任务 ①：输出 `async`。
7. 微任务 ②：输出 `promise then`。
8. 宏任务：输出 `timer`。

关键点：await 后续代码与 then 回调 **同属微任务队列**，按 **入队顺序** 执行。

## 运行结果

```
main start
do something
promise
main end
async
promise then
timer
```

## 运行

```bash
node index.js
```
