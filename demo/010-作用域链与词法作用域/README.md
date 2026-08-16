# 010 - 作用域链与词法作用域

## 题目

```javascript
function foo() {
  var num = 1;
  function bar() {
    console.log(num);
  }
  bar();
}
foo();

function func1() {
  var value = 1;
  func2();
}
function func2() {
  console.log(value);
}
func1();
```

## 题目分析

考查 **作用域链** 与 **词法作用域（静态作用域）**：

- 作用域链在函数 **定义时** 就确定了，由 **代码书写位置** 决定，与调用位置无关。
- `bar` 定义在 `foo` 内部：作用域链为 `bar 自身 → foo → 全局`，能访问 `foo` 的 `num`，输出 `1`（闭包）。
- `func2` 定义在全局：作用域链为 `func2 自身 → 全局`，**不包含 `func1` 的作用域**。虽然 `func2` 是在 `func1` 内被调用的，但 `value` 对它不可见 → **ReferenceError**。

执行过程：

1. `foo()` → `bar()` 输出 `1`。
2. `func1()` → `func2()` 访问 `value` → `ReferenceError: value is not defined`。

## 运行结果

```
1
ReferenceError: value is not defined
```

## 运行

```bash
node index.js
```
