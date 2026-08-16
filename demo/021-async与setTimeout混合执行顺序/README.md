# 021 - async 与 setTimeout 混合执行顺序

## 题目

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log("async1 timer");
  }, 0);
}

async function async2() {
  console.log("async2 start");
  setTimeout(() => {
    console.log("async2 timer");
  }, 0);
  console.log("async2 end");
}

async1();
setTimeout(() => {
  console.log("outer timer");
}, 0);
console.log("run");
```

## 题目分析

考查 **await 暂停 + 微任务 + 宏任务的完整事件循环**：

同步阶段：

1. `async1()`：输出 `async1 start`。
2. `await async2()`：async2 同步执行，输出 `async2 start`、注册 async2 timer（定时器 ①）、输出 `async2 end`。
3. async1 在 await 处暂停，`async1 end` 之后的代码进入微任务队列；主线程继续。
4. 注册 outer timer（定时器 ②），输出 `run`。

异步阶段：

5. 微任务：`async1 end` 输出，注册 async1 timer（定时器 ③）。
6. 宏任务（0ms 定时器按 **注册顺序** 触发）：① `async2 timer` → ② `outer timer` → ③ `async1 timer`。

## 运行结果

```
async1 start
async2 start
async2 end
run
async1 end
async2 timer
outer timer
async1 timer
```

## 运行

```bash
node index.js
```
