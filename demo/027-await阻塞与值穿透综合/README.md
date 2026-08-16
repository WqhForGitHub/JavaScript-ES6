# 027 - await 阻塞与值穿透综合

## 题目

```javascript
const runAsync = async () => {
  console.log("async start");
  setTimeout(() => {
    console.log("inner timer");
  }, 2000);
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
};

console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
Promise.resolve("A")
  .then("then")
  .then(Promise.resolve("succeed"))
  .catch("catch")
  .then((res) => console.log(res));
setTimeout(() => {
  console.log("outer timer");
}, 1000);
```

## 题目分析

综合考查 **await 永久阻塞**、**then 值穿透** 与 **定时器触发顺序**：

同步阶段：

1. `main start`。
2. `runAsync()`：`async start`，注册 2 秒定时器（inner timer），执行器同步输出 `promise` 但 **从不 resolve** → 函数永久停在 await，`async end`、外层 `.then` 永远不执行。
3. `main end`。
4. Promise 链：`"then"`、`Promise.resolve("succeed")`、`"catch"` 都 **不是函数**，全部被忽略，`"A"` 原样穿透到最后的 `console.log`（微任务）。
5. 注册 1 秒定时器（outer timer）。

异步阶段：

6. 微任务：输出 `A`。
7. t = 1s：`outer timer`。
8. t = 2s：`inner timer`（定时器本身照常触发）。

## 运行结果

```
main start
async start
promise
main end
A
outer timer
inner timer
```

## 运行

```bash
node index.js
```
