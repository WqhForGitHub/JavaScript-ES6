# 019 - Promise.race 首个 reject 快速失败

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

Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log(err));
```

## 题目分析

考查 **race 先 reject 则整体失败，后续结果被忽略**：

- runReject(0) 的定时器延时为 `1000 * 0 = 0ms`，最先触发并 `reject("Error: 0")`。
- race 随即变为 rejected，走 `catch`，`then` 被跳过。
- 1 秒后三个 runAsync 的定时器照常触发：`console.log(num)` 仍会输出 `1、2、3`，但 `resolve` 对已落定的 race **不再有任何影响**。

## 运行结果

```
0
Error: 0
1
2
3
```

## 运行

```bash
node index.js
```
