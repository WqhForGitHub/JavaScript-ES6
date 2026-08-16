# 041 - 手写 bind 方法

> `bind(thisArg, arg1, ...)`：返回一个**新的函数**，调用时 `this` 指向 `thisArg`，
> 并支持柯里化式预设参数；作为构造函数调用时 `this` 指向新实例。

## 代码实现

```js
Function.prototype.myBind = function (context, ...prependArgs) {
  // 1. 调用者必须是函数
  if (typeof this !== 'function') {
    throw new TypeError(
      'Function.prototype.myBind was called on non-function'
    );
  }

  const originalFn = this; // 保存原函数

  // 2. 返回一个新函数（支持传入剩余参数）
  const boundFn = function (...appendArgs) {
    // 3. 如果通过 new 调用：this 是 boundFn 的实例，
    //    此时 this 指向新实例，而不是 context（与原生 bind 行为一致）
    if (this instanceof boundFn) {
      return new originalFn(...prependArgs, ...appendArgs);
    }
    // 4. 普通调用：this 指向 context，合并预设参数和调用时参数
    return originalFn.apply(context, prependArgs.concat(appendArgs));
  };

  // 5. 修正原型：让 boundFn 的实例能访问原函数原型上的属性
  //    （用中转函数避免直接修改原函数的 prototype）
  function F() {}
  F.prototype = originalFn.prototype;
  boundFn.prototype = new F();

  return boundFn;
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

// 预设 this
const bound = introduce.myBind(person);
console.log(bound('你好', '！')); // 你好，我是张三！

// 预设部分参数（柯里化）
const bound2 = introduce.myBind(person, '早上好');
console.log(bound2('。')); // 早上好，我是张三。

// 参数合并验证
const bound3 = introduce.myBind(person, '嗨');
console.log(bound3('~', '')); // 嗨，我是张三~

// 与原生 bind 对比
console.log(introduce.bind(person, '你好')('！')); // 你好，我是张三！
```

## 构造函数场景验证

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.say = function () {
  console.log(`我是 ${this.name}`);
};

const boundAnimal = Animal.myBind({ name: 'context' }, '旺财');
const dog = new boundAnimal(); // new 调用时忽略 bind 的 this

console.log(dog.name); // 旺财（this 指向新实例）
console.log(dog instanceof Animal); // true
dog.say(); // 我是 旺财
```

## 注意点

1. `bind` 返回的函数**不能再次修改 this**（再 call/apply 也不行）；
2. `new boundFn()` 时 `this` 指向新实例，预设参数仍会生效；
3. 原生 `bind` 返回的函数 `prototype` 为 `undefined`，手写版通过中转函数
   让 `instanceof` 正常工作，这是常见的手写实现方式。
