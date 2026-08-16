# 037 - 模拟实现 new 操作符

## new 做了什么

1. 创建一个全新的空对象；
2. 将新对象的 `__proto__` 指向构造函数的 `prototype`；
3. 将构造函数的 `this` 绑定到新对象并执行；
4. 如果构造函数返回了**对象**，则返回该对象；否则返回新对象。

## 手写实现

```js
function myNew(constructor, ...args) {
  // 1. 校验：constructor 必须是函数
  if (typeof constructor !== 'function') {
    throw new TypeError(`${constructor} is not a constructor`);
  }

  // 2. 创建空对象，原型指向构造函数的 prototype
  //    等价于：const obj = {}; obj.__proto__ = constructor.prototype;
  const obj = Object.create(constructor.prototype);

  // 3. 执行构造函数，this 指向新对象
  const result = constructor.apply(obj, args);

  // 4. 构造函数返回对象时使用该返回值，否则返回新对象
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function');
  return isObject ? result : obj;
}
```

## 测试

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayName = function () {
  console.log(this.name);
};

// 用 myNew 创建实例
const p = myNew(Person, '张三', 18);
console.log(p.name); // 张三
console.log(p.age); // 18
p.sayName(); // 张三
console.log(p instanceof Person); // true
console.log(p.constructor === Person); // true

// 与原生 new 对比
const p2 = new Person('李四', 20);
console.log(p2 instanceof Person); // true
```

## 边界情况验证

```js
// 1. 构造函数返回一个对象：new 表达式得到该对象
function Foo() {
  this.name = 'foo';
  return { name: 'returned' };
}
console.log(myNew(Foo).name); // returned

// 2. 构造函数返回基本类型：忽略，仍返回 this 指向的新对象
function Bar() {
  this.name = 'bar';
  return 'string'; // 基本类型被忽略
}
console.log(myNew(Bar).name); // bar

// 3. 返回 null：同样忽略
function Baz() {
  return null;
}
console.log(myNew(Baz).name); // undefined，返回的是新对象
```

## 另一种写法：**proto** 直接赋值（不推荐，仅演示）

```js
function myNew(constructor, ...args) {
  const obj = {};
  obj.__proto__ = constructor.prototype; // 已废弃的写法
  const result = constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}
```
