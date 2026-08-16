# 002 - Promise 链式调用与返回值

## 题目

```javascript
Promise.resolve("A")
  .then((res) => {
    console.log(res);
    return "B";
  })
  .catch((err) => {
    return "C";
  })
  .then((res) => {
    console.log(res);
  });
```

## 题目分析

考查 **Promise 链式调用** 中返回值与 `catch` 的行为：

- `then` 回调返回普通值时，链上下一个 `then` / `catch` 收到该值（被 Promise 包装后 resolve）。
- `catch` 本质上是 `then(undefined, onRejected)`：当上一步 **没有** 抛错/拒绝时，`catch` 会被跳过，但其返回的 Promise 仍会沿用上一步的值向下传递。
- 因此 `catch` 不触发，`"B"` 继续沿链向下传递给最后一个 `then`。

执行过程：

1. `Promise.resolve("A")` → fulfilled，值为 `"A"`。
2. 第一个 `then`：输出 `A`，`return "B"` → 链上变为 fulfilled，值为 `"B"`。
3. `catch`：无错误，跳过，值 `"B"` 继续向下传递。
4. 最后一个 `then`：输出 `B`。

## 运行结果

```
A
B
```

## 运行

```bash
node index.js
```
