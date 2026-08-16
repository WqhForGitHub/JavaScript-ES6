# 018 - Promise.race 首个 resolve 胜出

## 题目

```javascript
function runAsync(num) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(num, console.log(num)), 1000),
  );
}

Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log(err));
```

## 题目分析

考查 **Promise.race 的落定规则**：

- race 由 **第一个落定（settle）** 的 Promise 决定结果，其余 Promise 的结果被忽略（但它们本身仍会执行完）。
- 三个定时器都是 1s，延时相同时按 **注册顺序** 触发：1 → 2 → 3。

执行过程：

1. t = 1s，定时器 1 触发：输出 `1`，`resolve(1)` 使 race 变为 fulfilled，then 回调进入微任务队列。
2. **当前宏任务（定时器 1）结束后立即清空微任务**：输出 `res:  1`。
3. 定时器 2、3 依次触发：输出 `2`、`3`（resolve 无效，race 已落定）。

## 运行结果

```
1
res:  1
2
3
```

## 运行

```bash
node index.js
```
