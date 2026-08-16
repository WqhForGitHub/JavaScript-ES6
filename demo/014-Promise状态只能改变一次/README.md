# 014 - Promise 状态只能改变一次

## 题目

```javascript
const promise = new Promise((resolve, reject) => {
  resolve("succeed1");
  reject("error");
  resolve("succeed2");
});
promise
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
```

## 题目分析

考查 **Promise 状态的不可逆性**：

- Promise 的状态一旦从 pending 变为 fulfilled 或 rejected，就 **永远不可再改变**。
- 第一次 `resolve("succeed1")` 生效，后面的 `reject("error")` 和 `resolve("succeed2")` 都会被 **静默忽略**（不报错）。
- 所以只走 `then`，不走 `catch`。

## 运行结果

```
then:  succeed1
```

## 运行

```bash
node index.js
```
