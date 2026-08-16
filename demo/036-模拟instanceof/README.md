# 036 - 模拟实现 instanceof 操作符

> `instanceof` 用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的**原型链**上。

## 原生行为回顾

```js
function Person(name) {
  this.name = name;
}
const p = new Person('张三');

console.log(p instanceof Person); // true
console.log(p instanceof Object); // true（原型链上有 Object.prototype）
console.log([] instanceof Array); // true
console.log(1 instanceof Number); // false（基本类型不是实例）
```

## 手写实现

```js
function myInstanceof(instance, constructor) {
  // 右侧必须是函数
  if (typeof constructor !== 'function') {
    throw new TypeError('Right-hand side of instanceof is not callable');
  }

  // 基本类型直接返回 false
  if (instance === null || (typeof instance !== 'object' && typeof instance !== 'function')) {
    return false;
  }

  // 获取实例的原型
  let proto = Object.getPrototypeOf(instance);
  const targetPrototype = constructor.prototype;

  // 沿原型链向上查找
  while (proto !== null) {
    if (proto === targetPrototype) {
      return true; // 找到了：构造函数的原型在实例的原型链上
    }
    proto = Object.getPrototypeOf(proto); // 继续向上
  }

  return false; // 到达 null（原型链顶端）仍未找到
}
```

## 测试

```js
function Person(name) {
  this.name = name;
}
const p = new Person('张三');

console.log(myInstanceof(p, Person)); // true
console.log(myInstanceof(p, Object)); // true
console.log(myInstanceof([], Array)); // true
console.log(myInstanceof([], Object)); // true
console.log(myInstanceof('abc', String)); // false
console.log(myInstanceof(new String('abc'), String)); // true
console.log(myInstanceof(() => {}, Function)); // true

// 修改原型链
const obj = Object.create(null);
console.log(myInstanceof(obj, Object)); // false（原型链上没有 Object.prototype）

// Symbol.hasInstance 支持（原生 instanceof 会优先调用它）
class Even {
  static [Symbol.hasInstance](num) {
    return num % 2 === 0;
  }
}
console.log(4 instanceof Even); // true
```

## 图示说明

```text
p ---> Person.prototype ---> Object.prototype ---> null

myInstanceof 沿着这条链逐级比较：
proto = p.__proto__              === Person.prototype ? 是 -> true
proto = p.__proto__.__proto__    === Person.prototype ? 否
                                  === Object.prototype ?（当 constructor 是 Object 时为 true）
...
proto = null                     -> false
```
