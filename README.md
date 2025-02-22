



# JavaScript 数据类型转换



## 一、强制转换



### 1. 其他的数据类型转换为 String

#### 方式一：toString() 方法

* **`调用被转换数据类型的 toString() 方法，该方法不会影响到原变量，它会讲转换的结果返回，但是注意：null 和 undefined 这两个值没有 toString，如果调用他们的方法，会报错。`** 

```javascript
var a = 123;

a.toString(); // "123"

var b = null;

b.toString(); // 报错

var c = undefined;

c.toString(); // 报错
```

* **`采用 Number 类型的 toString() 方法的基模式，可以用不同的基输出数字，例如二进制的基是 2，八进制的基是 8，十六进制的基是 16。`** 

```javascript
var iNum = 10;

console.log(iNum.toString(2)); // 1010
console.log(iNum.toString(8)); // 12
console.log(iNum.toString(16)); // A
```



### 方式二：String() 函数

* **`使用 String() 函数做强制类型转换时，对于 Number 和 Boolean 实际上就是调用的 toString() 方法，但是对于 null 和 undefined，就不会调用 toString() 方法，它会将 null 直接转换为 "null"，将 undefined 直接转换为 "undefined"。`** 

```javascript
var a = null;

String(a); // "null"

var b = undefined;

String(b); // "undefined"
```

* **`String 方法的参数如果是对象，返回一个类型字符串；如果是数组，返回该数组的字符串形式。`** 

```javascript
String({ a: 1 }); // "[object Object]"
String([1, 2, 3]); // "1,2,3"
```





### 2、其他的数据类型转换为 Number



#### 方式一：使用 Number() 函数

下面分成两种情况讨论，一种是参数是原始类型的值，另一种是参数是对象。



**`(1) 原始类型值`** 

**`1. 字符串转数字`**

```javascript
Number("324"); // 324
Number("324abc"); // NaN
Number(""); // 0
```



**`2. 布尔值转数字：true 转成 1，false 转成 0`**

```javascript
Number(true); // 1
Number(false); // 0
```



**`3. undefined 转数字：转成 NaN`**

```javascript
Number(undefined); // NaN
```



**`4. null 转数字：转成 0`**

```javascript
Number(null); // 0
```



**`5. Number() 接受数值作为参数，此时它既能识别负的十六进制，也能识别 0 开头的八进制，返回值永远是十进制`**

```javascript
Number(3.15); // 3.15
Number(023); // 19
Number(0x12); // 18
Number(-0x12); // -18
```



**`(2) 对象`** 

**`简单的规则是，Number 方法的参数是对象时，将返回 NaN，除非是包含单个数值的数组。`**

```javascript
Number({ a: 1 }); // NaN
Number([1, 2, 3]); // NaN
Number([5]); // 5
```



#### 方式二：parseInt & parseFloat()

**`这种方式专门用来对付字符串，parseInt() 一个字符串转换为一个整数，可以将一个字符串的有效的整数内容取出来，然后转换为 Number。parseFloat() 把一个字符串转换为一个浮点数。parseFloat() 作用和 parseInt() 类似，不同的是它可以获得有效的小数。`** 

```javascript
console.log(parseInt(".21")); // NaN
console.log(parseInt("10.3")); // 10
console.log(parseInt(".21")); // 0.21
console.log(parseInt(".d1")); // NaN
console.log(parseInt("10.11.33")); // 10.11
console.log(parseInt("4.3years")); // 4.3
console.log(parseInt("He40.3")); // NaN
```

**`parseInt() 没有第二个参数时默认以十进制转换数值，有第二个参数时，以第二个参数为基数转换数值，如果基数有误返回 NaN`**

```javascript
console.log(parseInt("13")); // 13
console.log(parseInt("11", 2)); // 3
console.log(parseInt("17", 8)); // 15
console.log(parseInt("1f", 16)); // 31
```

**`两者的区别：Number 函数将字符串转为数值，要比 parseInt 函数严格很多。基本上，只要有一个字符无法转成数值，整个字符串就会被转化为 NaN。`**

```javascript
parseInt("42 cats"); // 42
Number("42 cats"); // NaN
```

**`上面代码中，parseInt 逐个解析字符，而 Number 函数整体转换为字符串的类型。`** 

**`另外，对空字符串的处理也不一样。`** 

```javascript
Number("     "); // 0
parseInt("   "); // NaN
```





### 3、其他的数据类型转换为 Boolean

**`它的转换规则相对简单，只有空字符串（""）、null、undefined、+0、-0 和 NaN 转为布尔型是 false，其他的都是 true，空数组、空对象转换为布尔类型也是 true，甚至连 false 对应的布尔对象 new Boolean(false) 也是 true。`** 

```javascript
Boolean(undefined); // false
Boolean(null); // false
Boolean(0); // false
Boolean(NaN); // false
Boolean(""); // false
```

```javascript
Boolean({}); // true
Boolean([]); // true
Boolean(new Boolean(false)); // true
```





## 二、自动转换

**`遇到以下三种情况时，JavaScript 会自动转换数据类型，即转换是自动完成的，用户不可见。`** 



### 1. 自动转换为布尔值

**`JavaScript 遇到预期为布尔值的地方（比如 if 语句的条件部分），就会将非布尔值的参数自动转换为布尔值。系统内部会自动调用 Boolean 函数。`** 

```javascript
if ("abc") {
    console.log("hello");
}
```



### 2. 自动转换为数值

**`算术运算符（+ - * /）跟非 Number 类型的值进行运算时，会将这些值转换为 Number，然后在运算，除了字符串的加法运算`** 

```javascript
true + 1; // 2
2 + null; // 2
undefined + 1 // NaN
2 + NaN; // NaN
'5' - '2'; // 3
'5' * '2'; // 10
true - 1; // 0
'1' - 1; // 0
'5' * []; // 0
false / '5'; // 0
'abc' - 1; // NaN
```



**`一元运算符也会把运算子转成数值`**

```javascript
+ "abc"; // NaN
- "abc"; // NaN
+ true; // 1
- false; // 0
```



### 3. 自动转换为字符串

**`字符串的自动转换，主要发生在字符串的加法运算时。当一个值为字符串，另一个值为非字符串，则后者转为字符串。`**

```javascript
'5' + 1; // '51'
'5' + true // "5true"
"5" + false; // "5false"
"5" + {}; // "5[object Object]"
"5" + []; // "5"
"5" + function () {}; // "5function () {}"
"5" + undefined; // "5undefined"
"5" + null; // "5null"
```





## 三、总结



### 1. 强制转换的各种情况



### 2. 自动转换的各种情况

* **`只有空字符串（""）、null、undefined、+0、-0 和 NaN 转为布尔值是 false，其他的都是 true`** 
* **`除了加法运算符（+）有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值。一元运算符也会把运算子转成数值。`** 
* **`字符串的自动转换，主要发生在字符串的加法运算时。`** 







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







# this 指向



## 二、了解 this

**`this 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。`**



## 三、this 到底是谁



### 1. 函数执行时首先要看函数名前面是是否有 "."，有的话，"." 前面是谁，this 就是谁；没有的话 this 就是 window

```javascript
function fn() {
    console.log(this);
} 

var obj = { fn: fn };

fn(); // this 指向 window

obj.fn(); // this 指向 obj

function sum() {
    fn(); // this 指向 window
}

sum();

var oo = {
    sum: function () {
        console.log(this); // this 指向 oo
        fn(); // this 指向 window
    }
};

oo.sum();
```



### 2. 自执行函数中的 this 永远是 window

```javascript
(function() {})(); // this 指向 window
```



### 3. 给元素的某一个事件绑定方法，当事件触发的时候，执行对应的方法，方法中的 this 是当前的元素，除了 IE6 ~ IE8 下使用 attachEvent

* **`DOM0 事件绑定`**

```javascript
oDiv.onclick = function () {
    // this 指向 oDiv
};
```



* **`DOM2 事件绑定`**

```javascript
oDiv.addEventListener("click", function() {
    // this 指向 oDiv
}, false);
```

* **`在 IE6 ~ IE8 下使用 attachEvent，默认的 this 就是指的 window 对象`**

```javascript
oDiv.attachEvent("click", function() {
    // this 指向 window
})
```

**`我们大多数时候，遇到事件绑定，如下面例子这种，对于 IE6 ~ 8 使用 attachEvent 不必太较真。`**

```javascript
function fn() {
    console.log(this);
}

document.getElementById("div1").onclick = fn; // fn 中的 this 就是 div1
document.getElementById("div1").onclick = function() {
    console.log(this); // this 指向 div1
    fn(); // this 指向 window
}
```



### 4. 在构造函数模式中，类中（函数体中）出现的 this.xxx=xxx 中的 this 是当前类的一个实例

```javascript
function CreateJsPerson(name, age) {
    this.name = name;
    this.age = age;
    this.writeJs = function() {
        console.log("my name is " + this.name + ", i can write Js");
    };
}

var p1 = new CreateJsPerson("尹华芝", 48);
```

**`必须要注意一点：类中某一个属性值（方法），方法中的 this 需要看方法执行的时候，前面是否有 "."，才能知道 this 是谁。大家不妨看下接下来的这个例子，就可明白是啥意思。`** 

```javascript
function Fn() {
    this.x = 100;
    this.getX = function() {
        console.log(this.x);
    }
}

var f1 = new Fn();

f1.getX(); // 100

var ss = f1.getX;
ss(); undefined
```



### 5. call、apply 和 bind

**`我们先来看一个问题，想在下面的例子中 this 绑定 obj，怎么实现？`** 

```javascript
var obj = { name: "浪里行舟" };

function fn() {
    console.log(this);
}

fn();

obj.fn(); // Uncaught TypeError: obj.fn is not a function
```

**`如果直接绑定 obj.fn() 程序就会报错。这里我们应该用 fn.call(obj) 就可以实现 this 绑定 obj，接下来我们详细介绍下 call 方法。`**

* **`call 方法的作用：`**

**`1. 首先我们让原型上的 call 方法执行，在执行 call 方法的时候，我们让 fn 方法中的 this 变为第一个参数值 obj；然后再把 fn 这个函数执行。`**

**`2. call 还可以传值，在严格模式下和非严格模式下，得到值不一样。`**

```javascript
var obj = { name: "浪里行舟" };

function fn(num1, num2) {
    console.log(num1 + num2);
    console.log(this);
}

fn.call(100, 200); // this 指向 100，num1: 100,num2: undefined
fn.call(obj, 100, 200); // this 指向 obj, num1:100, num2:200
fn.call(); // this 指向 window
fn.call(null); // this 指向 window
fn.call(undefined); // this 指向 window
```



**`严格模式下`**

```javascript
fn.call(); // this 指向 undefined
fn.call(null); // this 指向 null
fn.call(undefined); // this 指向 undefined
```



**`两者唯一的区别：call 第二个参数开始接受一个参数列表，apply 第二个参数开始接受一个参数数组。`**

```javascript
fn.call(obj, 100, 200);
fn.apply(obj, [100, 200]);
```



* **`bind：这个方法在 IE6 ~ 8 下不兼容，和 call/apply 类似都是用来改变 this 关键字的，但是和这两者有明显区别：`**

```javascript
fn.call(obj, 1, 2);

fn.bind(obj, 1, 2);

var tempFn = fn.bind(obj, 1, 2);

tempFn();
```

**`bind 体现了预处理思想：事先把 fn 的 this 改变为我们想要的结果，并且把对应的参数值也准备好，以后要用到了，直接的执行即可。`**

**`call 和 apply 直接执行函数，而 bind 需要再一次调用。`**

```javascript
var a = {
    name: "Cherry",
    fn: function (a, b) {
        console.log(a + b);
    }
}

var b = a.fn;
b.bind(a, 1, 2)(); // 3
```

**`必须要声明一点：遇到第五种情况（call apply 和 bind），前面四种全部让步。`**





## 四、箭头函数 this 指向

**`箭头函数正如名称所示那样使用一个箭头（=>）来定义函数的新语法，但它优于传统的函数，主要体现两点：更简短的函数并且不绑定 this。`**

```javascript
var obj = {
    birth: 1990,
    getAge: function () {
        var b = this.birth;
        var fn = function () {
            return new Date().getFullYear() - this.birth;
        };
        
        return fn();
    }
};
```

**`现在，箭头函数完全修复了 this 的指向，箭头函数没有自己的 this，箭头函数的 this 不是调用的时候决定的，而是在定义的时候处在的对象就是它的 this。`**

**`换句话说，箭头函数的 this 看外层的是否有函数，如果有，外层函数的 this 就是内部箭头函数的 this，如果没有，则 this 是 window。`**

```html
<button id="btn1">测试箭头函数 this_1</button>
<button id="btn2">测试箭头函数 this_2</button>

<script type="text/javascript">
    let btn1 = document.getElementById("btn1");
    
    let obj = {
        name: "kobe",
        age: 39,
        getName: function () {
            btn1.onclick = () => {
                console.log(this); // obj
            }
        }
    };
    
    obj.getName();
</script>
```



**`上例中，由于箭头函数不会创建自己的 this，它只会从自己的作用域链的上一层继承 this。其实可以简化为如下代码：`**

```javascript
let btn1 = document.getElementById("btn1");

let obj = {
    name: "kobe",
    age: 39,
    getName: function () {
        console.log(this);
    }
};

obj.getName();
```

**`那假如上一层并不存在函数，this 指向又是谁？`**

```html
<button id="btn1">测试箭头函数 this_1</button>
<button id="btn2">测试箭头函数 this_2</button>

<script type="text/javascript">
    let btn2 = document.getElementById("btn2");
    
    let obj = {
        name: "kobe",
        age: 39,
        getName: () => {
            btn2.onclick = () => {
                console.log(this); // window
            }
        }
    };
    
    obj.getName();
</script>
```

**`上例中，虽然存在两个箭头函数，其实 this 取决于最外层的箭头函数，由于 obj 是个对象而非函数，所以 this 指向为 window 对象。`**

**`由于 this 在箭头函数中已经按照词法作用域绑定了，所以，用 call() 或者 apply() 调用箭头函数时，无法对 this 进行绑定，即传入的第一个参数被忽略：`**

```javascript
var obj = {
    birth: 1990,
    getAge: function (year) {
        var b = this.birth;
        var fn = (y) => y - this.birth;
        return fn.call({ birth: 2000 }, year);
    }
};

obj.getAge(2018); // 28
```







# 浏览器与 Node 的事件循环



## 一、线程与进程



### 1. 概念

**`我们经常说是 JS 是单线程执行的，指的是一个进程里只有一个主线程，那么到底什么是线程？什么是进程？`** 

**`进程是 CPU 资源分配的最小单位；线程是 CPU 调度的最小单位。`**



### 2. 多进程与多线程

* **`多进程：在同一个时间里，同一个计算机系统中如果允许两个或两个以上的进程处于运行状态。多进程带来的好处是明显的，比如你可以听歌的同时，打开编辑器敲代码，编辑器和听歌软件的进程之间丝毫不会相互干扰。`** 
* **`多线程：程序中包含多个执行流，即在一个程序中可以同时运行多个不同的线程来执行不同的任务，也就是说允许单个程序创建多个并行执行的线程来完成各自的任务。`** 

**`以 Chrome 浏览器中为例，当你打开一个 Tab 页时，其实就是创建了一个进程，一个进程中可以有多个线程，比如渲染线程、JS 引擎线程、HTTP 请求线程等等。当你发起一个请求时，其实就是创建了一个线程，当请求结束后，该线程可能会被销毁。`** 





## 二、浏览器内核

**`简单来说浏览器内核是通过取得页面内容、整理信息（应用 CSS）、计算和组合最终输出可视化的图像结果，通常也被称为渲染引擎。`** 

**`浏览器内核是多线程，在内核控制下各线程相互配合以保持同步，一个浏览器通常由以下常驻线程组成：`** 

* **`GUI 渲染线程`** 
* **`JavaScript 引擎线程`** 
* **`定时触发器线程`** 
* **`事件触发线程`** 
* **`异步 http 请求线程`** 



### 1. GUI 渲染线程

* **`主要负责页面的渲染，解析 HTML、CSS，构建 DOM 树，布局和绘制等。`** 
* **`当界面需要重绘或者由于某种操作引发回流时，将执行该线程。`** 
* **`该线程与 JS 引擎线程互斥，当执行 JS 引擎线程时，GUI 渲染会被挂起，当任务队列空闲时，主线程才会去执行 GUI 渲染。`** 



### 2. JS 引擎线程

* **`该线程当然是主要负责处理 JavaScript 脚本，执行代码。`** 
* **`也是主要负责执行准备好待执行的事件，即定时器计数结束，或者异步请求成功并正确返回时，将依次进入任务队列，等待 JS 引擎线程的执行。`** 
* **`当然，该线程与 GUI 渲染线程互斥，当 JS 引擎线程执行 JavaScript 脚本时间过长，将导致页面渲染的阻塞。`** 



### 3. 定时器触发线程

* **`负责执行异步定时器一类的函数的线程，如：setTimeout、setInterval。`** 
* **`主线程依次执行代码时，遇到定时器，会将定时器交给该线程处理，当计数完毕后，事件触发线程会将计数完毕后的事件加入到任务队列的尾部，等待 JS 引擎线程执行。`** 



### 4. 事件触发线程

* **`主要负责将准备好的事件交给 JS 引擎线程执行。`** 

**`比如 setTimeout 定时器计数结束，ajax 等异步请求成功并触发回调函数，或者用户触发点击事件时，该线程会将整装待发的事件依次加入到任务队列的队尾，等待 JS 引擎线程的执行。`** 



### 5. 异步 http 请求线程

* **`负责执行异步请求一类的函数的线程，如：Promise，axios，ajax 等。`** 
* **`主线程依次执行代码时，遇到异步请求，会将函数交给该线程处理，当监听到状态码变更，如果有回调函数，事件触发线程会将回调函数加入到任务队列的尾部，等待 JS 引擎线程执行。`** 



## 三、浏览器中的 Event Loop



### 1. micro-task 与 macro-task

**`浏览器端事件循环中的异步队列有两种：macro（宏任务）队列和 micro（微任务）队列。宏任务队列可以有多个，微任务队列只有一个。`** 

* **`常见的 macro-task 比如：setTimeout、setInterval、script（整体代码）、I/O 操作、UI 渲染等。`** 
* **`常见的 micro-task 比如：new Promise().then(回调)、MutationObserver 等。`** 



### 2. Event Loop 过程解析

**`一个完整的 Event Loop 过程，可以概括为以下阶段：`** 

* **`一开始执行栈为空，我们可以把执行栈认为是一个存储函数调用的栈结构，遵循后进先出的原则。micro 队列空，macro 队列里有且只有一个 script 脚本（整体代码）。`** 
* **`全局上下文（script 标签）被推入执行栈，同步代码执行。在执行过程中，会判断是同步任务还是异步任务，通过对一些接口的调用，可以产生新的 macro-task 与 micro-task，它们会分别被推入各自的任务队列里。同步代码执行完了，script 脚本会被移出 macro 队列，这个过程本质上是队列的 macro-task 的执行和出队的过程。`** 
* **`上一步我们出队的是一个 macro-task，这一步我们处理的是 micro-task。但需要注意的是：当 macro-task 出队时，任务是一个一个执行的；而 micro-task 出队时，任务是一对一对执行的。因此，我们处理 micro 队列这一步，会逐个执行队列中的任务并把它出队，直到队列被清空。`** 
* **`执行渲染操作，更新界面。`** 
* **`检查是否存在 Web worker 任务，如果有，则对其进行处理。`** 
* **`上述过程循环往复，直到两个队列都清空。`** 

**`我们总结一下，每一次循环都是一个这样的过程：`** 

**`当某个宏任务执行完后，会查看是否有微任务队列。如果有，先执行微任务队列中的所有任务，如果没有，会读取宏任务队列中排在最前的任务，执行宏任务的过程中，遇到微任务，依次加入微任务队列。栈空后，再次读取微任务队列里的任务，依次类推。`** 

接下来我们看个例子来介绍上面流程：

```javascript
Promise.resolve().then(() => {
    console.log("Promise1");
    setTimeout(() => {
        console.log("setTimeout2");
    }, 0)
});

setTimeout(() => {
    console.log("setTimeout1");
    Promise.resolve().then(() => {
        console.log("Promise2");
    });
}, 0);
```

**`最后输出结果是 Promise1，setTimeout1，Promise2，setTimeout2`** 

* **`一开始执行栈的同步任务（这属于宏任务）执行完毕，会去查看是否有微任务队列，上题中存在（有且只有一个），然后执行微任务队列中的所有任务输出 Promise1，同时会生成一个宏任务 setTimeout2。`** 
* **`然后去查看宏任务队列，宏任务 setTimeout1 在 setTimeout2 之前，先执行宏任务 setTimeout1，输出 setTimeout1。`** 
* **`在执行宏任务 setTimeout1 时会生成微任务 Promise2，放入微任务队列中，接着先去清空微任务队列中的所有任务，输出 Promise2。`** 
* **`清空完微任务队列中的所有任务后，就又会去宏任务队列取一个，这回执行的是 setTimeout2。`** 







# JavaScript 中的垃圾回收和内存泄漏



## 一、垃圾回收的必要性

**`由于字符串、对象和数组没有固定大小，所有当他们的大小已知时，才能对他们进行动态的存储分配。JavaScript 程序每次创建字符串、数组或对象时，解释器都必须分配内存来存储那个实体。只要像这样动态地分配了内存，最终都要释放那些内存以便他们能够被再用，否则，JavaScript 的解释器将会消耗完系统中所有可用的内存，造成系统崩溃。`** 

**`这段话解释了为什么需要系统需要垃圾回收，JavaScript 不像 C/C++，它有自己的一套垃圾回收机制。`** 

**`JavaScript 垃圾回收机制很简单：找出不再使用的变量，然后释放掉其占用的内存，但是这个过程不是时时的，因为其开销比较大，所以垃圾回收器会按照固定的时间间隔周期性的执行。`** 

```javascript
var a = "浪里行舟";
var b = "前端工匠";
var a = b;
```

**`这段代码运行之后，浪里行舟这个字符串失去了引用（之前是被 a 引用），系统检测到这个事实之后，就会释放该字符串的存储空间以便这些空间可以被再利用。`** 





## 二、垃圾回收机制

**`垃圾回收机制怎么知道，哪些内存不再需要？`** 

**`垃圾回收有两种方法：标记清除、引用计数。引用计数不太常用，标记清除较为常用。`** 



### 1. 标记清除

**`这是 JavaScript 中最常用的垃圾回收方式。当变量进入执行环境是就标记这个变量为进入环境。从逻辑上讲，永远不能释放进入环境的变量所占用的内存，因为只要执行流进入相应的环境，就可能会用到他们。当变量离开环境时，则将其标记为离开环境。`** 

**`垃圾收集器在运行的时候会给存储在内存中的所有变量都加上标记。然后，它会去掉环境中的变量以及被环境中的变量引用的标记。而在此之后再被加上标记的变量将被视为准备删除的变量，原因是环境中的变量已经无法访问到这些变量了。最后，垃圾收集器完成内存清除工作，销毁那些带标记的值，并回收他们所占用的内存空间。`** 

```javascript
var m = 0, n = 19; // 把 m, n, add() 标记为进入环境
add(m, n); // 把 a, b, c 标记为进入环境
console.log(n); // a, b, c 标记为离开环境，等待垃圾回收
function add(a, b) {
    a++;
    var c = a + b;
    return c;
}
```





### 2. 引用计数

**`所谓引用计数是指语言引擎有一张引用表，保存了内存里面所有的资源（通常是各种值）的引用次数。如果一个值的引用次数是 0，就表示这个值不再用到了，因此可以将这块内存释放。`** 

**`如果一个值不再需要了，引用数却不为 0，垃圾回收机制无法释放这块内存，从而导致内存泄漏。`** 

```javascript
var arr = [1, 2, 3, 4];

arr = [2, 4, 5];

console.log("浪里行舟");
```

**`上面代码中，数组 [1, 2, 3, 4] 是一个值，会占用内存。变量 arr 是仅有的对这个值的引用，因此引用次数为 1。尽管后面的代码没有用到 arr，它还是会持续占用内存。至于如何释放内存，我们下文介绍。`** 

**`第三行代码中，数组 [1, 2, 3, 4] 引用的变量 arr 又取得了另外一个值，则数组 [1, 2, 3, 4] 的引用次数就减 1，此时它引用次数变成 0，则说明没有办法再访问这个值了，因而就可以将其所占的内存空间给收回来。`** 

**`但是引用计数有个最大的问题：循环引用`** 

```javascript
function func() {
    let obj1 = {};
    let obj2 = {};
    
    obj1.a = obj2;
    obj2.a = obj1;
}
```

**`当函数 func 执行结束后，返回值为 undefined，所以整个函数以及内部的变量都应该被回收，但根据引用计数方法，obj1 和 obj2 的引用次数都不为 0，所以他们不会被回收。`** 

**`要解决循环引用问题，最好是在不使用它们的时候手工将它们设为空。上面的例子可以这么做：`** 

```javascript
obj1 = null;
obj2 = null;
```





## 三、哪些情况会引起内存泄漏？

**`虽然 JavaScript 会自动垃圾收集，但是如果我们的代码写法不当，会让变量一直处于进入环境的状态，无法被回收。下面列一下内存泄漏常见的几种情况：`** 



### 1. 意外的全局变量

```javascript
function foo(arg) {
    bar = "this is a hidden global variable";
}
```

**`bar 没被声明，会变成一个全局变量，在页面关闭之前不会被释放。`** 

**`另一种意外的全局变量可能由 this 创建：`** 

```javascript
function foo() {
    this.variable = "potential accidental global";
}

foo(); // foo 调用自己，this 指向了全局对象 window
```

**`在 JavaScript 文件头部加上 "use strict" ，可以避免此类错误发生。启用严格模式解析 JavaScript，避免意外的全局变量。`** 



### 2. 被遗忘的计时器或回调函数

```javascript
var someResource = getData();

setInterval(function() {
    var node = document.getElementById("Node");
    
    if (node) {
        node.innerHTML = JSON.stringify(someResource);
    }
}, 1000);
```

**`这样的代码很常见，如果 id 为 Node 的元素从 DOM 中移除，该定时器仍会存在，同时，因为回调函数中包含对 someResource 的引用，定时器外面的 someResource 也不会被释放。`** 



### 3. 闭包

```javascript
function bindEvent() {
    var obj = document.createElement("xxx");
    obj.onclick = function () {
        
    }
}
```

**`闭包可以维持函数内局部变量，使其得不到释放。上例定义事件回调时，由于是函数内定义函数，并且内部函数事件回调引用外部函数，形成了闭包。`** 

```javascript
function bindEvent() {
    var obj = document.createElement("xxx");
    obj.onclick = onclickHandler;
}

function onclickHandler() {}
```

```javascript
function bindEvent() {
    var obj = document.createElement("xxx");
    obj.onclick = function () {};
    obj = null;
}
```



### 4. 没有清理的 DOM 元素引用

**`有时，保存 DOM 节点内部数据结构很有用。假如你想快速更新表格的几行内容，把每一行 DOM 存成字典（JSON 键值对）或者数组很有意义。此时，同样的 DOM 元素存在两个引用：一个在 DOM 树中，另一个在字典中。将来你决定删除这些行时，需要把两个引用都清除。`** 

```javascript
var elements = {
    button: document.getElementById("button"),
    image: document.getElementById("image"),
    text: document.getElementById("text")
};

function doStuff() {
    image.src = "http://some.url/image";
    button.click();
    console.log(text.innerHTML);
}

function removeButton() {
    document.body.removeChild(document.getElementById("button"));
}
```

**`虽然我们用 removeChild 移除了 button，但是还在 elements 对象里保存着 #button 的引用，换言之，DOM 元素还在内存里面。`** 



## 四、内存泄漏的识别方法

**`新版本的chrome在 performance 中查看：`** 

**`步骤:`** 

- **`打开开发者工具 Performance`** 
- **`勾选 Screenshots 和 memory`** 
- **`左上角小圆点开始录制(record)`** 
- **`停止录制`** 



**`避免内存泄漏的一些方式：`** 

- **`减少不必要的全局变量，或者生命周期较长的对象，及时对无用的数据进行垃圾回收`** 
- **`注意程序逻辑，避免“死循环”之类的`** 
- **`避免创建过多的对象`** 

**`总而言之需要遵循一条原则：不用了的东西要及时归还`** 





## 五、垃圾回收的使用场景优化



### 1. 数组 array 优化

**`将 [] 赋值一个数组对象，是清空数组的捷径（例如：arr = []），但是需要注意的是，这种方式又创建了一个新的空对象，并且将原来的数组对象变成了一小片内存垃圾。实际上，将数组长度赋值为 0（arr.length = 0）也能达到清空数组的目的，并且同时能实现数组重用，减少内存垃圾的产生。`** 

```javascript
const arr = [1, 2, 3, 4, 5];

console.log("浪里行舟");

arr.length = 0;
```



### 2. 对象尽量复用

**`对象尽量复用，尤其是在循环等地方出现创建新对象，能复用就复用。不用的对象，尽可能设置为 null，尽快被垃圾回收掉。`** 

```javascript
var t = {};

for (var i = 0; i < 10; i++) {
    t.age = 19;
    t.name = "123";
    t.index = 1;
    
    console.log(t);
}

t = null; // 对象如果已经不用了，立即设置为 null，等待垃圾回收
```



### 3. 在循环中的函数表达式，能复用最好放到循环外面

```javascript
for (var k = 0; k < 10; k++) {
    var t = function (a) {
        console.log(a)
    }
    
    t(k);
}
```



```javascript
// 推荐用法
function t(a) {
    console.log(a);
}

for (var k = 0; k < 10; k++) {
    t(k);
}

t = null;
```







# DOM 事件机制



## 前言

本文主要介绍 DOM 事件级别、DOM 事件模型、事件流、事件代理和 Event 对象常见的应用，希望对你们有些帮助和启发！



## 一、DOM 事件级别

**`DOM 级别一共可以分为四个级别：DOM0级、DOM1级、DOM2级和 DOM3级。而 DOM 事件分为 3 个级别：DOM 0 级事件处理，DOM 2 级事件处理和 DOM 3 级事件处理。由于 DOM 1级中没有事件的相关内容，所以没有 DOM 1 级事件。`** 



### 1. DOM 0 级事件

**`el.onclick = function() {}`**

```javascript
var btn = document.getElementById("btn");

btn.onclick = function() {
    console.log(this.innerHTML);
}
```

**`当希望为同一个元素/标签绑定多个同类型事件的时候（如给上面的这个 btn 元素绑定 3 个点击事件），是不被允许的。DOM 0 级事件绑定，给元素的事件行为绑定方法，这些方法都是在当前元素事件行为的冒泡阶段（或者目标阶段）执行的。`**



### 2. DOM 2 级事件

**`el.addEventListener(event-name, callback, useCapture)`**

* **`event-name：事件名称，可以是标准的 DOM 事件`** 
* **`callback：回调函数，当事件触发时，函数会被注入要给参数为当前的事件对象 event`** 
* **`useCapture：默认是 false，代表事件句柄在冒泡阶段执行`** 

```javascript
var btn = document.getElementById("btn");

btn.addEventListener("click", test, false);

function test(e) {}
```



### 3. DOM 3 级事件

**`在 DOM 2 级事件的基础上添加了更多的事件类型。`** 

* **`UI 事件：当用户与页面上的元素交互时触发，如：load、scroll`** 
* **`焦点事件：当元素获得或失去焦点时触发，如 blur、focus`** 
* **`鼠标事件：当用户通过鼠标在页面执行操作时触发如：dblclick、mouseup`** 
* **`滚轮事件：当使用鼠标滚轮或类似设备时触发，如：mousewheel`** 
* **`文本事件：当在文档输入文本时触发，如：textInput`** 
* **`键盘事件：当用户通过键盘在页面上执行操作时触发，如：keydown、keypress`** 
* **`合成事件：当为 IME（输入法编辑器）输入字符时触发，如：compositionstart`** 
* **`变动事件：当底层 DOM 结构发生变化时触发，如：DOMsubtreeModified`** 
* **`同时 DOM3 级事件也允许使用者自定义一些事件。`** 





## 二、DOM 事件模型和事件流

**`DOM 事件模型分为捕获和冒泡。一个事件发生后，会在子元素和父元素之间传播。这种传播分成三个阶段。`**

**`(1) 捕获阶段：事件从 window 对象自上而下向目标节点传播的阶段`**

**`(2) 目标阶段：真正的目标节点正在处理事件的阶段`**

**`(3) 冒泡阶段：事件从目标节点自下而上向 window 对象传播的阶段`**



### DOM 事件捕获的具体流程

**`捕获从上到下，事件先从 window 对象，然后再到 document（对象），然后是 html 标签，然后是 body 标签，然后按照普通的 html 结构一层一层往下传，最后到达目标元素。`** 

**`而事件冒泡的流程刚好是事件捕获的逆过程。`** 

**`接下来我们看个事件冒泡的例子：`** 

```html
<div id="outer">
    <div id="inner"></div>
</div>

<script>
window.onclick = function() {
    console.log("window");
};
    
document.onclick = function() {
    console.log("document");
};
    
document.documentElement.onclick = function() {
    console.log("html");
};
    
document.body.onclick = function() {
    console.log("body");
}

outer.onclick = function(ev) {
    console.log("outer");
};

inner.onclick = function(ev) {
  console.log("inner");  
};   
</script>
```





## 三、事件代理（事件委托）

**`由于事件会在冒泡阶段向上传播到父节点，因此可以把子节点的监听函数定义在父节点上，由父节点的监听函数统一处理多个子元素的事件。这种方法叫做事件代理。`** 



### 1. 优点

* **`减少内存消耗，提高性能`** 

**`假设有一个列表，列表之中有大量的列表项，我们需要在点击每个列表项的时候响应一个事件

```html
<ul id="list">
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
    <li>item 4</li>
    <li>item 5</li>
</ul>
```

**`如果给每个列表项都绑定一个函数，那对于内存消耗来说是非常大的，效率上需要消耗很多性能。借助事件代理，我们只需要给父容器 ul 绑定方法即可，这样不管点击的是哪一个后代元素，都会根据冒泡传播的传递机制，把容器的 click 行为触发，然后把对应的方法执行，根据事件源，我们可以知道点击的是谁，从而完成不同的事。`** 

* **`动态绑定事件`** 

**`在很多时候，我们需要通过用户操作动态的增删列表项元素，如果一开始给每个子元素绑定事件，那么在列表发生变化时，就需要重新给新增的元素绑定事件，给即将删去的元素解绑事件，如果用事件代理就会省去很多这样的麻烦。`** 



### 2. 如何实现

**`接下来我们来实现上例中父层元素 #list 下的 li 元素的事件委托到它的父层元素上：`** 

```javascript
document.getElementById("list").addEventListener("click", function (e) {
    var event = e || window.event;
    var target = event.target || event.srcElement;
    
    if (target.nodeName.toLocaleLowerCase === "li") {
        console.log("the content is: ", target.innerHTML);
    }
})
```





## 四、Event 对象常见的应用

* **`event.preventDefault()`** 

**`如果调用这个方法，默认事件行为将不再触发。什么是默认事件呢？例如表单点击提交按钮（submit）跳转页面、a 标签默认页面跳转或是锚点定位等。`** 

**`很多时候我们使用 a 标签仅仅是想当做一个普通的按钮，点击实现一个功能，不想页面跳转，也不想锚点定位。`** 

```html
// 方法一：
<a href="javascript:;">链接</a>
```

**`也可以通过 JS 方法来阻止，给其 click 事件绑定方法，当我们点击 a 标签的时候，先触发 click 事件，其次才会执行自己的默认行为。`** 

```html
// 方法二：
<a id="test" href="http://www.cnblogs.com">链接</a>

<script>
test.onclick = function(e) {
    e = e || window.event;
    return false;
}
</script>
```

```html
// 方法三：
<a id="test" href="http://www.cnblogs.com">链接</a>

<script>
test.onclick = function(e) {
    e = e || window.event;
    e.preventDefault();
}
</script>
```

**`接下来我们看个例子：输入框最多只能输入六个字符，如何实现？`** 

```html
<input type="text" id="tempInp">

<script>
    tempInp.onkeydown = function(ev) {
        ev = ev || window.event;
        let val = this.value.trim();
        let len = val.length;
        
        if(len >= 6) {
            this.value = val.substr(0, 6);
            let code = ev.which || ev.keyCode;
            if (!/^(46|8|37|38|39|40)$/.test(code)) {
                ev.preventDefault();
            }
        }
    }
</script>
```



* **`event.stopPropagation() & event.stopImmediatePropagation()`** 

**`event.stopPropagation() 方法阻止事件冒泡到父元素，阻止任何父事件处理程序被执行。上面提到事件冒泡阶段是指事件从目标节点自下而上向 window 对象传播的阶段。`**

**`我们在例3 的 inner 元素 click 事件上，添加 event.stopPropagation() 这句话后，就阻止了父事件的执行，最后只打印了 inner`**

```javascript
inner.onclick = function(ev) {
    console.log("inner");
    ev.stopPropagation();
};
```

**`stopImmediatePropagation 既能阻止事件向父元素冒泡，也能阻止元素同事件类型的其他监听器被触发。而 stopPropagation 只能实现前者的效果。我们来看个例子：`**

```html
<body>
    <button id="btn">Click me to stop propagation</button>
</body>

<script>
const btn = document.querySelector("#btn");
btn.addEventListener("click", event => {
    console.log("btn click 1");
    event.stopImmediatePropagation();
});
    
btn.addEventListener("click", event => {
    console.log("btn click 2");
});
    
document.body.addEventListener("click", () => {
    console.log("body click");
});
</script>
```

**`如上所示，使用 stopImmediatePropagation 后，点击按钮时，不仅 body 绑定事件不会触发，与此同时按钮的另一个点击事件也不触发。`**

* **`event.target & event.currentTarget`** 

**`老实说这两者的区别，并不好用文字描述，我们先来看个例子：`** 

```html
<div id="a">
    <div id="b">
        <div id="c">
            <div id="d"></div>
        </div>
    </div>
</div>

<script>
    document.getElementById("a").addEventListener("click", function(e) {
        console.log("target: " + e.target.id + "&currentTarget: " + e.currentTarget.id);
    })
    
    document.getElementById("b").addEventListener("click", function(e) {
         console.log("target: " + e.target.id + "&currentTarget: " + e.currentTarget.id);
    }) 
    
    document.getElementById("c").addEventListener("click", function(e) {
        console.log("target: " + e.target.id + "&currentTarget: " + e.currentTarget.id);
    }) 
    
    document.getElementById("d").addEventListener("click", function(e) {
        console.log("target: " + e.target.id + "&currentTarget: " + e.currentTarget.id);
    })
    
</script>
```

**`当我们点击最里层的元素 d 的时候，会依次输出：`** 

target:d&currentTarget:d

target:d&currentTarget:c

target:d&currentTarget:b

target:d&currentTarget:a

**`从输出中我们可以看到，event.target 指向引起触发事件的元素，而 event.currentTarget 则是事件绑定的元素，只有被点击的那个目标元素的 event.target 才会等于 event.currentTarget。也就是说，event.currentTarget 始终是监听事件者，而 event.target 是事件的真正发出者。`** 













# 九种跨域方式实现原理



## 一、什么是跨域？



### 1. 什么是同源策略及其限制内容？



### 2. 常见跨域场景





## 二、跨域解决方案



### 1. jsonp



#### 1. JSONP 原理

**`利用 <script> 标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的 JSON 数据。JSON 请求一定需要对方的服务器做支持才可以。`**



#### 2. JSONP 和 AJAX 对比

**`JSONP 和 AJAX 相同，都是客户端向服务器端发送请求，从服务器端获取数据的方式。但 AJAX 属于同源策略，JSONP 属于非同源策略（跨域请求）。`** 



#### 3. JSONP 优缺点

**`JSONP 优点是简单兼容性好，可用于解决主流浏览器的跨域数据访问的问题。缺点是仅支持 get 方法具有局限性，不安全可能会遭受 XSS 攻击。`** 



#### 4. JSONP 的实现流程

* **`声明一个回调函数，其函数名（如 show）当做参数值，要传递给跨域请求数据的服务器，函数形参要获取目标数据（服务器返回的 data）。`** 
* **`创建一个 <script> 标签，把那个跨域的 API 数据接口地址，赋值给 script 的 src，还要在这个地址中向服务器传递该函数名（可以通过问号传参 ?callback=show）。`** 
* **`服务器接收到请求后，需要进行特殊的处理：把传递进来的函数名和它需要给你的数据拼接成一个字符串。例如：传递进去的函数名是 show，它准备好的数据是 show("我不爱你")。`** 
* **`最后服务器把准备的数据通过 HTTP 协议返回给客户端，客户端再调用执行之前声明的回调函数（show），对返回的数据进行操作。`** 

**`在开发中可能会遇到多个 JSONP 请求的回调函数名是相同的，这时候就需要自己封装一个 JSONP 函数`**。

```javascript
function jsonp({ url, params, callback }) {
    return new Promise((resolve, reject) => {
        
        let script = document.createElement("script");
        
        window[callback] = function(data) {
            resolve(data);
            document.body.removeChild(script);
        }
        
        params = { ...params, callback };
        
        let arrs = [];
        for (let key in params) {
            arrs.push(`${key}=${params[key]}`);
        }
        
        script.src = `${url}?${arrs.join("&")}`;
        
        document.body.appendChild(script);
    })
}

jsonp({
    url: "http://localhost:3000/say",
    params: { wd: "Iloveyou" },
    callback: "show"
}).then(data => {
    console.log(data);
})
```

**`上面这段代码相当于向 http://localhost:3000/say?wd=Iloveyou&callback=show 这个地址请求数据，然后后台返回 show("我不爱你")，最后会运行 show() 这个函数，打印出我不爱你`** 

```javascript
let express = require("express");
let app = express();
app.get("/say", function(req, res) {
    let { wd, callback } = req.queryl
    console.log(wd); // Iloveyou
    console.log(callback); // show
    res.end(`${callback}("我不爱你")`);
});

app.listen(3000);
```





### 2. cors





### 3. postMessage





### 4. websocket



### 5. node 中间件代理



### 6. nginx 反向代理





### 7. window.name + iframe





### 8. location.hash + iframe





### 9. document.domain + iframe


