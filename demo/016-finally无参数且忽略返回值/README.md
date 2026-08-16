# 016 - finally 无参数且忽略返回值

## 题目

```javascript
Promise.resolve("A")
  .then((res) => {
    console.log("promise1", res);
  })
  .finally(() => {
    console.log("finally1");
  });
Promise.resolve("B")
  .finally(() => {
    console.log("finally2");
    return "result";
  })
  .then((res) => {
    console.log("promise2", res);
  });
```

## 题目分析

考查 **finally 的两个特性**：

- finally 的回调 **不接收任何参数**，无法拿到上一步的值（与成功/失败无关，都会执行）。
- finally 回调中的 **返回值会被忽略**（除非 throw 或返回 rejected Promise），上一步的值会 **原样传递** 给下一个 then。

执行过程（两条链的微任务按注册顺序交替执行）：

1. 微任务 1：`promise1 A`，链 1 的 finally1 入队。
2. 微任务 2：`finally2`，`return "result"` 被忽略，`"B"` 继续传递，then2 入队。
3. 微任务 3：`finally1`。
4. 微任务 4：`promise2 B`（不是 "result"）。

## 运行结果

```
promise1 A
finally2
finally1
promise2 B
```

## 运行

```bash
node index.js
```
