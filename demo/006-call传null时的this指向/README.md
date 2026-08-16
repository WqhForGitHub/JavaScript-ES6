# 006 - call 传 null 时的 this 指向

## 题目

```javascript
function test() {
  console.log(this);
}
test.call(null);
```

## 题目分析

考查 **call 传入 null/undefined 时 this 的指向**：

- `call(null)` 本意是把 this 绑定为 `null`。
- 但在 **非严格模式** 下，null/undefined 会被 **替换为全局对象**（浏览器中是 `window`，Node.js 中是 `global` / `globalThis`）。
- 若在 **严格模式**（`"use strict"`）下，this 将保持为 `null`。

验证：`this === globalThis` 为 `true`。

## 运行结果

```
全局对象（浏览器中为 window，Node.js 中为 global）
```

## 运行

```bash
node index.js
```
