# 013 - JS 实现继承（多种方式）

## 方式一：原型链继承

> 让子类原型指向父类实例。

```js
function Parent() {
  this.name = 'Parent';
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function () {
  console.log(this.name);
};

function Child() {}

Child.prototype = new Parent();

const c1 = new Child();
const c2 = new Child();
c1.colors.push('green');

console.log(c2.colors); // ['red', 'blue', 'green'] 引用类型被所有实例共享！
```

**缺点**：引用类型的属性被所有实例共享；创建子实例时无法向父类构造函数传参。

## 方式二：借用构造函数继承（经典继承）

> 在子类构造函数中调用父类构造函数，绑定 this。

```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function () {
  console.log(this.name);
};

function Child(name) {
  Parent.call(this, name); // 继承实例属性
}

const c1 = new Child('张三');
const c2 = new Child('李四');
c1.colors.push('green');

console.log(c2.colors); // ['red', 'blue'] 互不影响
console.log(c1.sayName); // undefined 无法继承原型上的方法！
```

**缺点**：只能继承实例属性，无法继承原型上的方法/属性。

## 方式三：组合继承（原型链 + 借用构造函数）

```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function () {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name); // 第二次调用 Parent
  this.age = age;
}
Child.prototype = new Parent(); // 第一次调用 Parent
Child.prototype.constructor = Child;

Child.prototype.sayAge = function () {
  console.log(this.age);
};

const c1 = new Child('张三', 18);
c1.sayName(); // 张三
c1.sayAge(); // 18
```

**缺点**：父类构造函数被调用了两次，子类原型上存在多余的实例属性。

## 方式四：原型式继承

```js
function createObject(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}

const parent = { name: 'Parent', colors: ['red'] };
const child = createObject(parent);
child.name = 'Child';
console.log(child.name); // Child
```

等价于 ES5 的 `Object.create(obj)`。**缺点**：与原型链继承一样，引用类型属性共享。

## 方式五：寄生式继承

```js
function createAnother(original) {
  const clone = Object.create(original); // 创建新对象
  clone.sayHi = function () { // 增强对象
    console.log('hi');
  };
  return clone;
}

const person = { name: '张三' };
const anotherPerson = createAnother(person);
anotherPerson.sayHi(); // hi
```

## 方式六：寄生组合式继承（最优方案）

```js
function inheritPrototype(Child, Parent) {
  const prototype = Object.create(Parent.prototype); // 复制父类原型
  prototype.constructor = Child; // 修正构造函数指向
  Child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.sayName = function () {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name); // 只调用一次父类构造函数
  this.age = age;
}
inheritPrototype(Child, Parent);

Child.prototype.sayAge = function () {
  console.log(this.age);
};

const c1 = new Child('张三', 18);
c1.sayName(); // 张三
c1.sayAge(); // 18
```

## 方式七：ES6 class extends（推荐）

```js
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
  }
  sayName() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 调用父类构造函数，必须在使用 this 之前
    this.age = age;
  }
  sayAge() {
    console.log(this.age);
  }
}

const c1 = new Child('张三', 18);
const c2 = new Child('李四', 20);
c1.colors.push('green');

c1.sayName(); // 张三
c1.sayAge(); // 18
console.log(c2.colors); // ['red', 'blue'] 实例间互不影响
```

> `class` 本质是寄生组合式继承的语法糖，但注意 class 内部使用严格模式、
> 方法不可枚举、必须通过 `new` 调用等区别。
