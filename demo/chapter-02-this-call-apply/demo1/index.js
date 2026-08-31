// ==============================
// this 的指向规则
// ==============================

// 1. 作为对象的方法调用 —— this 指向该对象
console.log('=== 作为对象的方法调用 ===');

var obj = {
  name: 'sven',
  getName: function () {
    console.log('this === obj:', this === obj); // true
    return this.name;
  },
};

console.log(obj.getName()); // sven

// 2. 作为普通函数调用 —— this 指向全局对象(window)
console.log('\n=== 作为普通函数调用 ===');

const name = 'globalName'; // 全局变量

const obj2 = {
  name: 'sven',
  getName: function () {
    return this.name;
  },
};

// 作为方法调用
console.log(obj2.getName()); // sven

// 作为普通函数调用
const getName2 = obj2.getName;
console.log(getName2()); // globalName (浏览器中为 window.name)

// 3. 作为构造器调用 —— this 指向新创建的对象
console.log('\n=== 作为构造器调用 ===');

const Person = function (name) {
  this.name = name;
};

const p = new Person('sven');
console.log(p.name); // sven

// 构造器中的 this 指向新创建的对象
// new 操作符做了以下事情：
// 1. 创建一个新对象
// 2. 将新对象的 __proto__ 指向 Person.prototype
// 3. 将 Person 的 this 绑定到新对象并执行
// 4. 返回新对象

// 如果构造器显式返回一个对象，则 new 的结果是该对象
const MyClass = function () {
  this.name = 'sven';
  return {
    // 显式返回一个对象
    name: 'anne',
  };
};

const obj3 = new MyClass();
console.log(obj3.name); // anne (返回的对象覆盖了 this)

// 如果构造器返回非对象类型，则仍然返回 this
const MyClass2 = function () {
  this.name = 'sven';
  return 'anne'; // 返回字符串，非对象
};

const obj4 = new MyClass2();
console.log(obj4.name); // sven (仍然返回 this)

// ==============================
// this 丢失的问题
// ==============================

console.log('\n=== this 丢失的问题 ===');

const obj5 = {
  name: 'sven',
  getName: function () {
    return this.name;
  },
};

console.log(obj5.getName()); // sven

const getName3 = obj5.getName;
// getName3 是普通函数调用，this 指向全局对象
console.log(getName3()); // globalName (不是 'sven')

// 解决方案：使用 that 保存 this
const obj6 = {
  name: 'sven',
  getName: function () {
    const that = this; // 保存 this 引用
    return function () {
      return that.name;
    };
  },
};

const getName4 = obj6.getName();
console.log(getName4()); // sven (通过闭包正确访问)
