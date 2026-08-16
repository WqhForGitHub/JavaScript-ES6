# 001 - Promise 与 setTimeout 事件循环

## 题目

```javascript
Promise.resolve().then(() => {
  console.log("outerPromise");
  const innerTimer = setTimeout(() => {
    console.log("innerTimer");
  }, 0);
});

const timer1 = setTimeout(() => {
  console.log("outerTimer");
  Promise.resolve().then(() => {
    console.log("innerPromise");
  });
}, 0);
console.log("run");
```

## 题目分析

考查 **事件循环** 中微任务（microtask）与宏任务（macrotask）的执行优先级：

- 同步代码先执行：`console.log("run")` 最先输出。
- `Promise.then` 属于微任务，会在当前宏任务结束后、下一个宏任务开始前清空。
- `setTimeout` 属于宏任务，按进入宏任务队列的先后顺序执行。
- 每执行完一个宏任务，都会清空一次微任务队列。

执行过程：

1. 同步：注册微任务 M1（输出 outerPromise 的 then）、注册宏任务 T1（timer1）、输出 `run`。
2. 清空微任务：执行 M1 → 输出 `outerPromise`，内部又注册宏任务 T2（innerTimer）。
3. 执行宏任务 T1 → 输出 `outerTimer`，注册微任务 M2。
4. 清空微任务：执行 M2 → 输出 `innerPromise`。
5. 执行宏任务 T2 → 输出 `innerTimer`。

## 运行结果

```
run
outerPromise
outerTimer
innerPromise
innerTimer
```

## 运行

```bash
node index.js
```
