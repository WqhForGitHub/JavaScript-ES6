# 028 - 重复 resolve 忽略与 finally 无参数

## 题目

```javascript
const myPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve("succeed3");
    console.log("timer");
  }, 0);
  resolve("succeed1");
  resolve("succeed2");
})
  .then((res) => {
    console.log(res);
    setTimeout(() => {
      console.log(myPromise);
    }, 1000);
  })
  .finally((res) => {
    console.log("finally", res);
  });
```

## 题目分析

综合考查 **状态只改一次**、**finally 不接收参数** 与 **链式变量引用**：

1. 执行器同步执行：注册 0ms 定时器；`resolve("succeed1")` 生效；`resolve("succeed2")` 被忽略。
2. 微任务 ①：then 回调输出 `succeed1`，并注册 1 秒定时器；then 返回的 Promise（值 undefined）落定 → finally 回调入队。
3. 微任务 ②：finally 回调 **不接收参数**，`res` 为 `undefined`，输出 `finally undefined`。
4. t = 0s：定时器触发，`resolve("succeed3")` 被忽略（状态已定），输出 `timer`。
5. t = 1s：输出 `myPromise`。注意 `myPromise` 是 **整条链（finally 阶段）返回的 Promise**，不是最初的那个，其值为 then 回调返回的 `undefined`，状态已 fulfilled → `Promise { undefined }`。

## 运行结果

```
succeed1
finally undefined
timer
Promise { undefined }
```

## 运行

```bash
node index.js
```
