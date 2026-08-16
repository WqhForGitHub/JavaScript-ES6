# 040 - 手写 apply 方法

> `apply(thisArg, argsArray)`：立即调用函数，`this` 指向 `thisArg`，
> 参数以**数组**形式传入。与 `call` 的唯一区别是传参形式。

## 代码实现

```js
Function.prototype.myApply = function (context, argsArray) {
  // 1. 调用者必须是函数
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.myApply was called on non-function');
  }

  // 2. context 为 null/undefined 时指向全局对象
  if (context === null || context === undefined) {
    context = typeof globalThis !== 'undefined' ? globalThis : window;
  } else {
    // 基本类型包装为对象
    context = Object(context);
  }

  // 3. 参数校验：必须是数组或类数组（或不传）
  if (argsArray !== null && argsArray !== undefined) {
    if (!Array.isArray(argsArray) && typeof argsArray[Symbol.iterator] !== 'function') {
      throw new TypeError('CreateListFromArrayLike called on non-object');
    }
  }

  // 4. 挂到临时属性上并调用
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  const result = context[fnKey](...(argsArray || []));

  // 5. 清理临时属性
  delete context[fnKey];

  return result;
};
```

## 测试

```js
const person = {
  name: '张三',
};

function introduce(greeting, punctuation) {
  return `${greeting}，我是 ${this.name}${punctuation}`;
}

// 原生 apply
console.log(introduce.apply(person, ['你好', '！'])); // 你好，我是张三！

// myApply
console.log(introduce.myApply(person, ['你好', '！'])); // 你好，我是张三！

// 不传参数
function sayName() {
  return this.name;
}
console.log(sayName.myApply(person)); // 张三

// 类数组也可以（与原生一致）
function sum3(a, b, c) {
  return a + b + c;
}
console.log(sum3.myApply(null, { 0: 1, 1: 2, 2: 3, length: 3 })); // 6

// Math.max 经典用法
console.log(Math.max.myApply(null, [1, 5, 3])); // 5
```

## call / apply / bind 对比

| 方法  | 调用方式                | 传参方式 | 是否立即执行   |
| ----- | ----------------------- | -------- | -------------- |
| call  | `fn.call(ctx, 1, 2)`    | 参数列表 | 是             |
| apply | `fn.apply(ctx, [1, 2])` | 参数数组 | 是             |
| bind  | `fn.bind(ctx, 1, 2)`    | 参数列表 | 否，返回新函数 |
