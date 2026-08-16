# 015 - then 返回 Error 不触发 catch

## 题目

```javascript
Promise.resolve()
  .then(() => {
    return new Error("error");
  })
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
```

## 题目分析

考查 **return Error 与 throw Error 的区别**：

- `return new Error("error")` 只是把一个 Error 对象当作 **普通的返回值**，链式状态仍是 fulfilled，**不会触发 catch**。
- 只有 `throw new Error(...)` 或 `return Promise.reject(...)` 才会让链式状态变为 rejected。
- 所以 Error 对象会作为参数原样传给下一个 `then`。

对比：

- `return new Error("error")` → 走 `then`，res 是 Error 对象。
- `throw new Error("error")` → 走 `catch`。

## 运行结果

```
then:  Error: error
    at E:\...\015-then返回Error不触发catch\index.js:3:12
```

说明：`console.log` 打印 Error 对象时会附带调用堆栈，但仍走的是 `then` 而非 `catch`。

## 运行

```bash
node index.js
```
