# 深入理解 JavaScript 作用域和作用域链



## 作用域



### 1. 什么是作用域



**`作用域是在运行时代码中的某些特定部分中变量，函数和对象的可访问性。换句话说，作用域决定了代码区块中变量和其他资源的可见性。可能这两句话并不好理解，我们先来看个例子：`** 



```javascript
function outFun2() {
    var inVariable = "内层变量2";
}

outFun2();
console.log(inVariable); // Uncaught ReferenceError: inVariable is not defined
```



**`从上面的例子可以体会到作用域的概念，变量 inVarialbe 在全局作用域没有声明，所以在全局作用域下取值会报错。我们可以这样理解：作用域就是一个独立的地盘，让变量不会外泄、暴露出去。也就是说作用域最大的用处就是隔离变量，不同作用域下同名变量不会有冲突。`** 



**`ES6 之前 JavaScript 没有块级作用域，只有全局作用域和函数作用域。ES6的到来，为我们提供了块级作用域，可通过新增命令 let 和 const 来体现。`** 





### 2. 全局作用域和函数作用域



**`在代码中任何地方都能访问到的对象拥有全局作用域，一般来说以下几种情形拥有全局作用域：`** 



* **`最外层函数和在最外层函数外面定义的变量拥有全局作用域`**  

  ```javascript
  var outVariable = "我是最外层变量";
  function outFun() {
      var inVariable = "内层变量";
      function innerFun() {
          console.log(inVariable);
      }
      
      innerFun();
  }
  
  console.log(outVariable);
  outFun();
  console.log(inVariable);
  innerFun();
  ```

  

* **`所有未定义直接赋值的变量自动声明为拥有全局作用域`** 

```javascript
function outFun2() {
    variable = "未定义直接赋值的变量";
    var inVariable2 = "内层变量2";
}

outFun2();
console.log(variable); 
console.log(inVariable2); // inVariable2 is not defined
```



* **`所有 window 对象的属性拥有全局作用域`**



**`函数作用域是指声明在函数内部的变量，和全局作用域相反，局部作用域一般只在固定的代码片段内可访问到，最常见的例如函数内部。`** 

```javascript
function doSomething() {
    var blogName = "浪里行舟";
    
    function innerSay() {
        console.log(blogName);
    }
    
    innerSay();
}

console.log(blogName);
```



**`值得注意的是，块语句（大括号 {} 中间的语句），如 if 和 switch 条件语句或 for 和 while 循环语句，不像函数，它们不会创建一个新的作用域。在块语句中定义的变量将保留在它们已经存在的作用域中。`** 



```javascript
if (true) {
    var name = "Hammad"; // name 依然在全局作用域中
}
```



### 3. 块级作用域



**`块级作用域可通过新增命令 let 和 const 声明，所声明的变量在指定块的作用域外无法被访问。块级作用域在如下情况被创建：`** 



**`1. 在一个函数内部`**

**`2. 在一个代码块（由一对花括号包裹）内部`**



**`let 声明的语法与 var 的语法一致。你基本上可以用 let 来代替 var 进行变量声明，但会将变量的作用域限制在当前代码块中。块级作用域有以下几个特点：`** 



* **`声明变量不会提升到代码块顶部`** 



**`let / const 声明不会被提升到当前代码块的顶部，因此你需要手动将 let / const 声明放置到顶部，以便让变量在整个代码块内部可用。`** 



```javascript
function getValue(condition) {
    if (condition) {
        let value = "blue";
        
        return value;
    } else {
        return null;
    }
}
```



* **`禁止重复声明`** 



**`如果一个标识符已经在代码块内部被定义，那么在此代码块内使用同一个标识符进行 let 声明就会导致抛出错误。例如：`** 



```javascript
var count = 30;

let count = 40; // Uncaught SyntaxError: Identifier count has already been declared
```



**`在本例中，count 变量被声明了两次：一次使用 var，另一次使用 let。因为 let 不能在同一作用域内重复声明一个已有标识符，此处的 let 声明就会抛出错误。但如果在嵌套作用域内使用 let 声明一个同名的新变量，则不会抛出错误。`** 



```javascript
var count = 30;

if (condition) {
    let count = 40;
}
```

* **`循环中的绑定块作用域的妙用`** 



**`开发者可能最希望实现 for 循环的块级作用域了，因为可以把声明的计数器变量限制在循环内，例如：`** 



```javascript
for (let i = 0; i < 10; i++) {}

console.log(i); // ReferenceError: i is not defined
```



**`上面代码中，计数器 i 只在 for 循环体内有效，在循环体外引用就会报错。`** 



```javascript
var a = [];

for (var i = 0; i < 10; i++) {
    a[i] = function () {
        console.log(i);
    };
}

a[6](); // 10
```



**`上面代码中，变量 i 是 var 命令声明的，在全局范围内都有效，所以全局只有一个变量 i。每一次循环，变量 i 的值都会发生改变，而循环内被赋值给数组 a 的函数内部的 console.log(i)，里面的 i 指向的就是全局的 i。也就是说，所有数组 a 的成员里面的 i，指向的都是同一个 i，导致运行时输出的是最后一轮的 i 的值，也就是 10。`** 



**`如果使用 let，声明的变量仅在块级作用域内有效，最后输出的是 6。`** 



```javascript
var a = [];

for (let i = 0; i < 10; i++) {
    a[i] = function () {
        console.log(i);
    };
}

a[6](); // 6
```



**`上面代码中，变量 i 是 let 声明的，当前的 i 只在本轮循环有效，所以每一次循环的 i 其实都是一个新的变量，所以最后输出的是 6。你可能会问，如果每一轮循环的变量 i 都是重新声明的，那它怎么知道上一轮循环的值，从而计算出本轮循环的值？这是因为 JavaScript 引擎内部会记住上一轮循环的值，初始化本轮的变量 i 时，就在上一轮循环的基础上进行计算。`** 



**`另外，for 循环还有一个特别之处，就是设置循环变量的那部分是一个父作用域，而循环体内部是一个单独的子作用域。`** 



```javascript
for (let i = 0; i < 3; i++) {
    let i = "abc";
    
    console.log(i);
}

// abc

// abc

// abc
```



**`上面代码正确运行，输出了 3 次 abc。这表明函数内部的变量 i 与循环变量 i 不在同一个作用域，有各自单独的作用域。`**





## 作用域链



### 1. 什么是自由变量



**`首先认识以下什么叫自由变量。如下代码中，console.log(a) 要得到 a 变量，但是在当前的作用域中没有定义 a，当前作用域没有定义的变量，这成为自由变量。自由变量的值如何得到，向父级作用域寻找。`** 

```javascript
var a = 100;

function fn() {
    var b = 200;
    
    console.log(a); // 这里的 a 在这里就是一个自由变量
    
    console.log(b);
}

fn();
```



### 2. 什么是作用域链

**`如果父级也没呢？再一层一层向上查找，直到找到全局作用域还是没找到，就宣布放弃。这种一层一层的关系，就是作用域链。`** 

```javascript
var a = 100;

function F1() {
    var b = 200;
    
    function F2() {
        var c = 300;
        
        console.log(a);
        
        console.log(b);
        
        console.log(c);
    }
    
    F2();
}

F1();
```



### 3. 关于自由变量的取值



**`关于自由变量的值，上文提到要到父级作用域中取，其实有时候这种解释会产生歧义。`** 

```javascript
var x = 10;

function fn() {
    console.log(x);
}

function show(f) {
    var x = 20;
    
    (function() {
        f(); // 10，而不是 20
    })();
}

show(fn());
```



**`在 fn 函数中，取自由变量 x 的值时，要到哪个作用域中取？要到创建 fn 函数的那个作用域中取，无论 fn 函数将在哪里调用。`** 



**`所以，不要在用以上说法了。相比而言，用这句话描述会更加贴切：要到创建这个函数的那个域。作用域中取值，这里强调的是创建，而不是调用。切记切记，其实这就是所谓的静态作用域。`** 



```javascript
var a = 10;

function fn() {
    var b = 20;
    
    function bar() {
        console.log(a + b); // 30
    }
    
    return bar;
}

var x = fn(), b = 200;

x(); // bar()
```





## 作用域与执行上下文



**`我们知道 JavaScript 属于解释型语言，JavaScript 的执行分为：解释和执行两个阶段，这两个阶段所做的事并不一样：`** 



### 解释阶段：

* **`词法分析`** 
* **`语法分析`** 
* **`作用域规则确定`** 



### 执行阶段：

* **`创建执行上下文`** 
* **`执行函数代码`** 
* **`垃圾回收`** 



**`JavaScript 解释阶段便会确定作用域规则，因此作用域在函数定义时就已经确定了，而不是在函数调用时确定，但是执行上下文是函数执行之前创建的。执行上下文最明显的就是 this 的指向是执行时确定的。而作用域访问的变量是编写代码的结构确定的。`** 

**`作用域和执行上下文之间最大的区别是：`** 

**`执行上下文在运行时确定，随时可能改变；作用域在定义时确定，并且不会改变。`** 

**`一个作用域下可能包含若干个上下文环境。有可能从来没有过上下文环境（函数从来就没有被调用过）；有可能有过，现在函数被调用完毕后，上下文环境被销毁了；有可能同时存在一个或多个闭包。同一个作用域下，不同的调用会产生不同的执行上下文环境，继而产生不同的变量的值。`** 







# JavaScript 执行上下文和执行栈



## 一、执行上下文



### 1. 什么是执行上下文

**`简而言之，执行上下文就是当前 JavaScript 代码被解析和执行时所在环境的抽象概念，JavaScript 中运行任何的代码都是在执行上下文中运行。`** 



### 2. 执行上下文的类型

**`执行上下文总共有三种类型：`** 

* **`全局执行上下文：这是默认的、最基础的执行上下文。不在任何函数中的代码都位于全局执行上下文中。它做了两件事：`** 

  **`1. 创建一个全局对象，在浏览器中这个全局对象就是 window 对象。`**

  **`2. 将 this 指针指向这个全局对象。一个程序中只能存在一个全局执行上下文。`**

* **`函数执行上下文：每次调用函数时，都会为该函数创建一个新的执行上下文。每个函数都拥有自己的执行上下文，但是只有在函数被调用的时候才会被创建。一个程序中可以存在任意数量的函数执行上下文。每当一个新的执行上下文被创建，它都会按照特定的顺序执行一系列步骤，具体过程将在本文后面讨论。`** 

* **`Eval 函数执行上下文：运行在 eval 函数中的代码也获得了自己的执行上下文，但由于 JavaScript 开发人员不常用 eval 函数，所以在这里不再讨论。`** 





## 二、执行上下文的生命周期

**`执行上下文的生命周期包括三个阶段：创建阶段 → 执行阶段  →  回收阶段，本文重点介绍创建阶段。`** 



### 1. 创建阶段

**`当函数被调用时，但未执行任何其内部代码之前，会做以下三件事：`**

* **`创建变量对象：首先初始化函数的参数 arguments，提升函数声明和变量声明。下文会详细说明。`**
* **`创建作用域链：在执行上下文的创建阶段，作用域链是在变量对象之后创建的。作用域链本身包含变量对象。作用域链用于解析变量。当被要求解析变量时，JavaScript 始终从代码嵌套的最内层开始，如果最内层没有找到变量，就会跳转到上一层父作用域中查找，直到找到该变量。`**
* **`确定 this 指向：包括多种情况，下文会详细说明`** 

**`在一段 JS 脚本执行之前，要先解析代码，解析的时候会先创建一个全局执行上下文环境，先把代码中即将执行的变量、函数声明都拿出来。变量先暂时赋值为 undefined，函数则先声明好可使用。这一步做完了，然后再开始正式执行程序。`** 

**`另外，一个函数在执行之前，也会创建一个函数执行上下文环境，跟全局上下文差不多，不过函数执行上下文中会多出 this、arguments 和函数的参数。`**



### 2. 执行阶段

**`执行变量赋值、代码执行`** 



### 3. 回收阶段

**`执行上下文出栈等待虚拟机回收执行上下文`** 



## 三、变量提升和 this 指向的细节



### 1. 变量声明提升

**`大部分编程语言都是先声明变量再使用，但在 JS 中，事情有些不一样：`** 

```javascript
console.log(a); // undefined
var a = 10; 
```

**`上述代码正常输出 undefined 而不是报错 Uncaught ReferenceError：a is not defined。这是因为声明提升，相当于如下代码：`** 

```javascript
var a; 
console.log(a); 
a = 10; 
```





### 2. 函数声明提升

**`我们都知道，创建一个函数的方法有两种，一种是通过函数声明 function foo() {}，另一种是通过函数表达式 var foo = function() {}，那这两种在函数提升有什么区别呢？`** 

```javascript
console.log(f1);
function f1() {}
console.log(f2);
var f2 = function() {}
```

**`接下来我们通过一个例子来说明这个问题：`** 

```javascript
function test() {
    foo(); // Uncaught TypeError foo is not a function
    bar(); // this will run
    
    var foo = function () {
        console.log("this won't run！");
    }
    
    function bar() {
        console.log("this will run!");
    }
}

test();
```

**`在上面的例子中，foo() 调用的时候报错了，而 bar 能够正常调用。`** 

**`我们前面说过变量和函数都会上升，遇到函数表达式 var foo = function() {} 时，首先会将 var foo 上升到函数体顶部，然而此时的 foo 的值为 undefined，所以执行 foo() 报错。而对于函数 bar()，则是提升了整个函数，所以 bar() 才能够顺利执行。有个细节必须注意：当遇到函数和变量同名且都会被提升的情况，函数声明优先级比较高，因此变量声明会被函数声明所覆盖，但是可以重新赋值。`** 

```javascript
console.log(a); // 输出 function a() { console.log("我是函数") }

function a() {
    console.log("我是函数")
}

var a = "我是变量";

console.log(a); // 输出 我是变量
```

**`function 声明的优先级比 var 声明高，也就意味着当两个同名变量同时被 function 和 var 声明时，function 声明会覆盖 var 声明。`** 

**`这代码等效于：`** 

```javascript
function a() {
    console.log("我是函数")
}

var a;
console.log(a); // 输出 function a() { console.log("我是函数") }

a = "我是变量";

console.log(a); // 输出 我是变量
```

**`最后我们看个复杂点的例子：`** 

```javascript
function test(arg) {
    console.log(arg); // 输出函数
    
    var arg = "hello";
    
    function arg() {
        console.log("hello world");
    }
    
    console.log(arg); // 输出 hello
}

test("hi");
```



### 3. 确定 this 的指向

**`this 的值是在执行的时候确认，定义的时候不能确认，为什么呢？因为 this 是执行上下文环境的一部分，而执行上下文需要在代码执行之前确定，而不是定义的时候。看如下例子：`**

```javascript
function foo() {
    console.log(this.a);
}

var a = 1;
foo();

function fn() {
    console.log(this);
}

var obj = { fn: fn };
obj.fn();

function CreateJsPerson(name, age) {
    this.name = name;
    this.age = age;
}

var p1 = new CreateJsPerson("", 48);

function add(c, d) {
    return this.a + this.b + c + d;
}

var o = { a: 1, b: 3 };
add.call(o, 5, 7);
add.apply(o, [10, 20]);
```



```html
<button id="btn1">
    箭头函数 this
</button>
<script type="text/javascript">
    let btn1 = document.getElementById("btn1");
    let obj = {
        name: "kobe",
        age: 39,
        getName: function () {
            btn1.onclick = () => {
                console.log(this); // obj
            };
        }
    };
    
    obj.getName();
</script>
```











## 四、执行上下文栈

**`函数多了，就有多个函数执行上下文，每次调用函数创建一个新的执行上下文，那如何管理创建的那么多执行上下文呢？`** 

**`JavaScript 引擎创建了执行上下文栈来管理执行上下文。可以把执行上下文栈认为是一个存储函数调用的栈结构，遵循先进后出的原则。`** 

**`从上面的流程图，我们需要记住几个关键点：`** 

* **`JavaScript 执行在单线程上，所有的代码都是排队执行`** 
* **`一开始浏览器执行全局的代码时，首先创建全局的执行上下文，压入执行栈的顶部。`** 
* **`每当进入一个函数的执行就会创建函数的执行上下文，并且把它压入执行栈的顶部。当前函数执行完成后，当前函数的执行上下文出栈，并等待垃圾回收。`** 
* **`浏览器的 JS 执行引擎总是访问栈顶的执行上下文。`** 
* **`全局上下文只有唯一的一个，它在浏览器关闭时出栈。`** 

我们再来看个例子：

```javascript
var color = "blue";
function changeColor() {
    var anotherColor = "red";
    function swapColors() {
        var tempColor = anotherColor;
        anotherColor = color;
        color = tempColor;
    }
    
    swapColors();
}

changeColor();
```

**`上述代码运行按照如下步骤：`** 

* **`当上述代码在浏览器中加载时，JavaScript 引擎会创建一个全局执行上下文并且将它推入当前的执行栈`** 
* **`调用 changeColor 函数时，此时 changeColor 函数内部代码还未执行，js 执行引擎立即创建一个 changeColor 的执行上下文，然后把这执行上下文压入到执行栈中。`** 
* **`执行 changeColor 函数过程中，调用 swapColors 函数，同样地，swapColors 函数执行之前也创建了一个 swapColors 的执行上下文，并压入到执行栈中。`** 
* **`swapColors 函数执行完成，swapColors 函数的执行上下文出栈，并且被销毁。`** 
* **`changeColor 函数执行完成，changeColor 函数的执行上下文出栈，并且被销毁。`** 





# 闭包



## 一、引子



**`闭包是 JavaScript 语言的一个难点，面试时常被问及，它是它的特色，很多高级应用都要依靠闭包实现。本文尽可能用简单易懂的花，讲清楚闭包的概念、形成条件及其常见的面试题。`** 



**`我们先来看一个例子：`** 



```javascript
var n = 999;

function f1() {
    console.log(n);
}

f1(); // 999
```



**`上面代码中，函数 f1 可以读取全局变量 n。但是，函数外部无法读取函数内部声明的变量。`** 



```javascript
function f1() {
    var n = 999;
}

console.log(n); // Uncaught ReferenceError: n is not defined
```



**`上面代码中，函数 f1 内部声明的变量 n，函数外是无法读取的。`** 



**`如果有时候需要得到函数内的局部变量。正常情况下，这是办不到的，只有通过变通方法才能实现。那就是在函数的内部，再定义一个函数。`** 



```javascript
function f1() {
    var n = 999;
    
    function f2() {
        console.log(n); // 999
    }
}
```



**`上面代码中，函数 f2 就在函数 f1 内部，这时 f1 内部的所有局部变量，对 f2 都是可见的。既然 f2 可以读取 f1 的局部变量，那么只要把 f2 作为返回值，我们不就可以在 f1 外部读取它的内部变量了。`** 



## 二、闭包是什么

**`我们可以对上面代码进行如下修改：`** 

```javascript
function f1() {
    var a = 999;
    
    function f2() {
        console.log(a);
    }
    
    return f2;
}

var result = f1();
result();
```

**`上面代码中，函数 f1 的返回值就是函数 f2，由于 f2 可以读取 f1 的内部变量，所以就可以在外部获得 f1 的内部变量了。闭包就是函数 f2，即能够读取其他函数内部变量的函数。闭包就是函数中的函数，里面的函数可以访问外面函数的变量，外面的变量的是这个内部函数的一部分。`** 

**`闭包形成的条件`** 

* **`函数嵌套`** 
* **`内部函数引用外部函数的局部变量`** 



## 三、闭包的特性



**`每个函数都是闭包，每个函数天生都能够记忆自己定义时所处的作用域环境。`** 



```javascript
var inner;

function outer() {
    var a = 250;
    
    inner = function () {
        console.log(a); // 这个函数虽然在外面执行，但能够记忆定义时的那个作用域，a 是 250
    }
}

outer();

var a = 300;

inner(); // 一个函数在执行的时候，找闭包里面的变量，不会理会当前作用域
```

```javascript
function outer(x) {
    function inner(y) {
        console.log(x + y);
    }
    
    return inner;
}

var inn = outer(3); // 传入数字 3 ，inner 函数中 x 便会记住这个值

inn(5); // 当 inner 函数再传入 5 的时候，只会对 y 赋值，所以最后弹出 8
```



## 四、闭包的内存泄漏

```javascript
function fn() {
    var num = 100;
    
    return function () {}
}

var f = fn(); // fn 执行形成的这个私有作用域就不能再销毁了
```



**`接下来我们看下有关于内存泄漏的一道经典面试题：`** 

```javascript
function outer() {
    var num = 0;
    
    return function add() {
        num++;
        console.log(num);
    };
}

var func1 = outer();

func1(); // 1

func1(); // 2

var func2 = outer();

func2(); // 1

func2(); // 2
```



## 五、闭包的作用

**`1. 可以读取函数内部的变量`**

**`2. 可以使变量的值长期保存在内存中，生命周期长。因此不能滥用闭包，否则会造成网页的性能问题。`**

**`3. 可以用来实现 JS 模块`**

**`具体请看下面的例子：`** 

```html
<script type="text/javascript" src="myModule.js"></script>

<script type="text/javascript">
    myModule2.doSomething()
    myModule2.doOtherthing()
</script>
```



```javascript
(function () {
    var msg = "Beijing";
    
    function doSomething() {
        console.log("doSomething()" + msg.toUpperCase());
    }
    
    function doOtherthing() {
        console.log("doOtherthing()" + msg.toLowerCase());
    }
    
    // 向外暴露对象
    window.myModule2 = {
        doSomething: doSomething,
        doOtherthing: doOtherthing
    }
})();
```



## 六、闭包的运用

**`我们要实现这样的一个需求：点击某个按钮，提示点击的是第 n 个按钮，此处我们先不用事件代理：`** 

```html
<button>测试1</button>
<button>测试2</button>
<button>测试3</button>

<script type="text/javascript">
    var btns = document.getElementsByTagName("button");
    
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function () {
            console.log("第" + (i + 1) + "个");
        }
    }
</script>
```

**`万万没想到，点击任意一个按钮，后台都是弹出第四个，这是因为 i 是全局变量，执行到点击事件时，此时 i 的值为 3。那该如何修改，最简单的是用 let 声明：`** 

```javascript
for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function () {
        console.log("第" + (i + 1) + "个")
    }
}
```

**`另外我们可以通过闭包的方式来修改：`** 

```javascript
for (var i = 0; i < btns.length; i++) {
    (function (j) {
        btns[j].onclick = function () {
            console.log("第" + (j + 1) + "个")
        }
    })(i)
}
```





# 原型与原型链详解



## 一、构造函数

**`构造函数模式的目的就是为了创建一个自定义类，并且创建这个类的实例。构造函数模式中拥有了类和实例的概念，并且实例和实例之间是相互独立的，即实例识别。`** 

**`构造函数就是一个普通函数，创建方式和普通函数没有区别，不同的是构造函数习惯上首字母大写。另外就是调用方式的不同，普通函数是直接调用，而构造函数需要使用 new 关键字来调用。`** 

```javascript
function Person(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
    this.sayName = function () {
        console.log(this.name);
    }
}

var per = new Person("孙悟空", 18, "男");

function Dog(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
}

var dog = new Dog("旺财", 4, "雄");

console.log(per);
console.log(dog);
```

**`每创建一个 Person 构造函数，在 Person 构造函数中，为每一个对象都添加了一个 sayName 方法，也就是说构造函数每执行一次就会创建一个新的 sayName 方法。这样就导致了构造函数执行一次就会创建一个新的方法，执行 10000 次就会创建 10000 个新的方法，而 10000 个方法都是一模一样的，为什么不把这个方法单独放到一个地方，并让所有的实例都可以访问到？这就需要原型（prototype）。`** 



## 二、原型

**`在 JavaScript 中，每当定义一个函数数据类型（普通函数、类）时候，都会天生自带一个 prototype 属性，这个属性指向函数的原型对象，并且这个属性是一个对象数据类型的值。`** 



## 三、原型链

### **`1. __proto__ 和 constructor`**

**`每一个对象数据类型（普通对象、实例、prototype）也天生自带一个属性 __proto__，属性值是当前实例所属类的原型（prototype）。原型对象中有一个属性 constructor，它指向函数对象。`** 

```javascript
function Person() {}

var person = new Person();

console.log(person.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true

console.log(Object.getPrototypeOf(person) === Person.prototype); // true
```



### 2. 何为原型链

**`在 JavaScript 中万物都是对象，对象和对象之间也有关系，并不是孤立存在的。对象之间的继承关系，在 JavaScript 是通过 prototype 对象指向父类对象，直到指向 Object 对象为止，这样就形成了一个原型指向的链条，称之为原型链。`** 

**`举例说明：person → Person → Object，普通人继承人类，人类继承对象类`** 

**`当我们访问对象的一个属性或方法时，它会先在对象自身中寻找，如果有则直接使用，如果没有则会去原型对象中寻找，如果找到则直接使用。如果没有则去原型的原型中寻找，直到找到 Object 对象的原型，Object 对象的原型没有原型，如果在 Object 原型中依然没有找到，则返回 undefined。`**

**`我们可以使用对象的 hasOwnProperty() 来检查对象自身中是否含有该属性；使用 in 检查对象中是否含有某个属性时，如果对象中没有但是原型中有，也会返回 true。`** 

```javascript
function Person() {}

Person.prototype.a = 123;

Person.prototype.sayHello = function () {
    console.log("hello");
};

var person = new Person();

console.log(person.a); // 123
console.log(person.hasOwnProperty("a")); // false
console.log("a" in person); // true
```

**`person 实例中没有 a 这个属性，从 person 对象中找不到 a 属性就会从 person 的原型也就是 person.__proto__，也就是 Person.prototype 中查找，很幸运地得到 a 的值为 123。那假如 person.__proto__ 中也没有该属性，又该如何查找？`**

**`当读取实例的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层 Object 为止。Object 是 JS 中所有对象数据类型的基类（最顶层的类）在 Object.prototype 上没有 __proto__ 这个属性。`** 

```javascript
console.log(Object.prototype.__proto__ === null); // true
```





# JavaScript 常见的六种继承方式



## 方式一、原型链继承

这种方式关键在于：子类型的原型为父类型的一个实例对象。

```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.play = [1, 2, 3];
    this.setName = function () {}
}

Person.prototype.setAge = function () {};

function Student(price) {
    this.price = price;
    this.setScore = function () {};
}

Student.prototype = new Person();
var s1 = new Student(15000);
var s2 = new Student(14000);
console.log(s1, s2);
```



## 方法二：借用构造函数继承

```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.setName = function () {}
}

Person.prototype.setAge = function () {};

function Student(name, age, price) {
    Person.call(this, name, age);
    this.price = price;
}

var s1 = new Student("Tom", 20, 15000);
```





## 方法三：原型链 + 借用构造函数的组合继承

```javascript
function Person (name, age) {
    this.name = name;
    this.age = age;
    this.setAge = function () {}
}

Person.prototype.setAge = function () {
    console.log("111");
}

function Student (name, age, price) {
    Person.call(this, name, age);
    this.price = price;
    this.setScore = function () {}
}

Student.prototype = new Person();
Student.prototype.constructor = Student;
Student.prototype.sayHello = function () {};
var s1 = new Student("Tom", 20, 15000);
var s2 = new Student("Jack", 22, 14000);

console.log(s1);
console.log(s1.constructor); // Student
console.log(p1.constructor); // Person
```





## 方式四：组合继承优化1

```javascript
function Person (name, age) {
    this.name = name;
    this.age = age;
    this.setAge = function () {};
}

Person.prototype.setAge = function () {
    console.log("111");
}

function Student (name, age, price) {
    Person.call(this, name, age);
    this.price = price;
    this.setScore = function () {};
}

Student.prototype = Person.prototype;
Student.prototype.sayHello = function () {}
var s1 = new Student("Tom", 20, 15000);
console.log(s1);
```





## 方式五：组合继承优化2

```javascript
function Person (name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.setAge = function () {
    console.log("111");
}

function Student (name, age, price) {
    Person.call(this, name, age);
    this.price = price;
    this.setScore = function () {}
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
var s1 = new Student("Tom", 20, 15000);
console.log(s1 instanceof Student, s1 instanceof Person); // true
console.log(s1);
```





## 方式六：ES6 中 class 的继承

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    showName () {
        console.log("调用父类的方法");
        console.log(this.name, this.age);
    }
}

let p1 = new Person("kobe", 39);
console.log(p1);

class Student extends Person {
    constuctor(name, age, salary) {
        super(name, age);
        this.salary = salary;
    }
    
    showName() {
        console.log("调用子类的方法");
        console.log(this.name, this.age, this.salary);
    }
}

let s1 = new Student("wade", 38, 100000);
console.log(s1);
s1.showName();
```

