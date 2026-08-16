# 007 - 对象方法调用与 new 调用的 this

## 题目

```javascript
var obj = {
  user: "yupi",
  print: function () {
    console.log(this.user);
  },
};
obj.print();
new obj.print();
```

## 题目分析

考查 **不同调用方式下 this 的指向**：

- `obj.print()`：方法调用，this 指向 `obj`，`this.user` 为 `"yupi"`。
- `new obj.print()`：构造调用，this 指向 **新创建的实例对象**，实例上没有 `user` 属性，`this.user` 为 `undefined`（不报错）。

执行过程：

1. `obj.print()` → 输出 `yupi`。
2. `new obj.print()` → 输出 `undefined`。

## 运行结果

```
yupi
undefined
```

## 运行

```bash
node index.js
```
