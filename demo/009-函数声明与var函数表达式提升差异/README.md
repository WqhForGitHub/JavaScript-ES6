# 009 - 函数声明与 var 函数表达式提升差异

## 题目

```javascript
function foo() {
  console.log("foo");
}
var bar;
foo();
bar();
bar = function () {
  console.log("bar");
};
```

## 题目分析

考查 **函数声明提升** 与 **var 变量提升** 的区别：

- `function foo() {...}` 是 **函数声明**：声明和函数体一起提升，在任何位置都可调用。
- `var bar; ... bar = function() {...}` 是 **函数表达式**（var 声明）：只有 **声明被提升**（值为 `undefined`），**赋值留在原位置**。
- 调用 `bar()` 时，`bar` 还未被赋值为函数，此时 `bar === undefined`，对 `undefined` 进行函数调用 → **TypeError**。

执行过程：

1. `foo()` → 输出 `foo`。
2. `bar()` → `TypeError: bar is not a function`，程序中断，后面的赋值不会执行。

## 运行结果

```
foo
TypeError: bar is not a function
```

## 运行

```bash
node index.js
```
