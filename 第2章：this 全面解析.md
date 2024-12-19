<h3 id="lZCW3">绑定规则</h3>
+ 默认绑定

```javascript
function foo() {
  console.log(this.a);
}

var a = 2;

foo(); // 2
```



1. 如果使用严格模式，则不能将全局对象用于默认绑定，因此 this 会绑定到 undefined。

```javascript
function foo() {
  "use strict";

  console.log(this.a);
}

var a = 2;

foo(); // TypeError: this is undefined
```



2. 在严格模式下调用 foo() 则不影响默认绑定。

```javascript
function foo() {
  console.log(this.a);
}

var a = 2;

(function(){
  "use strict";

  foo(); // 2
})();
```



+ 隐式绑定：当函数有引用上下文对象时，隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象。

```javascript
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

obj.foo(); // 2
```



1. 对象属性引用链中只有上一层或者说最后一层在调用位置中起作用。

```javascript
function foo() {
  console.log(this.a);
}

var obj2 = {
  a: 42,
  foo: foo
};

var obj1 = {
  a: 2,
  obj2: obj2
};

obj1.obj2.foo(); // 42
```



2. 隐式丢失

```javascript
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo;

var a = "oops, global";

bar(); // "oops, global"
```

总结：bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的 bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。



```javascript
function foo() {
  console.log(this.a);
}

function doFoo(fn) {
  fn();
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global";

doFoo(obj.foo); // "oops, global"
```

总结：参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值。



```javascript
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global";

setTimeout(obj.foo, 100); // "oops, global"
```

总结：把函数传入语言内置的函数而不是传入你自己声明的函数，结果是一样的。



+ 显式绑定

```javascript
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2
};

foo.call(obj); // 2
```

总结：通过 foo.call，我们可以在调用 foo 时强制把它的 this 绑定到 obj 上。



1. 硬绑定

```javascript
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2
};

var bar = function() {
  foo.call(obj);
};

bar(); // 2
setTimeout(bar, 100); // 2

bar.call(window); // 2  硬绑定的bar不可能在修改它的this
```



+ new 绑定

```javascript
function foo(a) {
  this.a = a;
}

var bar = new foo(2);
console.log(bar.a); // 2
```



<h3 id="k0s68">优先级</h3>
+ 判断this
1. 函数是否在 new 中调用？如果是的话 this 绑定的是新创建的对象。var bar = new foo()
2. 函数是否通过 call、apply (显式绑定) 或者硬绑定调用？如果是的话，this 绑定的是指定的对象。var bar = foo.call(obj2)
3. 函数是否在某个上下文对象中调用 (隐式绑定) ？如果是的话，this 绑定的是那个上下文对象。var bar = obj1.foo()
4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到全局对象。var bar = foo()

