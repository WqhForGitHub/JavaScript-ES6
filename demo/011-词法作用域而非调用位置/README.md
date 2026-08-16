# 011 - 词法作用域而非调用位置

## 题目

```javascript
var num = 1;
function func() {
  console.log(num);
}

(function () {
  var num = 2;
  func();
})();
```

## 题目分析

考查 **词法作用域（静态作用域）** 的经典陷阱：

- `func` 定义在 **全局作用域**，它的作用域链为 `func 自身 → 全局`。
- 虽然 `func` 是在 IIFE **内部被调用** 的，但作用域链与 **调用位置无关**，IIFE 内的 `var num = 2` 对 `func` 不可见。
- `num` 沿作用域链在全局找到，值为 `1`。

执行过程：

1. IIFE 内调用 `func()`。
2. `func` 沿自身作用域链查找 `num` → 全局的 `1`，输出 `1`。

## 运行结果

```
1
```

## 运行

```bash
node index.js
```
