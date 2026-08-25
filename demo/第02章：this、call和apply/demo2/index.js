// ==============================
// call 和 apply
// ==============================

console.log('=== call 和 apply 的区别 ===');

const func = function (a, b, c) {
  console.log('a:', a, 'b:', b, 'c:', c);
  console.log('this:', this);
};

// call 逐个传入参数
func.call({ name: 'call' }, 1, 2, 3);
// a: 1 b: 2 c: 3
// this: { name: 'call' }

// apply 以数组形式传入参数
func.apply({ name: 'apply' }, [1, 2, 3]);
// a: 1 b: 2 c: 3
// this: { name: 'apply' }

// ==============================
// 使用 call/apply 改变 this 指向
// ==============================

console.log('\n=== 改变 this 指向 ===');

const obj1 = {
  name: 'sven',
  getName: function () {
    return this.name;
  },
};

const obj2 = {
  name: 'anne',
};

console.log(obj1.getName()); // sven
console.log(obj1.getName.call(obj2)); // anne
console.log(obj1.getName.apply(obj2)); // anne

// ==============================
// 借用方法 —— Array.prototype.push
// ==============================

console.log('\n=== 借用方法 ===');

// arguments 是类数组对象，没有 push 方法
// 但可以借用 Array.prototype.push
(function () {
  console.log('arguments length before push:', arguments.length); // 2
  Array.prototype.push.call(arguments, 3);
  console.log('arguments length after push:', arguments.length); // 3
  console.log('arguments[2]:', arguments[2]); // 3
})(1, 2);

// 借用 Array.prototype.slice 将 arguments 转为数组
(function () {
  const args = Array.prototype.slice.call(arguments);
  console.log('args is Array:', args instanceof Array); // true
  console.log('args:', args); // [1, 2, 3]
})(1, 2, 3);

// ==============================
// 借用方法 —— Math.max
// ==============================

console.log('\n=== Math.max.apply ===');

const numbers = [1, 2, 5, 3, 4];

// Math.max 不接受数组，只能逐个传参
console.log('Math.max(1, 2, 5, 3, 4):', Math.max(1, 2, 5, 3, 4)); // 5

// 使用 apply 展开数组
console.log(
  'Math.max.apply(null, [1,2,5,3,4]):',
  Math.max.apply(null, numbers)
); // 5

// 同理，Math.min
console.log(
  'Math.min.apply(null, [1,2,5,3,4]):',
  Math.min.apply(null, numbers)
); // 1

// ==============================
// 借用构造函数（伪经典继承）
// ==============================

console.log('\n=== 借用构造函数 ===');

const Animal = function (name) {
  this.name = name;
};

const Dog = function (name, age) {
  Animal.apply(this, arguments); // 借用 Animal 构造函数
  this.age = age;
};

const dog = new Dog('wangwang', 3);
console.log('dog.name:', dog.name); // wangwang
console.log('dog.age:', dog.age); // 3
