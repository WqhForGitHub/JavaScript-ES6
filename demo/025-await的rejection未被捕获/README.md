# 025 - await 的 rejection 未被捕获

## 题目

```javascript
async function runAsync() {
  await promiseFunc();
  console.log("async");
  return "async result";
}

async function promiseFunc() {
  return new Promise((resolve, reject) => {
    console.log("promise");
    reject("error");
  });
}

runAsync().then((res) => console.log(res));
```

## 题目分析

考查 **await 遇到 rejected Promise 会抛出异常**：

- `promiseFunc` 返回的 Promise 被 `reject("error")`。
- `await` 一个 rejected 的 Promise 相当于在 await 处 `throw`，runAsync 的后续代码（`async`）**被跳过**，runAsync 自身的 Promise 变为 rejected。
- 外层只有 `.then`，**没有 catch / 第二个参数**，该 rejection 无人处理，成为 **未捕获的 Promise 拒绝（UnhandledPromiseRejection）**：
  - Node.js 15 及以上：进程会输出错误并以非 0 状态码退出（`ERR_UNHANDLED_REJECTION`）。
  - 浏览器：触发 `unhandledrejection` 事件，控制台报错。

修复方式：在链尾加 `.catch((err) => console.log(err))`，或在 runAsync 内用 `try/catch` 包裹 await。

## 运行结果

```
promise
[UnhandledPromiseRejection: This error originated either by throwing
inside of an async function without a catch block, or by rejecting a
promise which was not handled with .catch(). The promise rejected with
the reason "error".] {
  code: 'ERR_UNHANDLED_REJECTION'
}
```

## 运行

```bash
node index.js
```
