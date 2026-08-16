# 008 - var 变量提升与 IIFE 作用域

## 题目

```javascript
var name = "mianshiya";
(function () {
  if (typeof name === "undefined") {
    var name = "yupi";
    console.log("cool " + name);
  } else {
    console.log("swag " + name);
  }
})();
```

## 题目分析

考查 **var 声明提升** 与 **函数作用域**：

- IIFE 内 `var name = "yupi"` 的 **声明** 被提升到函数作用域顶部（值为 `undefined`），**赋值** 留在原位置。
- 因此 `typeof name` 查找的是 **函数内部** 的 `name`（`undefined`），而不是外部的 `"mianshiya"`。
- `typeof` 对 `undefined` 不会报错，返回字符串 `"undefined"`，条件为真。
- 进入 if 分支后 `name` 才被赋值为 `"yupi"`。

执行过程：

1. `typeof name === "undefined"` → `true`（内部 name 已提升）。
2. 赋值 `name = "yupi"`，输出 `cool yupi`。

## 运行结果

```
cool yupi
```

## 运行

```bash
node index.js
```
