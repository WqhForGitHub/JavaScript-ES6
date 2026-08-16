# 039 - 手写 call 方法

> `call(thisArg, arg1, arg2, ...)`：立即调用函数，并指定 `this` 和参数列表。

## 实现思路

1. 将函数挂到目标对象 `context` 的一个临时属性上；
2. 通过 `context.fn(...args)` 调用，此时函数内的 `this` 就是 `context`；
3. 删除临时属性，返回执行结果。

## 代码实现

```js
Function.prototype.myCall = function (context, ...args) {
  // 1. 判断调用者是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.myCall was called on non-function');
  }

  // 2. context 为 null/undefined 时指向全局对象（与原生一致）
  //   严格模式下原生 call 传 null 时 this 为 null，这里简化为全局对象
  if (context === null || context === undefined) {
    context = typeof globalThis !== 'undefined' ? globalThis : window;
  } else {
    // 基本类型包装为对象（原生 call 会做 ToObject 转换）
    context = Object(context);
  }

  // 3. 用 Symbol 避免覆盖对象上同名属性
  const fnKey = Symbol('fn');
  context[fnKey] = this; // this 就是要调用的函数

  // 4. 调用函数，this 指向 context
  const result = context[fnKey](...args);

  // 5. 删除临时属性
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

// 原生 call
console.log(introduce.call(person, '你好', '！')); // 你好，我是张三！

// myCall
console.log(introduce.myCall(person, '你好', '！')); // 你好，我是张三！

// this 为 null 时指向全局
var name = '全局名称';
function getName() {
  return this.name;
}
console.log(getName.myCall(null)); // 全局名称

// 基本类型会被包装为对象
function getType() {
  return typeof this;
}
console.log(getType.myCall(1)); // object（1 被包装为 Number 对象）
```

## 使用 Symbol 的原因

```js
// 如果用固定字符串 'fn'，当对象本身有 fn 属性时会被覆盖：
const obj = {
  fn: '我是原有属性',
  name: '测试',
};

// 使用 Symbol 生成唯一 key，不污染原对象
// context[Symbol('fn')] = this;
```

> ES3 时代的经典写法用 `eval('context.fn(' + args + ')')` 传参，
> 现代实现直接用扩展运算符 `context[fnKey](...args)` 即可。
