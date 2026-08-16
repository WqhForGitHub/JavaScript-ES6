# 003 - then 非函数参数的值穿透

## 题目

```javascript
Promise.resolve("A").then("B").then(Promise.resolve("C")).then(console.log);
```

## 题目分析

考查 **Promise 值穿透（value penetration）**：

- `then(onFulfilled, onRejected)` 期望两个参数都是函数。
- 当传入的 **不是函数**（如字符串 `"B"`、或一个 Promise 对象 `Promise.resolve("C")`）时，该参数会被忽略，上一阶段的值会 **原样穿透** 到下一个 `then`。
- 注意：`Promise.resolve("C")` 是一个 **Promise 对象**，不是函数，所以它不会被执行，也不会展开其内部值，只是被忽略。

执行过程：

1. `Promise.resolve("A")` → fulfilled，值为 `"A"`。
2. `.then("B")`：`"B"` 不是函数，忽略，值 `"A"` 穿透。
3. `.then(Promise.resolve("C"))`：参数是 Promise 对象，不是函数，忽略，值 `"A"` 穿透。
4. `.then(console.log)`：`console.log` 是函数，以 `"A"` 调用 → 输出 `A`。

## 运行结果

```
A
```

## 运行

```bash
node index.js
```
