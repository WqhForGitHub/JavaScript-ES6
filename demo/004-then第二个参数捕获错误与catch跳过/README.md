# 004 - then 第二个参数捕获错误与 catch 跳过

## 题目

```javascript
Promise.reject("error")
  .then(
    (res) => {
      console.log("succeed", res);
    },
    (err) => {
      console.log("innerError", err);
    },
  )
  .catch((err) => {
    console.log("catch", err);
  });
```

## 题目分析

考查 **then 的第二个参数（onRejected）** 与 **catch** 的关系：

- `then(onFulfilled, onRejected)` 的第二个参数同样可以处理 rejected 状态的 Promise。
- `Promise.reject("error")` 进入 rejected 状态，`then` 的成功回调被跳过，错误回调执行。
- 错误回调正常执行且 **没有抛出异常**，链上下一个 Promise 变为 **fulfilled** 状态。
- 后面的 `catch` 只捕获 rejected 状态，此时已被 `then` 的第二个参数"消化"，因此 **catch 不会执行**。

执行过程：

1. `Promise.reject("error")` → rejected，值为 `"error"`。
2. `then` 的第二个参数执行：输出 `innerError error`，链上状态变为 fulfilled。
3. `catch` 被跳过。

## 运行结果

```
innerError error
```

## 运行

```bash
node index.js
```
