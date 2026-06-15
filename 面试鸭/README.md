# call 方法

```javascript
Function.prototype.myCallSimple = function(context, ...args) {
  // 1. 判断调用对象是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.myCallSimple - What is trying to be bound is not callable');
  }

  // 2. 如果 context 为 null 或 undefined，则将其设置为全局对象（window 或 global）
  context = context || window;

  // 3. 将函数作为 context 的属性
  const fn = Symbol(); // 使用 Symbol 避免属性名冲突
  context[fn] = this;

  // 4. 执行函数
  const result = context[fn](...args);

  // 5. 删除 context 上的属性
  delete context[fn];

  // 6. 返回结果
  return result;
};

// 示例用法
function greet(message) {
  console.log(`${message}, ${this.name}!`);
}

const person = { name: 'Alice' };

greet.myCallSimple(person, 'Hello'); // 输出: Hello, Alice!
```

<br>

# apply 方法

```javascript
Function.prototype.myApplySimple = function(context, args) {
  // 1. 判断调用对象是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.myApplySimple - What is trying to be bound is not callable');
  }

  // 2. 如果 context 为 null 或 undefined，则将其设置为全局对象（window 或 global）
  context = context || window;

  // 3. 将函数作为 context 的属性
  const fn = Symbol(); // 使用 Symbol 避免属性名冲突
  context[fn] = this;

  // 4. 执行函数
  let result;
  if (args && Array.isArray(args)) {
    result = context[fn](...args);
  } else {
    result = context[fn]();
  }

  // 5. 删除 context 上的属性
  delete context[fn];

  // 6. 返回结果
  return result;
};

// 示例用法
function greet(message) {
  console.log(`${message}, ${this.name}!`);
}

const person = { name: 'Alice' };

greet.myApplySimple(person, ['Hello']); // 输出: Hello, Alice!
```

<br>

# bind 方法

```javascript
Function.prototype.myBindSimple = function(context, ...args) {
  // 1. 判断调用对象是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.myBindSimple - What is trying to be bound is not callable');
  }

  // 2. 保存 this
  const self = this;

  // 3. 返回一个新的函数
  return function(...newArgs) {
    // 4. 执行函数
    return self.apply(context, args.concat(newArgs));
  };
};

// 示例用法
function greet(message) {
  console.log(`${message}, ${this.name}!`);
}

const person = { name: 'Alice' };

const greetAlice = greet.myBindSimple(person, 'Hello');
greetAlice(); // 输出: Hello, Alice!
```

<br>

# typeof 

```javascript
function myTypeof(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}
```

<br>

# 模拟 instanceof 

```javascript
function myInstanceOfSimple(obj, constructor) {
  // 1. 检查参数是否合法
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  if (typeof constructor !== 'function') {
    throw new TypeError('Right-hand side of \'instanceof\' is not callable');
  }

  // 2. 获取对象的原型
  let proto = Object.getPrototypeOf(obj);

  // 3. 循环遍历原型链
  while (proto) {
    // 4. 检查原型是否等于构造函数的 prototype 属性
    if (proto === constructor.prototype) {
      return true;
    }
    // 5. 继续向上查找原型链
    proto = Object.getPrototypeOf(proto);
  }

  // 6. 如果原型链上没有找到，则返回 false
  return false;
}

// 示例用法
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person = new Person('Alice', 30);

console.log(myInstanceOfSimple(person, Person));   // 输出: true
console.log(myInstanceOfSimple(person, Object));   // 输出: true
console.log(myInstanceOfSimple(person, Array));    // 输出: false
console.log(myInstanceOfSimple({}, Person));       // 输出: false
console.log(myInstanceOfSimple(null, Person));     // 输出: false
```

<br>

# 函数所有参数求和

```javascript
function sum(...args) {
    return args.reduce((acc, curr) => acc + curr, 0);
}
```

<br>

# setTimeout 模拟 setInterval

```javascript
function mySetIntervalSimple(func, delay) {
  function interval() {
    func();
    setTimeout(interval, delay);
  }
  setTimeout(interval, delay); // 首次执行
}

mySetIntervalSimple(() => {}, 1000);
```

<br>

# 防抖

```javascript
function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay)
    }
}
```

<br>

# 节流

```javascript
function throttle(func, apply) {
    let lastExecutionTime = 0;
    
    return function (...args) {
        const now = Date.now();
        
        if (now - lastExecutonTime >= delay) {
            lastExecutionTime = now;
            func.apply(this, args);
        };
    }
}
```

<br>

# 深拷贝

```javascript
function deepCopy(obj, hash = new WeakMap()) {
    // 基本数据类型直接返回
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    
    // 处理循环引用
    if (hash.has(obj)) {
        return hash.get(obj);
    }
    
    // 处理数组
    if (Array.isArray(obj)) {
        const arrCopy = [];
        hash.set(obj, arrCopy);
        obj.forEach((item, index) => {
            arrCopy[index] = deepCopy(item, hash);
        });
        
        return arrCopy;
    }
    
    // 处理对象
    const objCopy = {};
    hash.set(obj, objCopy);
    Object.keys(obj).forEach((key) => {
        objCopy[key] = deepCopy(obj[key], hash);
    });
    
    return objCopy;
    
}
```

<br>

# promise

```javascript
class MyPromiseSimple {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }

    if (this.state === 'rejected') {
      onRejected(this.reason);
    }

    if (this.state === 'pending') {
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value);
      });

      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}

// 示例用法
const promise = new MyPromiseSimple((resolve, reject) => {
  setTimeout(() => {
    resolve('成功');
  }, 1000);
});

promise.then(
  (value) => {
    console.log('resolve', value);
  },
  (reason) => {
    console.log('reject', reason);
  }
);
```

<br>

# 实现 Promise.all

```javascript
function myPromiseAllSimple(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completedCount = 0;

    if (!promises || promises.length === 0) {
      resolve(results);
      return;
    }

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];

      Promise.resolve(promise) // 确保是 Promise 对象
        .then((value) => {
          results[i] = value;
          completedCount++;

          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}

// 示例用法
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

myPromiseAllSimple([promise1, promise2, promise3])
  .then((results) => {
    console.log('Results:', results); // 输出: Results: [1, 2, 3]
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

<br>

# 实现 Promise.finally

```javascript
Promise.prototype.myFinallySimple = function(callback) {
  return this.then(
    (value) => {
      callback();
      return value; // 传递 fulfilled 的值
    },
    (reason) => {
      callback();
      throw reason; // 传递 rejected 的原因
    }
  );
};

// 示例用法
const promise = Promise.resolve('成功');

promise
  .then((value) => {
    console.log('Then:', value);
    return value;
  })
  .myFinallySimple(() => {
    console.log('Finally: 无论成功或失败都会执行');
  });
```

<br>

# 实现 promise.allSettled

```javascript
Promise.myAllSettledSimple = function(promises) {
  return new Promise((resolve) => {
    const results = [];
    let completedCount = 0;

    if (!promises || promises.length === 0) {
      resolve(results);
      return;
    }

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];

      Promise.resolve(promise)
        .then((value) => {
          results[i] = { status: 'fulfilled', value };
        })
        .catch((reason) => {
          results[i] = { status: 'rejected', reason };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        });
    }
  });
};

// 示例用法
const promise1 = Promise.resolve(1);
const promise2 = Promise.reject('失败');
const promise3 = Promise.resolve(3);

Promise.myAllSettledSimple([promise1, promise2, promise3])
  .then((results) => {
    console.log('Results:', results);
    // 输出:
    // Results: [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: '失败' },
    //   { status: 'fulfilled', value: 3 }
    // ]
  });
```

<br>

# 实现 promise.race

```javascript
Promise.myRaceSimple = function(promises) {
  return new Promise((resolve, reject) => {
    if (!promises || promises.length === 0) {
      return; // 如果没有 promises，则返回的 promise 将永远 pending
    }

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];

      Promise.resolve(promise) // 确保是 Promise 对象
        .then(resolve, reject); // 任何一个 promise resolve 或 reject，就立即 resolve 或 reject
    }
  });
};

// 示例用法
const promise1 = new Promise((resolve) => setTimeout(() => resolve(1), 1000));
const promise2 = new Promise((resolve) => setTimeout(() => resolve(2), 500));
const promise3 = new Promise((resolve, reject) => setTimeout(() => reject('失败'), 200));

Promise.myRaceSimple([promise1, promise2, promise3])
  .then((value) => {
    console.log('Resolved:', value); // 输出: Resolved: 失败 (因为 promise3 最先 reject)
  })
  .catch((reason) => {
    console.error('Rejected:', reason); // 不会输出，因为 promise2 最先 resolve
  });
```

<br>

# 数组去重

## 1. 使用 set

```javascript
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

const arr = [1, 2, 2, 3, 4, 4, 5];
const uniqueArr = removeDuplicates(arr);
console.log(uniqueArr); // 输出：[1, 2, 3, 4, 5]
```

<br>

## 2. 使用 filter()

```javascript
function removeDuplicates(arr) {
    return arr.filter(function(item, index) {
        return arr.indexOf(item) === index;
    });
}

const arr = [1, 2, 2, 3, 4, 4, 5];
const uniqueArr = removeDuplicates(arr);
console.log(uniqueArr); // 输出：[1, 2, 3, 4, 5]
```

<br>

## 3. 使用 forEach()

```javascript
function removeDuplicates(arr) {
  const uniqueArr = [];
  arr.forEach(function(item) {
    if (!uniqueArr.includes(item)) {
      uniqueArr.push(item);
    }
  });
  return uniqueArr;
}

const arr = [1, 2, 2, 3, 4, 4, 5];
const uniqueArr = removeDuplicates(arr);
console.log(uniqueArr); // 输出: [1, 2, 3, 4, 5]
```

<br>

## 4. 使用 reduce()

```javascript
function removeDuplicates(arr) {
  return arr.reduce(function(uniqueArr, item) {
    if (!uniqueArr.includes(item)) {
      uniqueArr.push(item);
    }
    return uniqueArr;
  }, []);
}

const arr = [1, 2, 2, 3, 4, 4, 5];
const uniqueArr = removeDuplicates(arr);
console.log(uniqueArr); // 输出: [1, 2, 3, 4, 5]
```

<br>

## 5. 使用 map

```javascript
function removeDuplicates(arr) {
  const map = new Map();
  const uniqueArr = [];

  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      map.set(arr[i], true);
      uniqueArr.push(arr[i]);
    }
  }

  return uniqueArr;
}

const arr = [1, 2, 2, 3, 4, 4, 5];
const uniqueArr = removeDuplicates(arr);
console.log(uniqueArr); // 输出: [1, 2, 3, 4, 5]
```

<br>

# 数组扁平化

## 1. 使用 flat() 方法

```javascript
const arr = [1, 2, [3, [4, 5]]];

// 默认扁平化一层
console.log(arr.flat()); // 输出: [1, 2, 3, [4, 5]]

// 扁平化两层
console.log(arr.flat(2)); // 输出: [1, 2, 3, 4, 5]

// 扁平化所有层级
console.log(arr.flat(Infinity)); // 输出: [1, 2, 3, 4, 5]
```

<br>

## 2. 使用递归方法

```javascript
function flatten(arr) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      // 如果是数组，递归调用 flatten
      result.push(...flatten(arr[i]));
    } else {
      // 如果不是数组，直接添加到结果数组
      result.push(arr[i]);
    }
  }

  return result;
}

const arr = [1, 2, [3, [4, 5]]];
console.log(flatten(arr)); // 输出: [1, 2, 3, 4, 5]
```

<br>

## 3. 使用 reduce() 方法

```javascript
function flatten(arr) {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

const arr = [1, 2, [3, [4, 5]]];
console.log(flatten(arr)); // 输出: [1, 2, 3, 4, 5]
```

<br>

## 4. 使用栈

```javascript
function flatten(arr) {
  const result = [];
  const stack = [...arr]; // 使用栈来存储数组元素

  while (stack.length) {
    const next = stack.pop(); // 从栈顶取出元素

    if (Array.isArray(next)) {
      // 如果是数组，将其元素展开并放回栈顶
      stack.push(...next);
    } else {
      // 如果不是数组，添加到结果数组的开头
      result.unshift(next);
    }
  }

  return result;
}

const arr = [1, 2, [3, [4, 5]]];
console.log(flatten(arr)); // 输出: [1, 2, 3, 4, 5]
```

<br>

# forEach

<br>

# reduce

<br>

# map

<br>

# filter

<br>

# every

<br>

# some

<br>

# find、findIndex

<br>

# indexOf

<br>

# sort

<br>

# 防抖

```javascript
function debounceSimple(func, delay) {
  let timer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      func.apply(context, args);
    }, delay);
  };
}

// 示例用法
function search(query) {
  console.log('Searching for:', query);
}

const debouncedSearch = debounceSimple(search, 300);

// 模拟输入事件
debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc');
setTimeout(() => { debouncedSearch('abcd'); }, 200); // 在 200ms 后输入 'abcd'
setTimeout(() => { debouncedSearch('abcde'); }, 500); // 在 500ms 后输入 'abcde'
```

<br>

# 节流

```javascript
function throttleSimple(func, delay) {
  let lastCall = 0;
  return function() {
    const context = this;
    const args = arguments;
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    func.apply(context, args);
  };
}

// 示例用法
function resizeHandler() {
  console.log('Resizing...');
}

const throttledResizeHandler = throttleSimple(resizeHandler, 100);

// 模拟 resize 事件
window.addEventListener('resize', throttledResizeHandler);
```

<br>

# 深拷贝

```javascript
function deepCopy(obj, map = new WeakMap()) {
  // 检查是否为 null 或非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 检查是否已经拷贝过该对象，处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  // 创建新对象或数组
  const newObj = Array.isArray(obj) ? [] : {};

  // 将新对象放入 WeakMap 中，用于处理循环引用
  map.set(obj, newObj);

  // 递归拷贝属性
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key], map);
    }
  }

  return newObj;
}

const obj = {
  name: 'Alice',
  age: 30,
  address: {
    city: 'New York',
    country: 'USA'
  },
  hobbies: ['reading', 'hiking'],
  date: new Date(),
  fn: function() { console.log('hello'); },
  sym: Symbol('test'),
  undef: undefined
};

// 添加循环引用
obj.circularRef = obj;

const deepCopyObj = deepCopy(obj);

deepCopyObj.name = 'Bob';
deepCopyObj.address.city = 'Los Angeles';

console.log('Original Object:', obj);
console.log('Deep Copy Object:', deepCopyObj);
```

<br>

# new

```javascript
function myNewSimple(constructor, ...args) {
  // 1. 创建一个新对象
  const obj = {};

  // 2. 将新对象的 [[Prototype]] 属性设置为构造函数的 prototype 属性
  obj.__proto__ = constructor.prototype;

  // 3. 将 this 绑定到新对象，并执行构造函数
  const result = constructor.apply(obj, args);

  // 4. 如果构造函数返回一个对象，则返回该对象；否则，返回新创建的对象
  return (typeof result === 'object' && result !== null) || typeof result === 'function' ? result : obj;
}

// 示例用法
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
};

const person1 = myNewSimple(Person, 'Alice', 30);
person1.sayHello(); // 输出: Hello, my name is Alice and I am 30 years old.
```

<br>

# 继承

## 1. 原型链继承

```javascript
function Animal(name) {
  this.name = name;
  this.species = "Animal";
}

Animal.prototype.sayName = function() {
  console.log("My name is " + this.name);
};

function Dog(name, breed) {
  this.breed = breed;
  Animal.call(this, name); // 构造函数窃取，解决子类实例属性问题
}

// 关键步骤：Dog 的原型指向 Animal 的实例
Dog.prototype = new Animal();

// 修复 constructor 指向
Dog.prototype.constructor = Dog;

Dog.prototype.sayBreed = function() {
  console.log("My breed is " + this.breed);
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.sayName(); // 输出: My name is Buddy
dog.sayBreed(); // 输出: My breed is Golden Retriever
console.log(dog.species); // 输出: Animal
```

<br>

## 2. 构造函数继承

```javascript
function Animal(name) {
  this.name = name;
  this.species = "Animal";
  this.sayName = function() { // 每个实例都有自己的方法副本
    console.log("My name is " + this.name);
  };
}

function Dog(name, breed) {
  Animal.call(this, name); // 关键步骤：在 Dog 的构造函数中调用 Animal 的构造函数
  this.breed = breed;
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.sayName(); // 输出: My name is Buddy
console.log(dog.species); // 输出: Animal
```

<br>

## 3. 组合继承

```javascript
function Animal(name) {
  this.name = name;
  this.species = "Animal";
}

Animal.prototype.sayName = function() {
  console.log("My name is " + this.name);
};

function Dog(name, breed) {
  Animal.call(this, name); // 构造函数窃取，继承实例属性
  this.breed = breed;
}

// 原型链继承，继承原型方法
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog; // 修复 constructor 指向

Dog.prototype.sayBreed = function() {
  console.log("My breed is " + this.breed);
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.sayName(); // 输出: My name is Buddy
dog.sayBreed(); // 输出: My breed is Golden Retriever
console.log(dog.species); // 输出: Animal
```

<br>

## 4. 原型式继承

```javascript
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

const animal = {
  name: "Animal",
  species: "Mammal",
  sayName: function() {
    console.log("My name is " + this.name);
  }
};

const dog = object(animal);
dog.name = "Buddy";
dog.breed = "Golden Retriever";
dog.sayName(); // 输出: My name is Buddy
console.log(dog.species); // 输出: Mammal
```

<br>

## 5. 寄生式继承

```javascript
function createAnother(original) {
  const clone = Object.create(original); // 通过调用函数创建一个新对象
  clone.sayHi = function() { // 以某种方式增强这个对象
    console.log("hi");
  };
  return clone; // 返回这个对象
}

const animal = {
  name: "Animal",
  species: "Mammal",
  sayName: function() {
    console.log("My name is " + this.name);
  }
};

const dog = createAnother(animal);
dog.name = "Buddy";
dog.sayName(); // 输出: My name is Buddy
dog.sayHi(); // 输出: hi
```

<br>

## 6. 寄生组合式继承

```javascript
function Animal(name) {
  this.name = name;
  this.species = "Animal";
}

Animal.prototype.sayName = function() {
  console.log("My name is " + this.name);
};

function Dog(name, breed) {
  Animal.call(this, name); // 构造函数窃取，继承实例属性
  this.breed = breed;
}

// 关键步骤：使用寄生式继承来继承父类原型
function inheritPrototype(subType, superType) {
  const prototype = Object.create(superType.prototype); // 创建对象
  prototype.constructor = subType; // 增强对象
  subType.prototype = prototype; // 指定对象
}

inheritPrototype(Dog, Animal);

Dog.prototype.sayBreed = function() {
  console.log("My breed is " + this.breed);
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.sayName(); // 输出: My name is Buddy
dog.sayBreed(); // 输出: My breed is Golden Retriever
console.log(dog.species); // 输出: Animal
```

<br>

## 7. class 继承

```javascript
class Animal {
  constructor(name) {
    this.name = name;
    this.species = "Animal";
  }

  sayName() {
    console.log("My name is " + this.name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类的 constructor
    this.breed = breed;
  }

  sayBreed() {
    console.log("My breed is " + this.breed);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.sayName(); // 输出: My name is Buddy
dog.sayBreed(); // 输出: My breed is Golden Retriever
console.log(dog.species); // 输出: Animal
```

<br>

# object.create

```javascript
Object.myCreateSimple = function(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
};

// 示例用法
const animal = {
  name: "Animal",
  species: "Mammal",
  sayName: function() {
    console.log("My name is " + this.name);
  }
};

const dog = Object.myCreateSimple(animal);
dog.name = "Buddy";
dog.sayName(); // 输出: My name is Buddy
console.log(dog.species); // 输出: Mammal
```

<br>

# 实现柯里化

```javascript
function currySimple(fn) {
  return function(a) {
    return function(b) {
      return fn(a, b);
    };
  };
}

// 示例函数
function add(a, b) {
  return a + b;
}

// 柯里化后的函数
const curriedAdd = currySimple(add);

console.log(curriedAdd(1)(2)); // 输出: 3
```

<br>

# ajax

<br>

# jsonp

```javascript
function jsonpSimple(url, callbackName, callback) {
  // 创建 script 标签
  const script = document.createElement('script');
  script.src = url + '?callback=' + callbackName;
  script.async = true;

  // 定义全局回调函数
  window[callbackName] = function(data) {
    callback(data);

    // 清理：移除 script 标签和全局回调函数
    delete window[callbackName];
    script.parentNode.removeChild(script);
  };

  // 将 script 标签添加到 head 中
  document.head.appendChild(script);
}

// 示例用法
function handleResponse(data) {
  console.log('JSONP Response:', data);
}

jsonpSimple(
  'https://jsonplaceholder.typicode.com/todos/1',
  'handleResponse',
  handleResponse
);
```

<br>

# set

<br>

# map

<br>

# es6 的 class

<br>

# 实现千分位分隔符

```javascript
function formatNumberSimple(number) {
  const numStr = number.toString();
  let result = '';
  let count = 0;

  for (let i = numStr.length - 1; i >= 0; i--) {
    result = numStr[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = ',' + result;
    }
  }

  return result;
}

// 示例用法
const number = 1234567;
const formattedNumber = formatNumberSimple(number);
console.log(formattedNumber); // 输出: 1,234,567
```

<br>

# 实现数组转树

```javascript
function arrayToTreeSimple(arr) {
  const tree = [];
  const map = {};

  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];
    node.children = [];
    map[node.id] = node;

    if (node.parentId === 0) { // 假设 0 为根节点
      tree.push(node);
    } else {
      const parent = map[node.parentId];
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return tree;
}

// 示例用法
const arr = [
  { id: 1, parentId: 0, name: 'Root' },
  { id: 2, parentId: 1, name: 'Child 1' },
  { id: 3, parentId: 1, name: 'Child 2' },
  { id: 4, parentId: 2, name: 'Grandchild 1' }
];

const tree = arrayToTreeSimple(arr);
console.log(JSON.stringify(tree, null, 2));
```

<br>

# 实现 sleep 函数

<br>

# 实现发布订阅模式

```javascript
function PubSub() {
  this.subscribers = {};

  this.subscribe = function(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
  };

  this.publish = function(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => {
        callback(data);
      });
    }
  };

  this.unsubscribe = function(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }
  };
}

// 示例用法
const pubSub = new PubSub();

const subscriber1 = function(data) {
  console.log('Subscriber 1 received:', data);
};

const subscriber2 = function(data) {
  console.log('Subscriber 2 received:', data);
};

pubSub.subscribe('message', subscriber1);
pubSub.subscribe('message', subscriber2);

pubSub.publish('message', 'Hello, PubSub!');

pubSub.unsubscribe('message', subscriber1);

pubSub.publish('message', 'This is after unsubscribe.');
```

<br>

# 把一个JSON对象的key从下划线形式（Pascal）转换到小驼峰形式（Camel）

```javascript
function convertKeysToCamelCaseSimple(obj) {
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      newObj[camelCaseKey] = obj[key];
    }
  }
  return newObj;
}

// 示例用法
const obj = {
  first_name: 'Alice',
  last_name: 'Smith',
  user_id: 123
};

const camelCaseObj = convertKeysToCamelCaseSimple(obj);
console.log(camelCaseObj);
// 输出: { firstName: "Alice", lastName: "Smith", userId: 123 }
```

<br>

# 解析 URL 参数为对象

```javascript
function parseQueryStringSimple(url) {
  const queryString = url.split('?')[1];
  if (!queryString) {
    return {};
  }

  const params = {};
  const pairs = queryString.split('&');

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');
    params[key] = value;
  }

  return params;
}

// 示例用法
const url = 'https://example.com/path?name=Alice&age=20&city=New%20York';
const params = parseQueryStringSimple(url);
console.log(params);
// 输出: { name: "Alice", age: "20", city: "New York" }
```

<br>











