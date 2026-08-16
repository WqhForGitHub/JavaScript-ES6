# 035 - 手写 Object.create 方法

> `Object.create(proto, propertiesObject)`：创建一个新对象，
> 使用现有的对象来提供新创建对象的 `__proto__`。

## 原生行为回顾

```js
const parent = { name: 'parent', say() { console.log(this.name); } };

const child = Object.create(parent);
child.say(); // parent
console.log(Object.getPrototypeOf(child) === parent); // true
console.log(child.hasOwnProperty('name')); // false，name 在原型上
```

## 手写实现

```js
function myCreate(proto, propertiesObject) {
  // 1. 参数校验（与原生一致，proto 只能是对象或 null）
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  if (propertiesObject !== undefined && typeof propertiesObject !== 'object') {
    throw new TypeError('Property description must be an object');
  }

  // 2. 定义一个空的临时构造函数
  function F() {}

  // 3. 把 F 的原型指向 proto
  F.prototype = proto;

  // 4. 创建新实例，其 __proto__ 即为 proto
  const obj = new F();

  // 5. 处理第二个参数：属性描述符（可借用原生 defineProperties）
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  // 6. 传入 null 时保持 undefined 原型（new F() 会得到 Object.prototype，需修正）
  if (proto === null) {
    obj.__proto__ = null;
  }

  return obj;
}
```

## 测试

```js
const parent = {
  name: 'parent',
  say() {
    console.log(`我是 ${this.name}`);
  },
};

const child = myCreate(parent);
child.name = 'child';
child.say(); // 我是 child
console.log(Object.getPrototypeOf(child) === parent); // true

// 第二个参数：属性描述符
const obj = myCreate(parent, {
  age: {
    value: 18,
    writable: true,
    enumerable: true,
    configurable: true,
  },
});
console.log(obj.age); // 18
obj.say(); // 我是 parent（原型上的属性）

// null 原型
const nullProto = myCreate(null);
console.log(nullProto.toString); // undefined，没有继承 Object 原型
```

## 手写实现中的属性描述符（若不使用 Object.defineProperties）

```js
// 若要求 defineProperties 也手写：
function myDefineProperties(obj, props) {
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const descriptor = props[key];
      if ('value' in descriptor) {
        descriptor.writable = descriptor.writable || false;
      }
      descriptor.configurable = descriptor.configurable || false;
      descriptor.enumerable = descriptor.enumerable || false;
      Object.defineProperty(obj, key, descriptor);
    }
  }
  return obj;
}
```
