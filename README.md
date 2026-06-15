



# 一、异步&事件循环

## 1. 

```javascript
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
```



## 2. 

```javascript
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('resolve1')
})
const promise2 = promise1.then(res => {
  console.log(res)
})
console.log('1', promise1);
console.log('2', promise2);

```





## 3. 

```javascript
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```





## 4. 

```javascript
Promise.resolve().then(() => {
  console.log('promise1');
  const timer2 = setTimeout(() => {
    console.log('timer2')
  }, 0)
});
const timer1 = setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
console.log('start');
```





## 5. 

```javascript
const promise = new Promise((resolve, reject) => {
    resolve('success1');
    reject('error');
    resolve('success2');
});
promise.then((res) => {
    console.log('then:', res);
}).catch((err) => {
    console.log('catch:', err);
})

```





## 6. 

```javascript
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
```





## 7. 

```javascript
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error!!!')
})
console.log('promise1', promise1)
console.log('promise2', promise2)
setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
}, 2000)
```





## 8. 

```javascript
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
```



## 9. 

```javascript
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})
```



## 10.

```javascript
const promise = Promise.resolve().then(() => {
  return promise;
})
promise.catch(console.err);
```





## 11.

```javascript
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
```





## 12.

```javascript
Promise.reject('err!!!')
  .then((res) => {
    console.log('success', res)
  }, (err) => {
    console.log('error', err)
  }).catch(err => {
    console.log('catch', err)
  })
```



## 13. 

```javascript
Promise.resolve('1')
  .then(res => {
    console.log(res)
  })
  .finally(() => {
    console.log('finally')
  })
Promise.resolve('2')
  .finally(() => {
    console.log('finally2')
  	return '我是finally2返回的值'
  })
  .then(res => {
    console.log('finally2后面的then函数', res)
  })
```





## 14. 

```javascript
function runAsync (x) {
    const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
    return p
}

Promise.all([runAsync(1), runAsync(2), runAsync(3)]).then(res => console.log(res))
```





## 15. 

```javascript
function runAsync (x) {
  const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
  return p
}
function runReject (x) {
  const p = new Promise((res, rej) => setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x))
  return p
}
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
       .then(res => console.log(res))
       .catch(err => console.log(err))

```





## 16.

```javascript
function runAsync (x) {
  const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
  return p
}
Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log('result: ', res))
  .catch(err => console.log(err))

```





## 17. 

```javascript
function runAsync(x) {
  const p = new Promise(r =>
    setTimeout(() => r(x, console.log(x)), 1000)
  );
  return p;
}
function runReject(x) {
  const p = new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
  return p;
}
Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log("result: ", res))
  .catch(err => console.log(err));

```





## 18. 

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')
```





## 19. 

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('timer1')
  }, 0)
}
async function async2() {
  setTimeout(() => {
    console.log('timer2')
  }, 0)
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log('timer3')
}, 0)
console.log("start")
```





## 20.

```javascript
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')
```





## 21. 

```javascript
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('promise1 resolve')
  }).then(res => console.log(res))
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end');
```





## 22. 

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(resolve => {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log('script end')
```





## 23. 

```javascript
async function async1 () {
  await async2();
  console.log('async1');
  return 'async1 success'
}
async function async2 () {
  return new Promise((resolve, reject) => {
    console.log('async2')
    reject('error')
  })
}
async1().then(res => console.log(res))

```





## 24. 

```javascript
const first = () => (new Promise((resolve, reject) => {
    console.log(3);
    let p = new Promise((resolve, reject) => {
        console.log(7);
        setTimeout(() => {
            console.log(5);
            resolve(6);
            console.log(p)
        }, 0)
        resolve(1);
    });
    resolve(2);
    p.then((arg) => {
        console.log(arg);
    });
}));
first().then((arg) => {
    console.log(arg);
});
console.log(4);
```







## 25. 

```javascript
const async1 = async () => {
  console.log('async1');
  setTimeout(() => {
    console.log('timer1')
  }, 2000)
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 end')
  return 'async1 success'
} 
console.log('script start');
async1().then(res => console.log(res));
console.log('script end');
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then(res => console.log(res))
setTimeout(() => {
  console.log('timer2')
}, 1000)
```





## 26. 

```javascript
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('resolve3');
    console.log('timer1')
  }, 0)
  resolve('resovle1');
  resolve('resolve2');
}).then(res => {
  console.log(res)  // resolve1
  setTimeout(() => {
    console.log(p1)
  }, 1000)
}).finally(res => {
  console.log('finally', res)
})
```





## 27. 

```javascript
console.log('1');

setTimeout(function() {
    console.log('2');
    process.nextTick(function() {
        console.log('3');
    })
    new Promise(function(resolve) {
        console.log('4');
        resolve();
    }).then(function() {
        console.log('5')
    })
})
process.nextTick(function() {
    console.log('6');
})
new Promise(function(resolve) {
    console.log('7');
    resolve();
}).then(function() {
    console.log('8')
})

setTimeout(function() {
    console.log('9');
    process.nextTick(function() {
        console.log('10');
    })
    new Promise(function(resolve) {
        console.log('11');
        resolve();
    }).then(function() {
        console.log('12')
    })
})

```





## 28. 

```javascript
console.log(1)

setTimeout(() => {
  console.log(2)
})

new Promise(resolve =>  {
  console.log(3)
  resolve(4)
}).then(d => console.log(d))

setTimeout(() => {
  console.log(5)
  new Promise(resolve =>  {
    resolve(6)
  }).then(d => console.log(d))
})

setTimeout(() => {
  console.log(7)
})

console.log(8);
```





## 29. 

```javascript
console.log(1);
    
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3)
  });
});

new Promise((resolve, reject) => {
  console.log(4)
  resolve(5)
}).then((data) => {
  console.log(data);
})

setTimeout(() => {
  console.log(6);
})

console.log(7);
```





## 30. 

```javascript
Promise.resolve().then(() => {
    console.log('1');
    throw 'Error';
}).then(() => {
    console.log('2');
}).catch(() => {
    console.log('3');
    throw 'Error';
}).then(() => {
    console.log('4');
}).catch(() => {
    console.log('5');
}).then(() => {
    console.log('6');
});
```





## 31.

```javascript
setTimeout(function () {
  console.log(1);
}, 100);

new Promise(function (resolve) {
  console.log(2);
  resolve();
  console.log(3);
}).then(function () {
  console.log(4);
  new Promise((resove, reject) => {
    console.log(5);
    setTimeout(() =>  {
      console.log(6);
    }, 10);
  })
});
console.log(7);
console.log(8);
```







# 二、this



## 1.

```javascript
function foo() {
  console.log( this.a );
}

function doFoo() {
  foo();
}

var obj = {
  a: 1,
  doFoo: doFoo
};

var a = 2; 
obj.doFoo()
```





## 2. 

```javascript
var a = 10
var obj = {
  a: 20,
  say: () => {
    console.log(this.a)
  }
}
obj.say() 

var anotherObj = { a: 30 } 
obj.say.apply(anotherObj) 
```





## 3. 

```javascript
function a() {
  console.log(this);
}
a.call(null);
```





## 4. 

```javascript
var obj = { 
  name : 'cuggz', 
  fun : function(){ 
    console.log(this.name); 
  } 
} 
obj.fun()     // cuggz
new obj.fun() // undefined

```







## 5. 

```javascript
var obj = {
   say: function() {
     var f1 = () =>  {
       console.log("1111", this);
     }
     f1();
   },
   pro: {
     getPro:() =>  {
        console.log(this);
     }
   }
}
var o = obj.say;
o();
obj.say();
obj.pro.getPro();
```





## 6. 

```javascript
var myObject = {
    foo: "bar",
    func: function() {
        var self = this;
        console.log(this.foo);  
        console.log(self.foo);  
        (function() {
            console.log(this.foo);  
            console.log(self.foo);  
        }());
    }
};
myObject.func();
```





## 7. 

```javascript
window.number = 2;
var obj = {
 number: 3,
 db1: (function(){
   console.log(this);
   this.number *= 4;
   return function(){
     console.log(this);
     this.number *= 5;
   }
 })()
}
var db1 = obj.db1;
db1();
obj.db1();
console.log(obj.number);     // 15
console.log(window.number);  // 40
```





## 8. 

```javascript
var length = 10;
function fn() {
    console.log(this.length);
}
 
var obj = {
  length: 5,
  method: function(fn) {
    fn();
    arguments[0]();
  }
};
 
obj.method(fn, 1);
```





## 9. 

```javascript
var a = 1;
function printA(){
  console.log(this.a);
}
var obj={
  a:2,
  foo:printA,
  bar:function(){
    printA();
  }
}

obj.foo(); // 2
obj.bar(); // 1
var foo = obj.foo;
foo(); // 1
```





## 10.

```javascript
var x = 3;
var y = 4;
var obj = {
    x: 1,
    y: 6,
    getX: function() {
        var x = 5;
        return function() {
            return this.x;
        }();
    },
    getY: function() {
        var y = 7;
        return this.y;
    }
}
console.log(obj.getX()) // 3
console.log(obj.getY()) // 6

```





## 11.

```javascript
 var a = 10; 
 var obt = { 
   a: 20, 
   fn: function(){ 
     var a = 30; 
     console.log(this.a)
   } 
 }
 obt.fn();  // 20
 obt.fn.call(); // 10
 (obt.fn)(); // 20

```





## 12.

```javascript
function a(xx){
  this.x = xx;
  return this
};
var x = a(5);
var y = a(6);

console.log(x.x)  // undefined
console.log(y.x)  // 6
```





## 13.

```javascript
function foo(something){
    this.a = something
}

var obj1 = {
    foo: foo
}

var obj2 = {}

obj1.foo(2); 
console.log(obj1.a); // 2

obj1.foo.call(obj2, 3);
console.log(obj2.a); // 3

var bar = new obj1.foo(4)
console.log(obj1.a); // 2
console.log(bar.a); // 4
```





## 14.

```javascript
function foo(something){
    this.a = something
}

var obj1 = {}

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); // 2

var baz = new bar(3);
console.log(obj1.a); // 2
console.log(baz.a); // 3
```







# 三、作用域&变量提升&闭包

## 1. 

```javascript
(function(){
   var x = y = 1;
})();
var z;

console.log(y); // 1
console.log(z); // undefined
console.log(x); // Uncaught ReferenceError: x is not defined
```





## 2. 

```javascript
var a, b
(function () {
   console.log(a);
   console.log(b);
   var a = (b = 3);
   console.log(a);
   console.log(b);   
})()
console.log(a);
console.log(b);
```





## 3. 

```javascript
var friendName = 'World';
(function() {
  if (typeof friendName === 'undefined') {
    var friendName = 'Jack';
    console.log('Goodbye ' + friendName);
  } else {
    console.log('Hello ' + friendName);
  }
})();
```





## 4. 

```javascript
function fn1(){
  console.log('fn1')
}
var fn2
 
fn1()
fn2()
 
fn2 = function() {
  console.log('fn2')
}
 
fn2();
```





## 5. 

```javascript
function a() {
    var temp = 10;
    function b() {
        console.log(temp); // 10
    }
    b();
}
a();

function a() {
    var temp = 10;
    b();
}
function b() {
    console.log(temp); // 报错 Uncaught ReferenceError: temp is not defined
}
a();
```



## 6.

```javascript
 var a=3;
 function c(){
    alert(a);
 }
 (function(){
  var a=4;
  c();
 })();
```



## 7. 

```javascript
function fun(n, o) {
  console.log(o)
  return {
    fun: function(m){
      return fun(m, n);
    }
  };
}
var a = fun(0);  a.fun(1);  a.fun(2);  a.fun(3);
var b = fun(0).fun(1).fun(2).fun(3);
var c = fun(0).fun(1);  c.fun(2);  c.fun(3);
```





## 8. 

```javascript
f = function() {return true;};   
g = function() {return false;};   
(function() {   
   if (g() && [] == ![]) {   
      f = function f() {return false;};   
      function g() {return true;}   
   }   
})();   
console.log(f());
```







# 四、原型&继承



## 1.

```javascript
function Person(name) {
    this.name = name
}
var p2 = new Person('king');
console.log(p2.__proto__) //Person.prototype
console.log(p2.__proto__.__proto__) //Object.prototype
console.log(p2.__proto__.__proto__.__proto__) // null
console.log(p2.__proto__.__proto__.__proto__.__proto__)//null后面没有了，报错
console.log(p2.__proto__.__proto__.__proto__.__proto__.__proto__)//null后面没有了，报错
console.log(p2.constructor)//Person
console.log(p2.prototype)//undefined p2是实例，没有prototype属性
console.log(Person.constructor)//Function 一个空函数
console.log(Person.prototype)//打印出Person.prototype这个对象里所有的方法和属性
console.log(Person.prototype.constructor)//Person
console.log(Person.prototype.__proto__)// Object.prototype
console.log(Person.__proto__) //Function.prototype
console.log(Function.prototype.__proto__)//Object.prototype
console.log(Function.__proto__)//Function.prototype
console.log(Object.__proto__)//Function.prototype
console.log(Object.prototype.__proto__)//null
```





## 2.

```javascript
// a
function Foo () {
 getName = function () {
   console.log(1);
 }
 return this;
}
// b
Foo.getName = function () {
 console.log(2);
}
// c
Foo.prototype.getName = function () {
 console.log(3);
}
// d
var getName = function () {
 console.log(4);
}
// e
function getName () {
 console.log(5);
}

Foo.getName();           // 2
getName();               // 4
Foo().getName();         // 1
getName();               // 1 
new Foo.getName();       // 2
new Foo().getName();     // 3
new new Foo().getName(); // 3
```



## 3.

```javascript
var F = function() {};
Object.prototype.a = function() {
  console.log('a');
};
Function.prototype.b = function() {
  console.log('b');
}
var f = new F();
f.a();
f.b();
F.a();
F.b()
```



## 4.

```javascript
function Foo(){
    Foo.a = function(){
        console.log(1);
    }
    this.a = function(){
        console.log(2)
    }
}

Foo.prototype.a = function(){
    console.log(3);
}

Foo.a = function(){
    console.log(4);
}

Foo.a();
let obj = new Foo();
obj.a();
Foo.a();
```



## 5.

```javascript
function Dog() {
  this.name = 'puppy'
}
Dog.prototype.bark = () => {
  console.log('woof!woof!')
}
const dog = new Dog()
console.log(Dog.prototype.constructor === Dog && dog.constructor === Dog && dog instanceof Dog)
```





## 6.

```javascript
var A = {n: 4399};
var B =  function(){this.n = 9999};
var C =  function(){var n = 8888};
B.prototype = A;
C.prototype = A;
var b = new B();
var c = new C();
A.n++
console.log(b.n);
console.log(c.n);
```





## 7.

```javascript
function A(){
}
function B(a){
　　this.a = a;
}
function C(a){
　　if(a){
this.a = a;
　　}
}
A.prototype.a = 1;
B.prototype.a = 1;
C.prototype.a = 1;
 
console.log(new A().a);
console.log(new B().a);
console.log(new C(2).a);
```



## 8.

```javascript
function Parent() {
    this.a = 1;
    this.b = [1, 2, this.a];
    this.c = { demo: 5 };
    this.show = function () {
        console.log(this.a , this.b , this.c.demo );
    }
}

function Child() {
    this.a = 2;
    this.change = function () {
        this.b.push(this.a);
        this.a = this.b.length;
        this.c.demo = this.a++;
    }
}

Child.prototype = new Parent();
var parent = new Parent();
var child1 = new Child();
var child2 = new Child();
child1.a = 11;
child2.a = 12;
parent.show();
child1.show();
child2.show();
child1.change();
child2.change();
parent.show();
child1.show();
child2.show();
```



## 9.

```javascript
function SuperType(){
    this.property = true;
}

SuperType.prototype.getSuperValue = function(){
    return this.property;
};

function SubType(){
    this.subproperty = false;
}

SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function (){
    return this.subproperty;
};

var instance = new SubType();
console.log(instance.getSuperValue());
```







# 五、运算

## `+`

```javascript
console.log(1 + 1); 
console.log("1" + 1);     
console.log(1 + "1");    
console.log("hello" + 1); 
console.log(1 + "hello"); 
console.log(1 + true);    
console.log(1 + false);  
console.log(1 + null);     
console.log(1 + undefined);
console.log(1 + {});    
console.log(1 + []);   
console.log([] + {});      
console.log({} + []);      
console.log(Infinity + Infinity); 
console.log(-Infinity + (-Infinity)); 
console.log(Infinity + (-Infinity)); 
console.log((+0) + (+0)); 
console.log((-0) + (+0)); 
console.log((-0) + (-0)); 
console.log(1 + NaN); 
console.log(2 + NaN); 
console.log(true + true); 
console.log(2 + null);
console.log(2 + undefined);
console.log(1 + 2 + "blind mice");
console.log(1 + (2 + "blind mice"));
console.log(1 + "2"); 
console.log("1" + 2 + 3);
console.log(1 + 2 + "3"); 
console.log(1 + null); 
console.log(1 + undefined); 
console.log('a' + + 'b');
console.log([] + {}); 
cosnole.log({} + []);
console.log(1 + - + + + - + 1); 

console.log(1 + '1');
console.log(true + true);
console.log(4 + [1,2,3]);


let a = 1;
let b = "2";
let c = a + +b; 
console.log(c); 


var d = "3.14";
var e = 5+ +c;

e; // 8.14
```



## `-`

```javascript
cosnole.log(1 - NaN);
console.log(2 - NaN);
console.log(Infinity - Infinity);
console.log((-Infinity) - (-Infinity)); 
console.log(Infinity - (-Infinity)); 
console.log((-Infinity) - Infinity); 
console.log((+0) - (+0));
console.log((+0) - (-0)); 
console.log((-0) - (-0)); 
console.log(1 - "2");
console.log(5 - true); 
console.log(NaN - 1); 
console.log(5 - ""); 
console.log(5 - "2"); 
console.log(5 - null); 
```





## `*`

```javascript
console.log(1 + 2 * 3);
console.log((1 + 2) * 3); 
console.log(1 * "2");
console.log(2 * NaN); 
console.log(Infinity * 0); 
console.log(Infinity * 2); 
console.log(Infinity * -2);
console.log(Infinity * Infinity);
console.log(Number.MAX_VALUE * 2);
console.log(-Number.MAX_VALUE * 2);

console.log(4 * '3'); 
console.log(4 * []);
console.log(4 * [1, 2]);
```





## `/`

```javascript
console.log(1 / "2"); 
console.log(1 / 0); 
console.log(-1 / 0); 
console.log(0 / 0); 
console.log((-0) / (+0)); 
console.log(Infinity / Infinity);
console.log(Number.MIN_VALUE / 2);
console.log(-Number.MIN_VALUE / 2); 
console.log(-1 / Infinity);
console.log(1 / NaN);
console.log(2 / NaN);
console.log(Infinity / 1); 
console.log(Infinity / -2); 
```



## `%`

```javascript
console.log(-Infinity % 1);
console.log(1 % 0); 
console.log(Infinity % Infinity); 
console.log(1 % -Infinity); 
console.log(0 % 1); 
```









```javascript
'a' + + 'b' // -> "aNaN"
```

- **`'a' + + 'b'  可以分解为 'a' + (+'b')。`** 
- **`首先计算 +'b'。由于 'b' 不是一个数字，JavaScript 尝试将其转换为数字。`** 
- **`Number('b') 的结果是 NaN（Not-a-Number），因为 'b' 无法被解析为一个有效的数字。`** 
- **`现在表达式变为 'a' + NaN`**
- **`当 + 运算符的操作数中有一个是字符串时，JavaScript 会将另一个操作数也转换为字符串，然后进行字符串连接。`** 
- **`String(NaN) 的结果是 "NaN" 。`** 
- **`因此，'a' + NaN 变为 'a' + "NaN"，结果是 "aNaN" 。`** 



**`总结`**

- **`+'b' 尝试将字符串 'b' 转换为数字，结果为 NaN。`** 
- **`'a' + NaN 执行字符串连接，将 NaN 转换为字符串 "NaN" ，最终结果为 "aNaN"。`** 



```javascript
console.log('a' + + 'b'); // "aNaN"

console.log(+'b'); // NaN
console.log(Number('b')); // NaN

console.log('a' + NaN); // "aNaN"
console.log('a' + String(NaN)); // "aNaN"
```





```javascript
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  }
}

a > -1 // true
```

**`在以上代码中，因为 a 是对象，所以会通过 valueOf 转换为原始类型再比较值。`** 



## 总结

<br>

### 加法

* 无穷大加上任何有限数，结果还是无穷大（正或负取决于无穷大的符号）。
* 正无穷大和负无穷大相加，因为无法确定哪个更无穷大，所以结果是 NaN。
* 可以想象成电流的方向，如果两个方向相同（都是正或都是负），则结果保持方向。如果方向相反，则正负抵消，结果为 +0。



### 减法

* 无穷大减去任何有限数，结果还是无穷大（正或负取决于无穷大的符号）。
* 无穷大减去同号的无穷大，结果是 NaN。
* 无穷大减去异号的无穷大，相当于加上一个同号的无穷大。

* 可以想象成电流的方向，如果两个方向相同（都是正或都是负），则结果保持方向。如果方向相反，则正负抵消，结果为 +0。



### 乘法

* 无穷大乘以任何非零数，结果还是无穷大（正或负取决于乘数的符号）。
* 无穷大乘以 0，结果还是 NaN，因为结果不确定。
* 同号得正，异号得负。



### 除法

* 无穷大除以任何非零数，结果还是无穷大（正或负取决于除数的符号）
* 任何有限数除以无穷大，结果是 +0 或  -0（取决于除数的符号）
* 无穷大除以无穷大，结果是 NaN

* 除以零得到无穷大。正数除以 +0 得到正无穷大，正数除以 -0 得到负无穷大，反之亦然
* 零除以零是未定义的，结果为 NaN



### 求余

* 无穷大参与求余运算，结果通常是 NaN
* 任何有限数对无穷大求余，结果是该有限数本身
* 任何数对零求余都为 NaN
* 零对任何非零数求余，结果的符号与被除数（零）的符号相同









# 六、位运算

```javascript
console.log(5 & 3);  
console.log(5 | 3);  
console.log(5 ^ 3);  
console.log(~5);    
console.log(5 << 2); 
console.log(-5 >> 2); 
console.log(-5 >>> 2); 
```







# 七、typeof 

```javascript
typeof 1 
typeof '1' 
typeof undefined 
typeof true 
typeof Symbol()
typeof 1n 

typeof [] 
typeof {}
typeof console.log
```





# 八、instanceof

```javascript
class PrimitiveString {
  static [Symbol.hasInstance](x) {
    return typeof x === 'string'
  }
}
console.log('hello world' instanceof PrimitiveString) // true
```







# 九、isNaN 和 Number.isNaN

**`isNaN：会尝试将参数转换为数值，如果转换失败，则返回 true。如果参数本身就是 NaN，则返回 true。`**

```javascript
isNaN(NaN);
isNaN("hello"); 
isNaN("123"); 
isNaN(123); 
isNaN(undefined); 
isNaN(null);
isNaN({});
```



**`Number.isNaN：不会尝试将参数转换为数值。只有当参数本身就是 NaN 时，才返回 true。`**

```javascript
Number.isNaN(NaN);
Number.isNaN("hello");
Number.isNaN("123"); 
Number.isNaN(123);
Number.isNaN(undefined); 
Number.isNaN(null); 
Number.isNaN({}); 
```







# 十、Object.is()

```javascript
var a = 2 / "foo";
var b = -3 * 0;

Object.is(a, NaN);
Object.is(b, -0); 

Object.is(b, 0);
```







# 十一、显式强制类型转换和隐式强制类型转换

```javascript
console.log(String(undefined));
console.log(String(null));
console.log(String(true));
console.log(String(false));
console.log(String(""));
console.log(String("1.2"));
console.log(String("one"));
console.log(String(0));
console.log(String(-0));
console.log(String(1));
console.log(String(Infinity));
console.log(String(-Infinity));
console.log(String(NaN));
console.log(String({}));
console.log(String([]));
console.log(String([9]));
console.log(String(['a']));
console.log(String([function() {}]));





console.log(Number(undefined));
console.log(Number(null));
console.log(Number(true));
console.log(Number(false));
console.log(Number(""));
console.log(Number("1.2"));
console.log(Number("one"));
console.log(Number(0));
console.log(Number(-0));
console.log(Number(1));
console.log(Number(Infinity));
console.log(Number(-Infinity));
console.log(Number(NaN));
console.log(Number({}));
console.log(Number([]));
console.log(Number([9]));
console.log(Number(['a']));
console.log(Number([function() {}]));




console.log(Boolean(undefined));
console.log(Boolean(null));
console.log(Boolean(true));
console.log(Boolean(false));
console.log(Boolean(""));
console.log(Boolean("1.2"));
console.log(Boolean("one"));
console.log(Boolean(0));
console.log(Boolean(-0));
console.log(Boolean(1));
console.log(Boolean(Infinity));
console.log(Boolean(-Infinity));
console.log(Boolean(NaN));
console.log(Boolean({}));
console.log(Boolean([]));
console.log(Boolean([9]));
console.log(Boolean(['a']));
console.log(Boolean([function() {}]));
```



```javascript
console.log(1 + "1");
console.log(1 - "1");
console.log(1 * "2");
console.log(1 / "2");
console.log(1 == "1");
console.log(1 === "1");
console.log(true + 1);
console.log(false + 1);
console.log(null + 1);
console.log(undefined + 1);
console.log([] == false);
console.log(![]);
console.log({} + 1);
console.log(1 + {});
console.log([] + []);
console.log({} + {});
```





# 十二、== 和 ===



## ==

```javascript
console.log(1 == '1');        
console.log(0 == false);       
console.log('' == false);       
console.log(null == undefined);  
console.log(' \t\r\n' == 0);   
console.log('123' == 123);      
console.log(true == '1');      
console.log(false == '0');     
console.log(false == null);      
console.log(false == undefined);  
console.log(NaN == NaN);        
console.log([] == false);       
console.log(![] == false);       
console.log([0] == false);      
console.log([0] == 0);          
console.log([''] == false);     
console.log([''] == 0);        
console.log({} == false);       
console.log({} == '[object Object]');


"0" == null; 
"0" == undefined; 
"0" == false; 
"0" == NaN; 
"0" == 0; 
"0" == ""; 



false == null; 
false == undefined; 
false == NaN; 
false == 0;
false == "";
false == [];
false == {};



"" == null;
"" == undefined;
"" == NaN; 
"" == 0; 
"" == [];
"" == {}; 


0 == null;
0 == undefined; 
0 == NaN; 
0 == [];
0 == {};
[] == ![];
0 == 0n;
```





## ===

```javascript
console.log(1 === '1');        
console.log(0 === false);      
console.log('' === false);       
console.log(null === undefined); 
console.log(NaN === NaN);      
console.log([] === false);      
console.log({} === false);       
console.log(0 === null);         
console.log(0 === undefined);    
console.log(null === null);      
console.log(undefined === undefined); 
console.log(0 === 0n);



console.log(NaN === NaN); 
console.log(NaN !== NaN);

let x = NaN;
console.log(x !== x);   
```









# 十三、map

```javascript
['1','2','3'].map(parseInt)
```

- **`第一轮遍历 parseInt('1', 0) // 1`** 
- **`第二轮遍历 parseInt('2', 1) // NaN`** 
- **`第三轮遍历 parseInt('3', 2) // NaN`** 





# 十四、parseInt、parseFloat

**`parseInt()、parseFloat 和 Number.parseInt()、Number.parseFloat() 功能基本相同`**

```javascript
parseInt("3 blind mice");
parseInt("-12.34"); 
parseInt("0xFF"); 
parseInt("0xff"); 
parseInt("-0xFF");
parseInt("0.1"); 
parseInt(".1");
parseInt("11", 2); 
parseInt("ff", 16);
parseInt("zz", 36);
parseInt("077", 8);
parseInt("077", 10);
console.log(parseInt("10.5"));
console.log(parseInt("hello"));
```



```javascript
parseFloat(" 3.14 meters");
parseFloat(".1");
parseFloat("$72.47");
console.log(parseFloat("10.5"));
console.log(parseFloat("world"));
```





# 十五、对象到原始值转换

```javascript
({ x: 1, y: 2 }).toString();
```



```javascript
let obj = {
    name: "Jane Doe",
    score: 99,
    toString() {
        return `Your name: ${this.name}`;
    },
    valueOf() {
        return this.score;
    }
};

console.log(obj - 5);
console.log(obj + 3); 
console.log(obj + " points"); 
```



```javascript
const obj = {
  valueOf() {
    return "42"; 
  }
};

const num = Number(obj); 
console.log(num); 

const obj2 = {
  valueOf() {
    return {}; 
  },
  toString() {
    return "10"; 
  }
};

const num2 = Number(obj2);
console.log(num2); 

const obj3 = {
  valueOf() {
    return {}; 
  },
  toString() {
    return {}; 
  }
};

try {
  const num3 = Number(obj3); 
  console.log(num3);
} catch (e) {
  console.log(e); 
}
```





# 十六、布尔操作符

```javascript
console.log(!false);
console.log(!"blue");
console.log(!0);
console.log(!NaN);
console.log(!"");
console.log(!12345);
console.log(!undefined);
console.log(!null);
console.log(!(-0));
```





# 十七、关系操作符

```javascript
console.log("Brick" < "alphabet");
console.log("23" < "3");
console.log("23" < 3); 
console.log("a" < 3);
console.log(NaN < 3);
console.log(NaN >= 3);
```





# 十八、一元操作符

```javascript
let s1 = "2";
let s2 = "z";
let b = false;
let f = 1.1;
let o = {
    valueOf() {
        return -1;
    }
};

s1++;
s2++;
b++;
f--;
o--;
```



**`一元加`**

```javascript
let num = 25;
num = +num; 
console.log(num); // 25

let s1 = "01";
let s2 = "1.1";
let s3 = "z";
let b = false;
let f = 1.1;
let o = {
    valueOf() {
        return -1;
    }
};

s1 = +s1;
s2 = +s2;
s3 = +s3;
b = +b;
f = +f;
o = +o;
```



**`一元减`**

```javascript
let num = 25;
num = -num;
console.log(num); // -25

let s1 = "01";
let s2 = "1.1";
let s3 = "z";
let b = false;
let f = 1.1;
let o = {
    valueOf() {
        return -1;
    }
};

s1 = -s1;
s2 = -s2;
s3 = -s3;
b = -b;
f = -f;
o = -o;
```







# 十九、比较操作符

```javascript
console.log(11 < 3);
console.log("11" < "3");
console.log("11" < 3);
console.log("one" < 3);
```







# 二十、44 道 JavaScript



## 1. parseInt 遇上 map 

```javascript
["1", "2", "3"].map(parseInt)

// A. ["1", "2", "3"]
// B. [1, 2, 3]
// C. [0, 1, 2]
// D. other
```





## 2. 神奇的 null

```javascript
[typeof null, null instanceof Object]

// A. ["object", false]
// B. [null, false]
// C. ["object", true]
// D. other
```







## 3. 愤怒的 reduce

```javascript
[ [3,2,1].reduce(Math.pow), [].reduce(Math.pow) ]

// A. an error
// B. [9, 0]
// C. [9, NaN]
// D. [9, undefined]
```







## 4. 该死的优先级

```javascript
var val = 'smtg';
console.log('Value is ' + (val === 'smtg') ? 'Something' : 'Nothing');

// A. Value is Something
// B. Value is Nothing
// C. NaN
// D. other
```







## 5. 神鬼莫测之变量提升

```javascript
var name = 'World!';
(function () {
    if (typeof name === 'undefined') {
      var name = 'Jack';
      console.log('Goodbye ' + name);
    } else {
      console.log('Hello ' + name);
    }
})();

// A. Goodbye Jack
// B. Hello Jack
// C. Hello undefined
// D. Hello World
```





## 6. 死循环陷阱

```javascript
var END = Math.pow(2, 53);
var START = END - 100;
var count = 0;
for (var i = START; i <= END; i++) { 
  count++;
}
console.log(count);

// A. 0
// B. 100
// C. 101
// D. other
```





## 7. 过滤器魔法

```javascript
var ary = [0,1,2];
ary[10] = 10;
ary.filter(function(x) {
  return x === undefined;
});

// A. [undefined x 7]
// B. [0, 1, 2, 10]
// C. []
// D. [undefined]
```





## 8. 警惕 IEEE 754 标准

```javascript
var two = 0.2;
var one = 0.1;
var eight = 0.8;
var six = 0.6;
[two - one == one, eight - six == two]

// A. [true, false]
// B. [false, false]
// C. [true, false]
// D. other
```







## 9. 字符串陷阱

```javascript
function showCase(value) {
  switch(value) {
    case 'A':
      console.log('Case A');
      break;
    case 'B':
      console.log('Case B');
      break;
    case undefined:
      console.log('undefined');
      break;
    default:
      console.log('Do not know!');
  }
}
showCase(new String('A'));

// A. Case A
// B. Case B
// C. Do not know!
// D. undefined
```







## 10. 再一次的字符串陷阱

```javascript
function showCase(value) {
  switch(value) {
    case 'A':
      console.log('Case A');
      break;
    case 'B':
      console.log('Case B');
      break;
    case undefined:
      console.log('undefined');
      break;
    default:
      console.log('Do not know!');
  }
}
showCase(String('A'));

// A. Case A
// B. Case B
// C. Do not know!
// D. undefined
```





## 11. 并非都是奇偶

```javascript
function isOdd(num) {
  return num % 2 == 1;
}

function isEven(num) {
  return num % 2 == 0;
}

function isSane(num) {
  return isEven(num) || isOdd(num);
}

var values = [7, 4, "13", -9, Infinity];
values.map(isSane);

// A. [true, true, true, true, true]
// B. [true, true, true, true, false]
// C. [true, true, true, false, false]
// D. [true, true, false, false, false]
```





## 12. parseInt 小贼

```javascript
parseInt(3, 8);
parseInt(3, 2);
parseInt(3, 0);

// A. 3, 3, 3
// B. 3, 3, NaN
// C. 3, NaN, NaN
// D. other
```







## 13. 数组原型是数组

```javascript
Array.isArray( Array.prototype )

// A. true
// B. false
// C. error
// D. other
```







## 14. 一言难尽的强制转换

```javascript
var a = [0];
if ([0]) {
  console.log(a == true);
} else {
  console.log("wut");
}

// A. true
// B. false
// C. "wut"
// D. other
```





## 15. 撒旦之子 "=="

```javascript
[]==[]

// A. true
// B. false
// C. error
// D. other
```







## 16. 加号 VS 减号

```javascript
'5' + 3;
'5' - 3;

// A. "53", 2
// B. 8, 2
// C. error
// D. other
```





## 17. 打死那个疯子

```javascript
1 + - + + + - + 1

// A. 2
// B. 1
// C. error
// D. other
```







## 18. 淘气的 map

```javascript
var ary = Array(3);
ary[0] = 2;
ary.map(function(elem) {
  return "1";
});

// A. [2, 1, 1]
// B. ["1", "1", "1"]
// C. [2, "1", "1"]
// D. other
```





## 19. 统统算我的

```javascript
function sidEffecting(ary) {
  ary[0] = ary[2];
}

function bar(a, b, c) {
  c = 10;
  sidEffecting(arguments);
  return a + b + c;
}

bar(1, 1, 1);

// A. 3
// B. 12
// C. error
// D. other
```





## 20. 损失精度的 IEEE 754

```javascript
var a = 111111111111111110000;
var b = 1111;
console.log(a + b);

// A. 111111111111111111111
// B. 111111111111111110000
// C. NaN
// D. Infinity
```





## 21. 反转世界

```javascript
var x = [].reverse;
x();

// A. []
// B. undefined
// C. error
// D. window
```







## 22. 最小的正值

```javascript
Number.MIN_VALUE > 0

// A. false
// B. true
// C. error
// D. other
```







## 23. 谨记优先级

```javascript
[1 < 2 < 3, 3 < 2 < 1]

// A. [true, true]
// B. [true, false]
// C. error
// D. other
```







## 24. 坑爹中的战斗机

```javascript
// the most classic wtf
2 == [[[2]]]

// A. true
// B. false
// C. undefined
// D. other
```







## 25. 小数点魔术

```javascript
3.toString();
3..toString();
3...toString();

// A. "3", error, error
// B. "3", "3.0", error
// C. error, "3", error
// D. other
```







## 26. 自动提升为全局变量

```javascript
(function() {
  var x = y = 1;
})();
console.log(y);
console.log(x);

// A. 1, 1
// B. error, error
// C. 1, error
// D. other
```







## 27. 正则表达式实例

```javascript
var a = /123/;
var b = /123/;
a == b;
a === b;

// A. true, true
// B. true, false
// C. false, false
// D. other
```







## 28. 数组也爱比大小

```javascript
var a = [1, 2, 3];
var b = [1, 2, 3];
var c = [1, 2, 4];

a == b;
a === b;
a > c;
a < c;

// A. false, false, false, true
// B. false, false, false, false
// C. true, true, false, true
// D. other
```







## 29. 原型把戏

```javascript
var a = {};
var b = Object.prototype;

[a.prototype === b, Object.getPrototypeOf(a) == b]

// A. [false, true]
// B. [true, true]
// C. [false, false]
// D. other
```







## 30. 构造函数的函数

```javascript
function f() {}
var a = f.prototype;
var b = Object.getPrototypeOf(f);
a === b;

// A. true
// B. false
// C. null
// D. other
```







## 31. 禁止修改函数名

```javascript
function foo() {}
var oldName = foo.name;
foo.name = "bar";
[oldName, foo.name];

// A. error
// B. ["", ""]
// C. ["foo", "foo"]
// D. ["foo", "bar"]
```







## 32. 替换陷阱

```javascript
"1 2 3".replace(/\d/g, parseInt);

// A. "1 2 3"
// B. "0 1 2"
// C. "NaN 2 3"
// D. "1 NaN 3"
```







## 33. Function 的名字

```javascript
function f() {}
var parent = Object.getPrototypeOf(f);
console.log(f.name);
console.log(parent.name);
console.log(typeof eval(f.name));
console.log(typeof eval(parent.name));

// A. "f", "Empty", "function", "function"
// B. "f", undefined, "function", error
// C. "f", "Empty", "function", error
// D. other
```







## 34. 正则测试陷阱

```javascript
var lowerCaseOnly = /^[a-z]+$/;
[lowerCaseOnly.test(null), lowerCaseOnly.test()]

// A. [true, false]
// B. error
// C. [true, true]
// D. [false, true]
```







## 35. 逗号定义数组

```javascript
[,,,].join(", ")

// A. ", , , "
// B. "undefined, undefined, undefined, undefined"
// C. ", , "
// D. ""
```







## 36. 保留字 class

```javascript
var a = {class: "Animal", name: "Fido"};
console.log(a.class);

// A. "Animal"
// B. Object
// C. an error
// D. other
```







## 37. 无效日期

``` javascript
var a = new Date("epoch");

// A. Thu Jan 01 1970 01:00:00 GMT+0100(CET)
// B. current time
// C. error
// D. other
```







## 38. 神鬼莫测的函数长度

```javascript
var a = Function.length;
var b = new Function().length;
console.log(a === b);

// A. true
// B. false
// C. error
// D. other
```







## 39. Date 的面具

```javascript
var a = Date(0);
var b = new Date(0);
var c = new Date();
[a === b, b === c, a === c];

// A. [true, true, true]
// B. [false, false, false]
// C. [false, true, false]
// D. [true, false, false]
```









## 40. min 与 max 共舞

```javascript
var min = Math.min();
var max = Math.max();
console.log(min < max);

// A. true
// B. false
// C. error
// D. other
```









## 41. 警惕全局匹配

```javascript
function captureOne(re, str) {
  var match = re.exec(str);
  return match && match[1];
}

var numRe = /num=(\d+)/ig,
      wordRe = /word=(\w+)/i,
      a1 = captureOne(numRe, "num=1"),
      a2 = captureOne(wordRe, "word=1"),
      a3 = captureOne(numRe, "NUM=1"),
      a4 = captureOne(wordRe, "WORD=1");

[a1 === a2, a3 === a4]

// A. [true, true]
// B. [false, false]
// C. [true, false]
// D. [false, true]
```









## 42. 最熟悉的陌生人

```javascript
var a = new Date("2014-03-19");
var b = new Date(2014, 03, 19);
[a.getDay() == b.getDay(), a.getMonth() == b.getMonth()]

// A. [true, true]
// B. [true, false]
// C. [false, true]
// D. [false, false]
```











## 43. 匹配隐式转换

```javascript
if("http://giftwrapped.com/picture.jpg".match(".gif")) {
  console.log("a gif file");
} else {
  console.log("not a gif file");
}

// A. "a gif file"
// B. "not a gif file"
// C. error
// D. other
```









## 44. 重复声明变量

```javascript
function foo(a) {
  var a;
  return a;
}

function bar(a) {
  var a = "bye";
  return a;
}

[foo("hello"), bar("hello")]

// A. ["hello", "hello"]
// B. ["hello", "bye"]
// C. ["bye", "bye"]
// D. other
```

<br>

# 二十一、原码、反码、补码



## 1. 加法

**`JavaScript 在进行加法运算时，底层使用的是补码进行计算。`**

```javascript
let a = 5;  // 00000000000000000000000000000101
let b = -3; // 11111111111111111111111111111101 (补码)

let sum = a + b;
console.log(sum); // 输出 2
```

<br>

## 2. 数字的原码、反码和补码

```javascript
+0 +5 -0 -28
```

<br>



# 二十二、UTF-8、UTF-16、UTF-32、Unicode

```javascript
\u{1FA00}
\u{1FA42}
\u{1F615}
\u{10193}
H  unicode: 00000000 01001000
e  unicode: 00000000 01100101
l  unicode: 00000000 01101100
o  unicode: 00000000 01101111
算 unicode: 01111011 10010111
法 unicode: 01101100 11010101
```



# 二十三、面试鸭

## 异步

```javascript
const myPromise = new Promise((resolve, reject) => {
  console.log('A');
  console.log('B');
});

myPromise.then(() => {
  console.log('C');
});

console.log('D');
```

<br>

```javascript
const newPromise1 = new Promise((resolve, reject) => {
  console.log('A');
  resolve('B');
});
const newPromise2 = newPromise1.then(res => {
  console.log(res);
});
console.log('C', newPromise1);
console.log('D', newPromise2);
```

<br>

```javascript
const newPromise = new Promise((resolve, reject) => {
  console.log('A');
  setTimeout(() => {
    console.log("timer start");
    resolve("succeed");
    console.log("timer end");
  }, 0);
  console.log('B');
});
newPromise.then((result) => {
  console.log(result);
});
console.log('C');
```

<br>

```javascript
const newPromise = new Promise((resolve, reject) => {
  console.log('A');
  setTimeout(() => {
    console.log("timer start");
    resolve("succeed");
    console.log("timer end");
  }, 0);
  console.log('B');
});
newPromise.then((result) => {
  console.log(result);
});
console.log('C');
```

<br>

```javascript
Promise.resolve().then(() => {
  console.log('outerPromise');
  const innerTimer = setTimeout(() => {
    console.log('innerTimer')
  }, 0)
});

const timer1 = setTimeout(() => {
  console.log('outerTimer')
  Promise.resolve().then(() => {
    console.log('innerPromise')
  })
}, 0)
console.log('run');
```

<br>

```javascript
Promise.resolve().then(() => {
  console.log('outerPromise');
  const innerTimer = setTimeout(() => {
    console.log('innerTimer')
  }, 0)
});

const timer1 = setTimeout(() => {
  console.log('outerTimer')
  Promise.resolve().then(() => {
    console.log('innerPromise')
  })
}, 0)
console.log('run');
```

<br>

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('succeed1');
  reject('error');
  resolve('succeed2');
});
promise.then((res) => {
  console.log('then: ', res);
}).catch((err) => {
  console.log('catch: ', err);
})
```

<br>

```javascript
Promise.resolve('A')
  .then('B')
  .then(Promise.resolve('C'))
  .then(console.log)
```

<br>

```javascript
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error')
})
console.log('promise1', promise1)
console.log('promise2', promise2)
setTimeout(() => {
  console.log('innerPromise1', promise1)
  console.log('innerPromise2', promise2)
}, 2000)
```

<br>

```javascript
Promise.resolve('A')
  .then(res => {
    console.log(res);
    return 'B';
  })
  .catch(err => {
    return 'C';
  })
  .then(res => {
    console.log(res);
  });
```

<br>

```javascript
Promise.resolve().then(() => {
  return new Error('error')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})
```

<br>

```javascript
const promise = Promise.resolve().then(() => {
  return promise;
})
promise.catch(console.err)
```

<br>

```javascript
Promise.resolve('A')
  .then('B')
  .then(Promise.resolve('C'))
  .then(console.log)
```

<br>

```javascript
Promise.reject('error')
  .then((res) => {
    console.log('succeed', res)
  }, (err) => {
    console.log('innerError', err)
  }).catch(err => {
    console.log('catch', err)
  })
```

<br>

```javascript
Promise.resolve('A')
  .then(res => {
    console.log('promise1', res)
  })
  .finally(() => {
    console.log('finally1')
  })
Promise.resolve('B')
  .finally(() => {
    console.log('finally2')
    return 'result'
  })
  .then(res => {
    console.log('promise2', res)
  })
```

<br>

```javascript
function runAsync(num) {
  return new Promise(
    r => setTimeout(
      () => r(num, console.log(num)
      ), 1000)
  )
}

Promise.all([runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log(res));
```

<br>

```javascript
function runAsync(num) {
  return new Promise((resolve) => setTimeout(
    () => resolve(num, console.log(num)), 1000)
  );
}

function runReject(num) {
  return new Promise((resolve, reject) => setTimeout(
    () => reject(`Error: ${num}`, console.log(num)), 1000 * num)
  );
}

Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
```

<br>

```javascript
function runAsync(num) {
  return new Promise(
    (resolve) => setTimeout(
      () => resolve(num, console.log(num)), 1000
    )
  );
}

Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log('res: ', res))
  .catch((err) => console.log(err));
```

<br>

```javascript
function runAsync(num) {
  return new Promise(
    (resolve) => setTimeout(() => resolve(num, console.log(num)), 1000)
  );
}

function runReject(num) {
  return new Promise(
    (resolve, reject) =>
    setTimeout(() => reject(`Error: ${num}`, console.log(num)), 1000 * num),
  );
}

Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log('res: ', res))
  .catch((err) => console.log(err));
```

<br>

```javascript
async function runAsync() {
  console.log("runAsync start");
  await asyncFunc();
  console.log("runAsync end");
}

async function asyncFunc() {
  console.log("do something");
}

runAsync();
console.log('start')
```

<br>

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('async1 timer')
  }, 0)
}

async function async2() {
  console.log("async2 start");
  setTimeout(() => {
    console.log('async2 timer')
  }, 0)
  console.log("async2 end");
}

async1();
setTimeout(() => {
  console.log('outer timer')
}, 0)
console.log("run")
```

<br>

```javascript
async function runAsync () {
  console.log('async start');
  await new Promise(resolve => {
    console.log('promise')
  })
  console.log('async end');
  return 'async result'
}
console.log('main start')
runAsync().then(res => console.log(res))
console.log('main end')
```

<br>

```javascript
async function runAsync () {
  console.log('async start');
  await new Promise(resolve => {
    console.log('promise')
    resolve('promise resolve')
  }).then(res => console.log(res))
  console.log('async end');
  return 'async result'
}
console.log('main start')
runAsync().then(res => console.log(res))
console.log('main end')
```

<br>

```javascript
async function runAsync() {
  console.log("async start");
  await asyncFunc();
  console.log("async end");
}

async function asyncFunc() {
  console.log("do something");
}

console.log("main start");
setTimeout(function() {
  console.log("timer");
}, 0);
runAsync();
new Promise(resolve => {
  console.log("promise");
  resolve();
}).then(function() {
  console.log("promise then");
});
console.log('main end')
```

<br>

```javascript
async function runAsync () {
  await promiseFunc();
  console.log('async');
  return 'async result'
}

async function promiseFunc () {
  return new Promise((resolve, reject) => {
    console.log('promise')
    reject('error')
  })
}

runAsync().then(res => console.log(res))
```

<br>

```javascript
const promiseWrapper = () =>
  new Promise((resolve, reject) => {
    console.log('A');
    let p = new Promise((resolve, reject) => {
      console.log('B');
      setTimeout(() => {
        console.log('timer start');
        resolve('timer succeed');
        console.log('timer end');
      }, 0);
      resolve('inner succeed');
    });
    resolve('outer succeed');
    p.then((res) => {
      console.log(res);
    });
  });

promiseWrapper().then((res) => {
  console.log(res);
});
console.log(4);
```

<br>

```javascript
const runAsync = async () => {
  console.log('async start');
  setTimeout(() => {
    console.log('inner timer');
  }, 2000);
  await new Promise((resolve) => {
    console.log('promise');
  });
  console.log('async end');
  return 'async result';
};

console.log('main start');
runAsync().then((res) => console.log(res));
console.log('main end');
Promise.resolve('A')
  .then('then')
  .then(Promise.resolve('succeed'))
  .catch('catch')
  .then((res) => console.log(res));
setTimeout(() => {
  console.log('outer timer');
}, 1000);
```

<br>

```javascript
const myPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve('succeed3');
    console.log('timer')
  }, 0)
  resolve('succeed1');
  resolve('succeed2');
}).then(res => {
  console.log(res)
  setTimeout(() => {
    console.log(myPromise)
  }, 1000)
}).finally(res => {
  console.log('finally', res)
})
```

<br>

```javascript
console.log('main start');

setTimeout(function() {
  console.log('timer1');
  process.nextTick(function() {
    console.log('inner nextTick1');
  })
  new Promise(function(resolve) {
    console.log('inner promise1');
    resolve();
  }).then(function() {
    console.log('inner then1')
  })
})

process.nextTick(function() {
  console.log('nextTick');
})
new Promise(function(resolve) {
  console.log('promise');
  resolve();
}).then(function() {
  console.log('then')
})

setTimeout(function() {
  console.log('timer2');
  process.nextTick(function() {
    console.log('inner nextTick2');
  })
  new Promise(function(resolve) {
    console.log('inner promise2');
    resolve();
  }).then(function() {
    console.log('inner then2')
  })
})
```

<br>

```javascript
console.log('main start');
setTimeout(() => {
  console.log('timer1');
});

new Promise((resolve) => {
  console.log('promise');
  resolve('promise succeed');
}).then((res) => console.log(res));

setTimeout(() => {
  console.log('timer');
  new Promise((resolve) => {
    resolve('timer succeed');
  }).then((res) => console.log(res));
});

setTimeout(() => {
  console.log('timer2');
});
console.log('main end');
```

<br>

```javascript
console.log('main start');
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => {
    console.log('inner then');
  });
});

new Promise((resolve, reject) => {
  console.log('promise');
  resolve('succeed');
}).then((data) => {
  console.log('then');
});

setTimeout(() => {
  console.log('timer2');
});
console.log('main end');
```

<br>

```javascript
Promise.resolve()
  .then(() => {
    console.log('then1');
    throw 'error';
  })
  .then(() => {
    console.log('then2');
  })
  .catch(() => {
    console.log('catch1');
    throw 'error';
  })
  .then(() => {
    console.log('then3');
  })
  .catch(() => {
    console.log('catch2');
  })
  .then(() => {
    console.log('then4');
  });
```

<br>

```javascript
console.log('main start');
setTimeout(function () {
  console.log('timer');
}, 100);
new Promise(function (resolve) {
  console.log('promise start');
  resolve();
  console.log('promise end');
}).then(function () {
  console.log('then start');
  new Promise((resolve, reject) => {
    console.log('inner promise');
    setTimeout(() => {
      console.log('inner timer');
    }, 10);
  });
});
console.log('main end');
```

<br>

## this

```javascript
function test() {
  console.log(this.num);
}

function doTest() {
  test();
}

var obj = {
  num: 1,
  doTest: doTest,
};

var num = 2;
obj.doTest();
```

<br>

```javascript
var num = 10
var obj1 = {
  num: 20,
  print: () => {
    console.log(this.num)
  }
}
obj1.print()

var obj2 = { num: 30 }
obj1.print.apply(obj2)
```

<br>

```javascript
function test() {
  console.log(this);
}
test.call(null);
```

<br>

```javascript
var obj = { 
  user: 'yupi', 
  print: function(){ 
    console.log(this.user); 
  } 
} 
obj.print()
new obj.print()
```

<br>

```javascript
var obj = {
  print: function() {
    var test = () =>  {
      console.log("yupi", this);
    }
    test();
  },
  rap: {
    doRap:() =>  {
      console.log(this);
    }
  }
}
var copyPrint = obj.print;
copyPrint();
obj.print();
obj.rap.doRap();
```

<br>

```javascript
var obj = {
  name: "yupi",
  func: function() {
    var self = this;
    console.log(this.name);
    console.log(self.name);
    (function() {
      console.log(this.name);
      console.log(self.name);
    }());
  }
};
obj.func();
```

<br>

```javascript
window.num = 2;
var obj = {
    num: 4,
    test: (function(){
        console.log(this);
        this.num *= 6;
        return function(){
            console.log(this);
            this.num *= 8;
        }
    })()
}
var test = obj.test;
test();
obj.test();
console.log(obj.num);
console.log(window.num);
```

<br>

```javascript
var length = 10;
function func() {
  console.log(this.length);
}

var obj = {
  length: 5,
  test: function(func) {
    func();
    arguments[0]();
  }
};
obj.test(func, 1);
```

<br>

```javascript
var num = 2;
function print() {
  console.log(this.num);
}

var obj = {
  num: 4,
  test1: print,
  test2: function () {
    print();
  },
};
obj.test1();
obj.test2();
var foo = obj.test1;
foo();
```

<br>

```javascript
var a = 1;
var b = 2;
var obj = {
  a: 3,
  b: 4,
  getA: function () {
    var a = 5;
    return (function () {
      return this.a;
    })();
  },
  getB: function () {
    var b = 6;
    return this.b;
  },
};
console.log(obj.getA());
console.log(obj.getB());
```

<br>

```javascript
var num = 1;
var obj = {
  num: 2,
  func: function(){
    var num = 3;
    console.log(this.num);
  }
}
obj.func();
obj.func.call();
(obj.func)();
```

<br>

```javascript
function test(num){
  this.value = num;
  return this;
}
var value = test(5);
var obj = test(6);

console.log(value.value);
console.log(obj.value);
```

<br>

```javascript
function test(value) {
  this.num = value;
}

var obj1 = {
  test: test,
};
obj1.test(1);
console.log(obj1.num);

var obj2 = {};
obj1.test.call(obj2, 2);
console.log(obj2.num);

var foo = new obj1.test(3);
console.log(obj1.num);
console.log(foo.num);
```

<br>

```javascript
function test(value){
  this.num = value;
}

var obj1 = {};
var testBind = test.bind(obj1);
testBind(1);
console.log(obj1.num);

var foo = new testBind(2);
console.log(obj1.num);
console.log(foo.num);
```

<br>

## 闭包

```javascript
(function(){
  var a = b = 1;
})();
var c;

console.log(b);
console.log(c);
console.log(a);
```

<br>

```javascript
var foo, bar;
(function () {
  console.log(foo);
  console.log(bar);
  var foo = (bar = 1);
  console.log(foo);
  console.log(bar);
})()
console.log(foo);
console.log(bar);
```

<br>

```javascript
var name = 'mianshiya';
(function() {
  if (typeof name === 'undefined') {
    var name = 'yupi';
    console.log('cool ' + name);
  } else {
    console.log('swag ' + name);
  }
})();
```

<br>

```javascript
function foo(){
  console.log('foo');
}
var bar;
foo();
bar();
bar = function() {
  console.log('bar');
}
```

<br>

```javascript
function foo() {
  var num = 1;
  function bar() {
    console.log(num);
  }
  bar();
}
foo();

function func1() {
  var value = 1;
  func2();
}
function func2() {
  console.log(value);
}
func1();
```

<br>

```javascript
var num = 1;
function func() {
  console.log(num);
}

(function () {
  var num = 2;
  func();
})();
```

<br>

```javascript
function chain(a, b) {
  console.log(b);
  return {
    chain: function (c) {
      return chain(c, a);
    },
  };
}

var a = chain(0);
a.chain(1);
a.chain(2);
a.chain(3);
var b = chain(0).chain(1).chain(2).chain(3);
var c = chain(0).chain(1);
c.chain(2);
c.chain(3);
```

<br>

```javascript
console.log(Function.prototype.__proto__);
console.log(Function.__proto__);
console.log(Object.__proto__);
console.log(Object.prototype.__proto__);
```

<br>

## 原型

```javascript
function Post(title) {
  this.title = title;
}

console.log(Post.constructor);
console.log(Post.prototype);
console.log(Post.prototype.constructor);
console.log(Post.prototype.__proto__);
console.log(Post.__proto__);

var post = new Post('mianshiya');
console.log(post.constructor);
console.log(post.prototype);
console.log(post.__proto__);
console.log(post.__proto__.__proto__);
console.log(post.__proto__.__proto__.__proto__);
console.log(post.__proto__.__proto__.__proto__.__proto__);
console.log(post.__proto__.__proto__.__proto__.__proto__.__proto__);
```

<br>

```javascript
function FuncObj() {
  print = function () {
    console.log(1);
  };
  return this;
}

FuncObj.print = function () {
  console.log(2);
};

FuncObj.prototype.print = function () {
  console.log(3);
};

var print = function () {
  console.log(4);
};

function print() {
  console.log(5);
}

FuncObj.print();
print();
FuncObj().print();
print();
new FuncObj.print();
new FuncObj().print();
new new FuncObj().print();
```

<br>

```javascript
var FuncObj = function () {};
Object.prototype.foo = function () {
  console.log('foo');
};
Function.prototype.bar = function () {
  console.log('bar');
};
FuncObj.foo();
FuncObj.bar();

var f = new FuncObj();
f.foo();
f.bar();
```

<br>

```javascript
function FuncObj(){
  FuncObj.func = function(){
    console.log('A');
  }
  this.func = function(){
    console.log('B')
  }
}

FuncObj.prototype.func = function(){
  console.log('C');
}

FuncObj.func = function(){
  console.log('D');
}

FuncObj.func();
let obj = new FuncObj();
obj.func();
FuncObj.func();
```

<br>

```javascript
function CoolBoy() {
  this.name = 'yupi';
}

CoolBoy.prototype.rap = () => {
  console.log('i am a rapper');
};
const boy = new CoolBoy();
console.log(
  CoolBoy.prototype.constructor === CoolBoy &&
    boy.constructor === CoolBoy &&
    boy instanceof CoolBoy,
);
```

<br>

```javascript
var Obj1 = { value: 10 };
var Obj2 = function () {
  this.value = 20;
};
var Obj3 = function () {
  var value = 30;
};
Obj2.prototype = Obj1;
Obj3.prototype = Obj1;
var b = new Obj2();
var c = new Obj3();
Obj1.value++;
console.log(b.value);
console.log(c.value);
```

<br>

```javascript
function Obj1() {}
function Obj2(value) {
  this.value = value;
}
function Obj3(value) {
  if (value) {
    this.value = value;
  }
}

Obj1.prototype.value = 1;
Obj2.prototype.value = 1;
Obj3.prototype.value = 1;

console.log(new Obj1().value);
console.log(new Obj2().value);
console.log(new Obj3(666).value);
```

<br>

```javascript
function Father() {
  this.a = 1;
  this.b = [1, 2, this.a];
  this.c = { field: 5 };
  this.print = function () {
    console.log(this.a, this.b, this.c.field);
  };
}

function Son() {
  this.a = 2;
  this.update = function () {
    this.b.push(this.a);
    this.a = this.b.length;
    this.c.field = this.a++;
  };
}

Son.prototype = new Father();
var father = new Father();
var son1 = new Son();
var son2 = new Son();
son1.a = 11;
son2.a = 12;
father.print();
son1.print();
son2.print();
son1.update();
son2.update();
father.print();
son1.print();
son2.print();
```

<br>

```javascript
function Father(){
  this.value = true;
}
Father.prototype.getValue = function(){
  return this.value;
};

function Son(){
  this.subValue = false;
}
Son.prototype = new Father();
Son.prototype.getSubValue = function () {
  return this.subValue;
};

var son = new Son();
console.log(son.getValue());
```









