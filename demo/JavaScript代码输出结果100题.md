# JavaScript 代码输出结果 50 题

---

## 一、this 指向（8 题）

### 第 1 题

```js
var a = 1;
function foo() {
  console.log(this.a);
}
foo();
```

<details>
<summary>答案</summary>

```
1
```

`foo()` 以普通函数方式调用，`this` 指向全局对象（浏览器中为 `window`），`var a = 1` 声明的变量会挂载到全局对象上。

</details>

---

### 第 2 题

```js
var a = 2;
var obj = {
  a: 3,
  foo: foo,
};
function foo() {
  console.log(this.a);
}
obj.foo();
var bar = obj.foo;
bar();
```

<details>
<summary>答案</summary>

```
3
2
```

`obj.foo()` 作为对象方法调用，`this` 指向 `obj`，输出 3；`bar()` 作为普通函数调用，`this` 指向全局对象，输出 2。

</details>

---

### 第 3 题

```js
var a = 10;
var obj = {
  a: 20,
  say: function () {
    console.log(this.a);
  },
};
var fn = obj.say;
fn();
```

<details>
<summary>答案</summary>

```
10
```

赋值给 `fn` 后调用 `fn()`，是普通函数调用，`this` 指向全局对象。

</details>

---

### 第 4 题

```js
var a = 1;
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo,
};
obj.foo();
setTimeout(obj.foo, 0);
```

<details>
<summary>答案</summary>

```
2
1
```

`obj.foo()` 输出 2；`setTimeout` 中的回调作为普通函数调用，`this` 指向全局对象，输出 1。

</details>

---

### 第 5 题

```js
var a = 1;
var obj = {
  a: 2,
  say: () => {
    console.log(this.a);
  },
};
obj.say();
```

<details>
<summary>答案</summary>

```
1
```

箭头函数没有自己的 `this`，继承外层词法作用域的 `this`，即全局对象。

</details>

---

### 第 6 题

```js
var a = 1;
var obj = {
  a: 2,
  say: function () {
    var f = () => {
      console.log(this.a);
    };
    f();
  },
};
obj.say();
```

<details>
<summary>答案</summary>

```
2
```

箭头函数 `f` 的 `this` 继承自外层 `say`，而 `say` 作为 `obj` 的方法调用，`this` 指向 `obj`。

</details>

---

### 第 7 题

```js
function Foo() {
  this.a = 1;
  return { a: 2 };
}
var f = new Foo();
console.log(f.a);
```

<details>
<summary>答案</summary>

```
2
```

构造函数返回了一个对象，`new` 操作的结果是该返回的对象，而非 `this`。

</details>

---

### 第 8 题

```js
function foo() {
  console.log(this.a);
}
var obj = { a: 1 };
var bar = foo.bind(obj);
bar();
var baz = new bar();
console.log(baz.a);
```

<details>
<summary>答案</summary>

```
1
undefined
```

`bar()` 输出 1；`new bar()` 时 `new` 优先级高于 `bind`，`this` 指向新创建的实例，该实例没有 `a` 属性，输出 `undefined`。

</details>

---

## 二、作用域、变量提升、闭包（8 题）

### 第 9 题

```js
console.log(a);
var a = 1;
```

<details>
<summary>答案</summary>

```
undefined
```

`var` 声明会被提升，但赋值不会提升，因此访问时 `a` 已声明但未赋值。

</details>

---

### 第 10 题

```js
console.log(a);
let a = 1;
```

<details>
<summary>答案</summary>

```
ReferenceError: Cannot access 'a' before initialization
```

`let` 存在暂时性死区（TDZ），在声明之前访问会抛出引用错误。

</details>

---

### 第 11 题

```js
var a = 1;
function foo() {
  console.log(a);
  var a = 2;
}
foo();
```

<details>
<summary>答案</summary>

```
undefined
```

函数内部 `var a` 声明提升，导致 `console.log(a)` 访问的是函数局部的 `a`，此时还未赋值。

</details>

---

### 第 12 题

```js
foo();
function foo() {
  console.log(1);
}
var foo = function () {
  console.log(2);
};
```

<details>
<summary>答案</summary>

```
1
```

函数声明整体提升，`foo()` 调用的是提升后的函数声明。`var foo` 的赋值在调用之后。

</details>

---

### 第 13 题

```js
foo();
var foo = function () {
  console.log(2);
};
```

<details>
<summary>答案</summary>

```
TypeError: foo is not a function
```

`var foo` 提升但赋值不提升，调用时 `foo` 为 `undefined`，不是函数。

</details>

---

### 第 14 题

```js
(function () {
  var x = (y = 1);
})();
console.log(y);
console.log(x);
```

<details>
<summary>答案</summary>

```
1
ReferenceError: x is not defined
```

`y = 1` 没有加 `var`，成为全局变量；`x` 是函数局部变量，外部无法访问。

</details>

---

### 第 15 题

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}
```

<details>
<summary>答案</summary>

```
3
3
3
```

`var` 没有块级作用域，循环结束后 `i` 为 3，三个回调共享同一个 `i`。

</details>

---

### 第 16 题

```js
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}
```

<details>
<summary>答案</summary>

```
0
1
2
```

`let` 有块级作用域，每次循环都有独立的 `i` 绑定。

</details>

---

## 三、原型与继承（6 题）

### 第 17 题

```js
function Person(name) {
  this.name = name;
}
var p = new Person("Tom");
console.log(p.constructor === Person);
console.log(Person.prototype.constructor === Person);
```

<details>
<summary>答案</summary>

```
true
true
```

实例的 `constructor` 属性继承自原型，`Person.prototype.constructor` 指向 `Person`。

</details>

---

### 第 18 题

```js
Object.prototype.a = function () {
  console.log("a");
};
Function.prototype.b = function () {
  console.log("b");
};
function F() {}
var f = new F();
f.a();
f.b();
F.a();
F.b();
```

<details>
<summary>答案</summary>

```
a
TypeError: f.b is not a function
a
b
```

实例 `f` 的原型链上有 `Object.prototype`，可访问 `a`；但没有 `Function.prototype`，无法访问 `b`。`F` 是函数，原型链上同时有 `Function.prototype` 和 `Object.prototype`。

</details>

---

### 第 19 题

```js
function Super() {
  this.x = 1;
}
Super.prototype.getX = function () {
  return this.x;
};
function Sub() {
  Super.call(this);
  this.y = 2;
}
Sub.prototype = Object.create(Super.prototype);
Sub.prototype.constructor = Sub;
var s = new Sub();
console.log(s.x);
console.log(s.getY);
console.log(s instanceof Super);
```

<details>
<summary>答案</summary>

```
1
undefined
true
```

组合继承：`Super.call(this)` 获取属性，`Object.create` 获取原型方法。`s` 没有 `getY` 属性，输出 `undefined`。

</details>

---

### 第 20 题

```js
function A() {}
A.prototype.n = 1;
var b = new A();
A.prototype = {
  n: 2,
  m: 3,
};
var c = new A();
console.log(b.n);
console.log(b.m);
console.log(c.n);
console.log(c.m);
```

<details>
<summary>答案</summary>

```
1
undefined
2
3
```

`b` 的 `__proto__` 指向修改前的原型，`c` 的 `__proto__` 指向修改后的新原型对象。

</details>

---

### 第 21 题

```js
console.log(Object.prototype.__proto__);
console.log(Function.prototype.__proto__ === Object.prototype);
console.log(Function.__proto__ === Function.prototype);
```

<details>
<summary>答案</summary>

```
null
true
true
```

`Object.prototype.__proto__` 为 `null`（原型链顶端）；`Function.prototype` 是普通对象，其 `__proto__` 指向 `Object.prototype`；`Function` 作为函数，其 `__proto__` 指向 `Function.prototype`。

</details>

---

### 第 22 题

```js
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function () {
  console.log(this.name + ": woof");
};
var dog1 = new Dog("Rex");
var dog2 = new Dog("Max");
Dog.prototype.bark = function () {
  console.log(this.name + ": meow");
};
dog1.bark();
dog2.bark();
```

<details>
<summary>答案</summary>

```
Rex: meow
Max: meow
```

修改原型上的方法会影响所有实例，因为实例通过原型链共享方法。

</details>

---

## 四、Promise / async-await（8 题）

### 第 23 题

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve();
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
```

<details>
<summary>答案</summary>

```
1
2
4
3
```

Promise 执行器是同步执行的，`.then` 回调是微任务，在同步代码之后执行。

</details>

---

### 第 24 题

```js
const promise = new Promise((resolve) => {
  resolve("success1");
  reject("error");
  resolve("success2");
});
promise
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

<details>
<summary>答案</summary>

```
success1
```

Promise 状态一旦变更就不可逆，第一次 `resolve` 后后续的 `reject` 和 `resolve` 都被忽略。

</details>

---

### 第 25 题

```js
Promise.resolve(1)
  .then((res) => {
    console.log(res);
    return 2;
  })
  .then((res) => {
    console.log(res);
    return Promise.resolve(3);
  })
  .then((res) => {
    console.log(res);
  });
```

<details>
<summary>答案</summary>

```
1
2
3
```

链式调用中，`return` 的值会作为下一个 `then` 的参数，包括 Promise 解包后的值。

</details>

---

### 第 26 题

```js
console.log("start");
setTimeout(() => {
  console.log("timeout");
}, 0);
Promise.resolve().then(() => {
  console.log("promise");
});
console.log("end");
```

<details>
<summary>答案</summary>

```
start
end
promise
timeout
```

同步代码先执行，微任务（Promise.then）优先于宏任务（setTimeout）。

</details>

---

### 第 27 题

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("script start");
async1();
console.log("script end");
```

<details>
<summary>答案</summary>

```
script start
async1 start
async2
script end
async1 end
```

`await` 后面的代码相当于 `.then` 的回调，是微任务，在同步代码之后执行。

</details>

---

### 第 28 题

```js
async function foo() {
  try {
    await Promise.reject("error");
  } catch (e) {
    console.log(e);
  }
  console.log("continue");
}
foo();
```

<details>
<summary>答案</summary>

```
error
continue
```

`try...catch` 可以捕获 `await` 中的 rejection，捕获后继续执行后续代码。

</details>

---

### 第 29 题

```js
Promise.resolve()
  .then(() => {
    console.log(1);
    return Promise.resolve(2);
  })
  .then((res) => {
    console.log(res);
  });
Promise.resolve()
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });
```

<details>
<summary>答案</summary>

```
1
3
4
2
```

`return Promise.resolve(2)` 会多经历两轮微任务（包装和解包），所以 2 的输出在 4 之后。

</details>

---

### 第 30 题

```js
const p = Promise.resolve();
p.then(() => {
  console.log(1);
});
p.then(() => {
  console.log(2);
});
```

<details>
<summary>答案</summary>

```
1
2
```

同一个 Promise 可以注册多个 `.then` 回调，它们按注册顺序依次加入微任务队列。

</details>

---

## 五、类型转换与比较（5 题）

### 第 31 题

```js
console.log([] == false);
console.log([] == ![]);
console.log({} == !{});
```

<details>
<summary>答案</summary>

```
true
true
false
```

- `[] == false`：`[]` 转数字为 `0`，`false` 转数字为 `0`
- `[] == ![]`：`![]` 为 `false`，同上
- `{} == !{}`：`!{}` 为 `false`，`{}` 转数字为 `NaN`，`NaN != NaN`

</details>

---

### 第 32 题

```js
console.log(1 + "2");
console.log(1 - "2");
console.log("3" + 4);
console.log("5" - 1);
```

<details>
<summary>答案</summary>

```
12
-1
34
4
```

`+` 遇到字符串做拼接；`-` 会将字符串转为数字做减法。

</details>

---

### 第 33 题

```js
console.log(null == undefined);
console.log(null === undefined);
console.log(typeof null);
console.log(typeof undefined);
```

<details>
<summary>答案</summary>

```
true
false
object
undefined
```

`null == undefined` 为 `true`（规范规定）；严格相等为 `false`；`typeof null` 为 `object`（历史遗留 bug）。

</details>

---

### 第 34 题

```js
console.log(true + true);
console.log(true + false);
console.log("5" - true);
console.log("5" + true);
```

<details>
<summary>答案</summary>

```
2
1
4
5true
```

数值运算时布尔值转数字（true=1, false=0）；`+` 遇到字符串做拼接。

</details>

---

### 第 35 题

```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log({} + {});
```

<details>
<summary>答案</summary>

```
[object Object]
[object Object]
0（或 [object Object]）
NaN（或 [object Object][object Object]）
```

- `[] + []`：都转字符串，结果为空字符串 `""`
- `[] + {}`：都转字符串，结果为 `"[object Object]"`
- `{} + []`：`{}` 被当作空代码块，`+[]` 转数字为 `0`（在控制台中 `{}` 当作对象时输出 `[object Object]`）
- `{} + {}`：类似地，`+{}` 转数字为 `NaN`（视环境而定）

> 注意：在 Node.js 和浏览器控制台中结果可能不同，`{}` 在语句开头被解析为代码块。

</details>

---

## 六、事件循环（5 题）

### 第 36 题

```js
console.log("1");
setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);
Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => {
    console.log("5");
  }, 0);
});
console.log("6");
```

<details>
<summary>答案</summary>

```
1
6
4
2
3
5
```

同步代码 -> 微任务 -> 宏任务。`4` 在微任务中输出，然后 `2` 在宏任务中输出，`3` 是 `2` 中产生的微任务，最后 `5` 是 `4` 中产生的宏任务。

</details>

---

### 第 37 题

```js
setTimeout(() => console.log(1), 0);
new Promise((resolve) => {
  console.log(2);
  resolve();
}).then(() => console.log(3));
setTimeout(() => console.log(4), 0);
console.log(5);
```

<details>
<summary>答案</summary>

```
2
5
3
1
4
```

同步：2, 5 -> 微任务：3 -> 宏任务：1, 4

</details>

---

### 第 38 题

```js
async function async1() {
  console.log("A");
  await async2();
  console.log("B");
}
async function async2() {
  console.log("C");
}
console.log("D");
setTimeout(() => console.log("E"), 0);
async1();
new Promise((resolve) => {
  console.log("F");
  resolve();
}).then(() => console.log("G"));
console.log("H");
```

<details>
<summary>答案</summary>

```
D
A
C
F
H
B
G
E
```

同步：D, A, C, F, H -> 微任务：B, G -> 宏任务：E

</details>

---

### 第 39 题

```js
setImmediate(() => console.log(1));
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
process.nextTick(() => console.log(4));
```

<details>
<summary>答案</summary>

```
4
3
1 或 2
2 或 1
```

`process.nextTick` 优先于微任务；微任务优先于宏任务；`setImmediate` 和 `setTimeout(0)` 顺序不确定（取决于系统调度）。

> 注意：此题在 Node.js 环境中运行，浏览器没有 `setImmediate` 和 `process.nextTick`。

</details>

---

### 第 40 题

```js
console.log(1);
setTimeout(() => {
  console.log(2);
}, 1000);
setTimeout(() => {
  console.log(3);
}, 0);
Promise.resolve()
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(5);
  });
console.log(6);
```

<details>
<summary>答案</summary>

```
1
6
4
5
3
2
```

同步 -> 微任务 -> 宏任务（0ms）-> 宏任务（1000ms）

</details>

---

## 七、ES6+ 特性（5 题）

### 第 41 题

```js
const obj = { a: 1, b: 2 };
const { a, ...rest } = obj;
console.log(a);
console.log(rest);
```

<details>
<summary>答案</summary>

```
1
{ b: 2 }
```

解构赋值中 `...rest` 收集剩余属性。

</details>

---

### 第 42 题

```js
const obj = { a: 1 };
const obj2 = { a: 1 };
console.log(Object.is(obj, obj2));
console.log(Object.is(NaN, NaN));
console.log(Object.is(+0, -0));
console.log(NaN === NaN);
```

<details>
<summary>答案</summary>

```
false
true
false
false
```

`Object.is` 与 `===` 的区别：`Object.is(NaN, NaN)` 为 `true`，`Object.is(+0, -0)` 为 `false`。

</details>

---

### 第 43 题

```js
const arr = [1, 2, 3, 4, 5];
const [a, , b, ...c] = arr;
console.log(a);
console.log(b);
console.log(c);
```

<details>
<summary>答案</summary>

```
1
3
[4, 5]
```

解构中的空位跳过对应元素，`...c` 收集剩余元素。

</details>

---

### 第 44 题

```js
const map = new Map();
map.set("a", 1);
map.set("b", 2);
console.log(map.size);
map.delete("a");
console.log(map.has("a"));
console.log(map.get("b"));
```

<details>
<summary>答案</summary>

```
2
false
2
```

Map 的基本操作：`set`、`delete`、`has`、`get`。

</details>

---

### 第 45 题

```js
function foo({ a, b } = { a: 10, b: 20 }) {
  console.log(a, b);
}
foo({ a: 1 });
foo();
foo({});
```

<details>
<summary>答案</summary>

```
1 undefined
10 20
undefined undefined
```

- 传入 `{a:1}` 时 `b` 未提供为 `undefined`
- 无参时使用默认值 `{a:10, b:20}`
- 传入空对象 `{}` 时不再使用默认值，`a` 和 `b` 都为 `undefined`

</details>

---

## 八、对象与数组（5 题）

### 第 46 题

```js
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const obj3 = Object.assign(obj1, obj2);
console.log(obj1);
console.log(obj3 === obj1);
```

<details>
<summary>答案</summary>

```
{ a: 1, b: 2 }
true
```

`Object.assign` 是浅拷贝，修改的是目标对象 `obj1`，返回值就是 `obj1`。

</details>

---

### 第 47 题

```js
const arr = [1, 2, 3, 2, 1];
console.log(arr.indexOf(2));
console.log(arr.lastIndexOf(2));
console.log(arr.includes(2));
```

<details>
<summary>答案</summary>

```
1
3
true
```

`indexOf` 返回第一个匹配索引，`lastIndexOf` 返回最后一个，`includes` 返回布尔值。

</details>

---

### 第 48 题

```js
const arr = [10, 9, 8, 7, 6];
const result = arr.reduce((acc, cur, index) => {
  if (index % 2 === 0) acc.push(cur);
  return acc;
}, []);
console.log(result);
```

<details>
<summary>答案</summary>

```
[10, 8, 6]
```

`reduce` 过滤偶数索引的元素（索引 0、2、4）。

</details>

---

### 第 49 题

```js
const obj = { a: { b: 1 } };
const copy = JSON.parse(JSON.stringify(obj));
copy.a.b = 2;
console.log(obj.a.b);
console.log(copy.a.b);
```

<details>
<summary>答案</summary>

```
1
2
```

`JSON.parse(JSON.stringify())` 实现深拷贝，修改副本不影响原对象。

</details>

---

### 第 50 题

```js
const arr = [1, [2, [3, [4]]]];
console.log(arr.flat());
console.log(arr.flat(Infinity));
```

<details>
<summary>答案</summary>

```
[1, 2, [3, [4]]]
[1, 2, 3, 4]
```

`flat()` 默认只展开一层，`flat(Infinity)` 展开所有层。

</details>

---

## 九、函数相关（5 题）

### 第 51 题

```js
function foo(a, b, ...rest) {
  console.log(a);
  console.log(b);
  console.log(rest);
}
foo(1, 2, 3, 4, 5);
```

<details>
<summary>答案</summary>

```
1
2
[3, 4, 5]
```

剩余参数 `...rest` 收集除前两个参数外的所有参数。

</details>

---

### 第 52 题

```js
var b = 1;
function outer() {
  var b = 2;
  function inner() {
    b++;
    var b = 3;
    console.log(b);
  }
  inner();
}
outer();
```

<details>
<summary>答案</summary>

```
3
```

`inner` 内部 `var b` 提升，`b++` 操作的是局部变量 `b`（此时为 `undefined`，`undefined++` 为 `NaN`），然后赋值为 3。

</details>

---

### 第 53 题

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}
function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));
console.log(curriedAdd(1, 2)(3));
```

<details>
<summary>答案</summary>

```
6
6
```

柯里化函数在参数足够时执行原函数，否则继续收集参数。

</details>

---

### 第 54 题

```js
var x = 1;
function foo(
  x,
  y = function () {
    x = 2;
  },
) {
  var x = 3;
  y();
  console.log(x);
}
foo();
console.log(x);
```

<details>
<summary>答案</summary>

```
3
1
```

函数参数有默认值时会产生独立的作用域。`y` 中的 `x = 2` 修改的是参数作用域的 `x`，不影响函数体内的 `var x = 3`。全局 `x` 不受影响。

</details>

---

### 第 55 题

```js
function foo() {
  return;
  {
    a: 1;
  }
}
console.log(foo());
```

<details>
<summary>答案</summary>

```
undefined
```

JavaScript 自动分号插入（ASI）机制会在 `return` 后自动插入分号，导致返回 `undefined`。

</details>

---

## 十、运算符与表达式（5 题）

### 第 56 题

```js
console.log(1 ?? 2);
console.log(null ?? 2);
console.log(undefined ?? 3);
console.log(0 ?? 2);
console.log("" ?? 4);
```

<details>
<summary>答案</summary>

```
1
2
3
0
""
```

`??`（空值合并运算符）只在左侧为 `null` 或 `undefined` 时返回右侧值。

</details>

---

### 第 57 题

```js
console.log(1 && 2);
console.log(0 && 2);
console.log(1 || 2);
console.log(0 || 2);
```

<details>
<summary>答案</summary>

```
2
0
1
2
```

`&&` 遇到假值返回假值，否则返回最后一个值；`||` 遇到真值返回真值，否则返回最后一个值。

</details>

---

### 第 58 题

```js
let a = 1;
let b = (a++, a + 1);
console.log(a);
console.log(b);
```

<details>
<summary>答案</summary>

```
2
3
```

逗号运算符从左到右执行，返回最后一个表达式的值。`a++` 使 `a` 变为 2，`a + 1` 为 3。

</details>

---

### 第 59 题

```js
console.log(typeof typeof 1);
console.log(typeof NaN);
console.log(typeof []);
console.log(typeof null);
```

<details>
<summary>答案</summary>

```
string
number
object
object
```

`typeof 1` 为 `"number"`，`typeof "number"` 为 `"string"`；`NaN` 类型为 `number`；数组和 `null` 的 `typeof` 都是 `object`。

</details>

---

### 第 60 题

```js
console.log(0.1 + 0.2 === 0.3);
console.log(0.1 + 0.2);
console.log(Number.EPSILON > Math.abs(0.1 + 0.2 - 0.3));
```

<details>
<summary>答案</summary>

```
false
0.30000000000000004
true
```

浮点数精度问题：`0.1 + 0.2` 不等于 `0.3`，差值小于 `Number.EPSILON`。

</details>

---

## 十一、综合应用（5 题）

### 第 61 题

```js
console.log([] == ![]); // 1
console.log({} + []); // 2
console.log([] + {}); // 3
console.log(+[]); // 4
console.log(+["1", "2"]); // 5
```

<details>
<summary>答案</summary>

```
true
0 （或 "[object Object]"）
"[object Object]"
0
NaN
```

1. `![]` 为 `false`，`[] == false` 双方转数字为 `0 == 0`
2. `{}` 在语句开头被当作代码块，`+[]` 为 `0`
3. `[] + {}` 字符串拼接为 `"[object Object]"`
4. `+[]` 将空数组转数字为 `0`
5. `+['1','2']` 数组转字符串为 `"1,2"`，转数字为 `NaN`

</details>

---

### 第 62 题

```js
var a = { n: 1 };
var b = a;
a.x = a = { n: 2 };
console.log(a.x);
console.log(b.x);
```

<details>
<summary>答案</summary>

```
undefined
{ n: 2 }
```

赋值从右到左，但 `.` 运算符优先级高于 `=`。`a.x` 先确定引用（此时 `a` 指向旧对象），然后 `a = {n:2}` 使 `a` 指向新对象，最后给旧对象的 `x` 属性赋值为新对象。

</details>

---

### 第 63 题

```js
function Foo() {
  getName = function () {
    console.log(1);
  };
  return this;
}
Foo.getName = function () {
  console.log(2);
};
Foo.prototype.getName = function () {
  console.log(3);
};
var getName = function () {
  console.log(4);
};
function getName() {
  console.log(5);
}

Foo.getName();
getName();
Foo().getName();
getName();
new Foo.getName();
new Foo().getName();
```

<details>
<summary>答案</summary>

```
2
4
1
1
2
3
```

- `Foo.getName()`：调用静态方法，输出 2
- `getName()`：函数声明被函数表达式覆盖，输出 4
- `Foo().getName()`：`Foo()` 执行时修改全局 `getName`，返回 `this`（全局），调用 `getName` 输出 1
- `getName()`：已被修改，输出 1
- `new Foo.getName()`：`new` 执行静态方法，输出 2
- `new Foo().getName()`：实例访问原型方法，输出 3

</details>

---

### 第 64 题

```js
var a = 0;
var b = 0;
function A(a) {
  A = function (b) {
    console.log(a + b++);
  };
  console.log(a++);
}
A(1);
A(2);
```

<details>
<summary>答案</summary>

```
1
4
```

- `A(1)`：参数 `a=1`，输出 `1`（后缀++不改变输出值），然后 `A` 被重新赋值
- `A(2)`：此时 `A` 是新函数，闭包中 `a=1`（因为上一次后缀++变为2），参数 `b=2`，输出 `2+2=4`

> 更正：第一次 `A(1)` 输出 `1`（`a++` 先输出后自增，`a` 变为 2），第二次 `A(2)` 闭包中 `a=2`，`b=2`，输出 `2+2=4`。

</details>

---

### 第 65 题

```js
async function async1() {
  console.log("A");
  await async2();
  console.log("B");
}
async function async2() {
  console.log("C");
}
console.log("D");
setTimeout(function () {
  console.log("E");
}, 0);
async1();
new Promise(function (resolve) {
  console.log("F");
  resolve();
})
  .then(function () {
    console.log("G");
  })
  .then(function () {
    console.log("H");
  });
console.log("I");
```

<details>
<summary>答案</summary>

```
D
A
C
F
I
B
G
H
E
```

1. 同步：D, A, C, F, I
2. 微任务第一轮：B, G（`async2` 后的代码和第一个 `then`）
3. 微任务第二轮：H（第二个 `then`）
4. 宏任务：E

</details>

---

## 十二、字符串与正则（5 题）

### 第 66 题

```js
console.log("hello".padStart(10, "abc"));
console.log("hello".padEnd(10, "abc"));
console.log("hi".repeat(3));
```

<details>
<summary>答案</summary>

```
abcabhello
helloabcab
hihihi
```

`padStart` 用填充字符串在前面补齐到指定长度；`padEnd` 在后面补齐；`repeat` 重复字符串。

</details>

---

### 第 67 题

```js
const str = "hello world";
console.log(str.replace(/l/g, "L"));
console.log(str.replaceAll("l", "L"));
console.log(str.match(/l/g).length);
```

<details>
<summary>答案</summary>

```
heLLo worLd
heLLo worLd
3
```

`replace` 加 `/g` 标志和 `replaceAll` 都能全局替换；`match` 返回所有匹配的数组。

</details>

---

### 第 68 题

```js
console.log("a1b2c3".split(/\d/));
console.log("abc".slice(1, 2));
console.log("abc".substring(1, 2));
```

<details>
<summary>答案</summary>

```
["a", "b", "c", ""]
b
b
```

`split` 用正则分割；`slice` 和 `substring` 都截取指定范围（含头不含尾）。

</details>

---

### 第 69 题

```js
const str = "foo bar baz";
const [first, ...rest] = str.split(" ");
console.log(first);
console.log(rest);
```

<details>
<summary>答案</summary>

```
foo
["bar", "baz"]
```

`split` 分割后解构，`...rest` 收集剩余元素。

</details>

---

### 第 70 题

```js
const str = "abcde";
console.log(str.includes("cd"));
console.log(str.startsWith("ab"));
console.log(str.endsWith("de"));
console.log(str.indexOf("c"));
```

<details>
<summary>答案</summary>

```
true
true
true
2
```

`includes`、`startsWith`、`endsWith` 返回布尔值；`indexOf` 返回索引。

</details>

---

## 十三、Symbol 与迭代器（5 题）

### 第 71 题

```js
const s1 = Symbol("foo");
const s2 = Symbol("foo");
console.log(s1 === s2);
console.log(s1.description);
console.log(typeof s1);
```

<details>
<summary>答案</summary>

```
false
foo
symbol
```

每次 `Symbol()` 都创建唯一值，即使描述相同。`description` 返回描述字符串。

</details>

---

### 第 72 题

```js
const obj = {};
const sym = Symbol("key");
obj[sym] = "value";
obj.a = 1;
console.log(Object.keys(obj));
console.log(Object.getOwnPropertySymbols(obj));
console.log(Reflect.ownKeys(obj));
```

<details>
<summary>答案</summary>

```
["a"]
[Symbol(key)]
["a", Symbol(key)]
```

`Object.keys` 不返回 Symbol 属性；`getOwnPropertySymbols` 只返回 Symbol 属性；`Reflect.ownKeys` 返回所有。

</details>

---

### 第 73 题

```js
const obj = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  },
};
console.log([...obj]);
for (const x of obj) {
  console.log(x);
}
```

<details>
<summary>答案</summary>

```
[1, 2, 3]
1
2
3
```

自定义迭代器使对象可迭代，可使用展开运算符和 `for...of`。

</details>

---

### 第 74 题

```js
const sym = Symbol.for("app.key");
const sym2 = Symbol.for("app.key");
console.log(sym === sym2);
console.log(Symbol.keyFor(sym));
```

<details>
<summary>答案</summary>

```
true
app.key
```

`Symbol.for` 在全局注册表中查找或创建 Symbol，相同 key 返回同一个 Symbol。`Symbol.keyFor` 返回全局 Symbol 的 key。

</details>

---

### 第 75 题

```js
class MyArray {
  constructor(...args) {
    this.data = args;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i];
    }
  }
}
const arr = new MyArray(1, 2, 3);
console.log([...arr]);
```

<details>
<summary>答案</summary>

```
[1, 2, 3]
```

通过 `Symbol.iterator` 实现自定义迭代协议，展开运算符调用迭代器。

</details>

---

## 十四、Proxy 与 Reflect（5 题）

### 第 76 题

```js
const obj = { a: 1 };
const proxy = new Proxy(obj, {
  get(target, key) {
    console.log(`getting ${key}`);
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    console.log(`setting ${key} to ${value}`);
    return Reflect.set(target, key, value);
  },
});
proxy.a;
proxy.b = 2;
```

<details>
<summary>答案</summary>

```
getting a
setting b to 2
```

Proxy 拦截了属性的读取和设置操作。

</details>

---

### 第 77 题

```js
const obj = { a: 1, b: 2 };
const proxy = new Proxy(obj, {
  has(target, key) {
    console.log("checking", key);
    return key in target;
  },
});
console.log("a" in proxy);
console.log("c" in proxy);
```

<details>
<summary>答案</summary>

```
checking a
true
checking c
false
```

`has` 拦截器拦截 `in` 操作。

</details>

---

### 第 78 题

```js
const arr = [];
const proxy = new Proxy(arr, {
  set(target, key, value) {
    if (key === "length") return true;
    console.log(`set index ${key} to ${value}`);
    target[key] = value * 2;
    return true;
  },
});
proxy.push(1);
proxy.push(2);
console.log(proxy[0]);
console.log(proxy[1]);
```

<details>
<summary>答案</summary>

```
set index 0 to 1
set index 1 to 2
2
4
```

Proxy 拦截 `set`，将值乘以 2 再存入。`push` 触发 `set` 拦截器。

</details>

---

### 第 79 题

```js
function sum(a, b) {
  return a + b;
}
const proxy = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log("called with", args);
    return Reflect.apply(target, thisArg, args) * 10;
  },
});
console.log(proxy(1, 2));
```

<details>
<summary>答案</summary>

```
called with [1, 2]
30
```

`apply` 拦截器拦截函数调用，返回值乘以 10。

</details>

---

### 第 80 题

```js
const proxy = new Proxy(
  {},
  {
    get(target, key) {
      if (!(key in target)) {
        target[key] = key;
      }
      return target[key];
    },
  },
);
console.log(proxy.foo);
console.log(proxy.foo);
```

<details>
<summary>答案</summary>

```
foo
foo
```

首次访问 `foo` 不存在，自动创建 `target.foo = 'foo'`，之后返回缓存值。

</details>

---

## 十五、WeakMap / WeakSet / Set / Map（5 题）

### 第 81 题

```js
const wm = new WeakMap();
let obj = { a: 1 };
wm.set(obj, "value");
console.log(wm.get(obj));
obj = null;
console.log(wm.get(obj));
```

<details>
<summary>答案</summary>

```
value
undefined
```

`obj = null` 后原引用被切断，`wm.get(null)` 找不到键返回 `undefined`。原对象可能被垃圾回收。

</details>

---

### 第 82 题

```js
const set = new Set([1, 2, 3, 2, 1]);
console.log(set.size);
console.log(set.has(2));
set.delete(1);
console.log([...set]);
```

<details>
<summary>答案</summary>

```
3
true
[2, 3]
```

Set 自动去重，`size` 为 3；`has` 检查存在性；`delete` 删除元素。

</details>

---

### 第 83 题

```js
const map = new Map();
const key1 = { id: 1 };
const key2 = { id: 1 };
map.set(key1, "a");
map.set(key2, "b");
console.log(map.size);
console.log(map.get(key1));
console.log(map.get(key2));
```

<details>
<summary>答案</summary>

```
2
a
b
```

Map 的键使用引用相等，`key1` 和 `key2` 是不同的对象引用。

</details>

---

### 第 84 题

```js
const ws = new WeakSet();
let a = { x: 1 };
let b = { x: 2 };
ws.add(a);
ws.add(b);
console.log(ws.has(a));
console.log(ws.has(b));
a = null;
```

<details>
<summary>答案</summary>

```
true
true
```

`WeakSet` 只能存对象引用，`has` 检查引用是否存在。`a = null` 后原对象可被 GC 回收。

</details>

---

### 第 85 题

```js
const map = new Map();
map.set(-0, "neg");
map.set(+0, "pos");
map.set(NaN, "not a number");
map.set(NaN, "still NaN");
console.log(map.size);
console.log(map.get(+0));
console.log(map.get(NaN));
```

<details>
<summary>答案</summary>

```
2
pos
still NaN
```

Map 中 `-0` 和 `+0` 被视为同一个键；`NaN` 与 `NaN` 也被视为同一个键。

</details>

---

## 十六、Class 类（5 题）

### 第 86 题

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a noise.`);
  }
  static create(name) {
    return new Animal(name);
  }
}
class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}
const d = new Dog("Rex");
d.speak();
Dog.create("Max").speak();
```

<details>
<summary>答案</summary>

```
Rex barks.
Max makes a noise.
```

`Dog` 实例调用重写的 `speak`；`Dog.create` 继承静态方法，但创建的是 `Animal` 实例。

</details>

---

### 第 87 题

```js
class Parent {
  static staticMethod() {
    return "static";
  }
  static hello() {
    return super.staticMethod();
  }
}
class Child extends Parent {
  static hello() {
    return super.staticMethod();
  }
}
console.log(Child.hello());
console.log(Parent.hello());
```

<details>
<summary>答案</summary>

```
static
TypeError: super.staticMethod is not a function
```

`Child` 通过 `super` 调用父类静态方法正常；`Parent` 的 `super` 指向 `Function.prototype`，没有 `staticMethod`。

</details>

---

### 第 88 题

```js
class A {
  constructor() {
    this.x = 1;
  }
}
class B extends A {
  constructor() {
    super();
    this.y = 2;
  }
}
const b = new B();
console.log(b instanceof B);
console.log(b instanceof A);
console.log(b.x);
console.log(b.y);
```

<details>
<summary>答案</summary>

```
true
true
1
2
```

`extends` 和 `super()` 实现继承，`b` 同时是 `B` 和 `A` 的实例。

</details>

---

### 第 89 题

```js
class Foo {
  #privateField = 42;
  getPrivate() {
    return this.#privateField;
  }
}
const f = new Foo();
console.log(f.getPrivate());
console.log(f.#privateField);
```

<details>
<summary>答案</summary>

```
42
SyntaxError: Private field '#privateField' must be declared in an enclosing class
```

私有字段只能在类内部访问，外部访问会报语法错误。

</details>

---

### 第 90 题

```js
class List {
  #items = [];
  add(item) {
    this.#items.push(item);
  }
  get count() {
    return this.#items.length;
  }
}
const list = new List();
list.add(1);
list.add(2);
console.log(list.count);
list.add(3);
console.log(list.count);
```

<details>
<summary>答案</summary>

```
2
3
```

`getter` 动态返回私有字段的长度。

</details>

---

## 十七、解构与展开（5 题）

### 第 91 题

```js
const obj = { a: 1, b: 2, c: 3 };
const { a: x, b: y, c: z } = obj;
console.log(x, y, z);
console.log(a);
```

<details>
<summary>答案</summary>

```
1 2 3
ReferenceError: a is not defined
```

`a: x` 将 `obj.a` 赋给变量 `x`，`a` 本身不是变量。

</details>

---

### 第 92 题

```js
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2];
console.log(merged);
const [first, ...rest] = merged;
console.log(first);
console.log(rest);
```

<details>
<summary>答案</summary>

```
[1, 2, 3, 4]
1
[2, 3, 4]
```

展开运算符合并数组；解构时 `...rest` 收集剩余元素。

</details>

---

### 第 93 题

```js
const obj = { a: 1, b: { c: 2 } };
const copy = { ...obj };
copy.a = 10;
copy.b.c = 20;
console.log(obj.a);
console.log(obj.b.c);
```

<details>
<summary>答案</summary>

```
1
20
```

展开运算符是浅拷贝，`a` 修改不影响原对象，但 `b` 是引用类型，修改 `b.c` 会影响原对象。

</details>

---

### 第 94 题

```js
function draw({ size = "big", coords: { x = 0, y = 0 } = {} } = {}) {
  console.log(size, x, y);
}
draw();
draw({ size: "small" });
draw({ coords: { x: 1 } });
```

<details>
<summary>答案</summary>

```
big 0 0
small 0 0
big 1 0
```

嵌套解构的默认值逐层生效。

</details>

---

### 第 95 题

```js
const user = { name: "Tom", age: 20 };
const job = { title: "dev", age: 30 };
const merged = { ...user, ...job };
console.log(merged);
```

<details>
<summary>答案</summary>

```
{ name: 'Tom', age: 30, title: 'dev' }
```

对象展开时后面的属性覆盖前面的同名属性。

</details>

---

## 十八、Promise 高级（5 题）

### 第 96 题

```js
Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]).then(
  console.log,
);

Promise.all([Promise.resolve(1), Promise.reject("error"), Promise.resolve(3)])
  .then(console.log)
  .catch(console.log);
```

<details>
<summary>答案</summary>

```
[1, 2, 3]
error
```

`Promise.all` 全部成功返回结果数组；有一个失败则进入 `catch`。

</details>

---

### 第 97 题

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3),
]).then(console.log);
```

<details>
<summary>答案</summary>

```
[
  { status: 'fulfilled', value: 1 },
  { status: 'rejected', reason: 'error' },
  { status: 'fulfilled', value: 3 }
]
```

`Promise.allSettled` 等待所有 Promise 完成，无论成功或失败。

</details>

---

### 第 98 题

```js
Promise.race([
  new Promise((resolve) => setTimeout(() => resolve(1), 100)),
  new Promise((resolve) => setTimeout(() => resolve(2), 50)),
  new Promise((resolve) => setTimeout(() => resolve(3), 200)),
]).then(console.log);
```

<details>
<summary>答案</summary>

```
2
```

`Promise.race` 返回最先完成的结果（50ms 的那个）。

</details>

---

### 第 99 题

```js
Promise.any([
  Promise.reject("error1"),
  Promise.reject("error2"),
  Promise.resolve("success"),
])
  .then(console.log)
  .catch(console.log);
```

<details>
<summary>答案</summary>

```
success
```

`Promise.any` 返回第一个成功的 Promise。

</details>

---

### 第 100 题

```js
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve("p1");
  }, 100);
});
const p2 = new Promise((resolve) => {
  setTimeout(() => {
    resolve("p2");
  }, 50);
});
Promise.all([p1, p2]).then((results) => {
  console.log(results);
});
Promise.race([p1, p2]).then((result) => {
  console.log(result);
});
```

<details>
<summary>答案</summary>

```
p2
['p1', 'p2']
```

`race` 先输出 `p2`（50ms 先完成）；`all` 等待全部完成后按顺序输出数组。

</details>

---

> 完！以上 100 题涵盖了 JavaScript 核心知识点，建议逐题独立思考后再查看答案。
