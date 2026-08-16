# 017 - Promise.all 任一 reject 即失败

## 题目

```javascript
function runAsync(num) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(num, console.log(num)), 1000),
  );
}

function runReject(num) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(`Error: ${num}`, console.log(num)), 1000 * num),
  );
}

Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
```

## 题目分析

考查 **Promise.all 的快速失败（fail-fast）**：

- 四个 Promise 在数组创建时就 **同时启动（并发执行）**，定时器延时分别为 1s、4s、1s、2s。
- `resolve` / `reject` 的第二个参数会被忽略（只接收第一个参数），但 `console.log(num)` 是同步执行的，正常输出。

时间线：

1. t = 1s：输出 `1`、`3`（两个 runAsync 定时器按注册顺序触发，先后 resolve）。
2. t = 2s：输出 `2`，runReject(2) reject → **Promise.all 立即整体 reject**，走 catch 输出 `Error: 2`。
3. t = 4s：输出 `4`（定时器已注册，仍会照常执行，只是结果被忽略）。

## 运行结果

```
1
3
2
Error: 2
4
```

## 运行

```bash
node index.js
```
