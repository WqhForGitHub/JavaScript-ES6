# 1. 语法

ECMAScript 的语法很大程度上借鉴了 C 语言和其他类 C 语言，如 Java 和 Perl。熟悉这些语言的开发者应该很容易理解 ECMAScript 宽松的语法。

## 1. 区分大小写

首先要知道的是，ECMAScript 中一切都区分大小写。无论变量、函数名还是操作符，都区分大小写。换句话说，变量 test 和变量 Test 是两个不同的变量。类似地，typeof 不能作为函数名，因为它是一个关键字（后面会介绍）。但 Typeof 是一个完全有效的函数名。

<br>

## 2. 标识符

所谓标识符，就是变量、函数或函数参数的名称。标识符可以由一个或多个下列字符组成：

* 第一个字符必须是字母、下划线（_）或美元符号（$）
* 其他字符可以是字母、下划线、美元符号或数字

标识符中的字母可以是扩展 ASCII（extended ASCII）中的字母，也可以是 Unicode 的字母字符。

按照惯例，ECMAScript 标识符使用驼峰大小写形式，即第一个单词 的首字母小写，后面每个单词的首字母大写，如：

```javascript
firstSecond
myCar
doSomethingImportant
```

虽然这种写法并不是强制性的，但因为这种形式跟 ECMAScript 内置函数和对象的命名方式一致，所以算是最佳实践。

>注意
>
>关键字、保留字、true、false 和 null 不能作为标识符。具体内容请参考 3.2 节。

<br>

## 3. 注释

ECMAScript 采用 C 语言风格的注释，包括单行注释和块注释。单行注释以两个斜杠字符（//）开头，如：

```javascript
// 单行注释
```

块注释以一个斜杠和一个星号（/*）开头，以它们的反向组合（`*/`）结尾，如：

```javascript
/* 这是多行
注释 */
```

<br>

## 4. 严格模式

ECMAScript 5 增加了严格模式（strict mode）的概念。严格模式是一种不同的 JavaScript 解析和执行模型，在这种模型下 ECMAScript 3 的一些不规范写法会被指出来，而不安全的操作将抛出错误。要对整个脚本启用严格模式，在脚本开头加上这一行：

```javascript
"use strict";
```

虽然看起来像没有赋值给任何变量的字符串，但它其实是一个编译指令（pragma）。任何支持的 JavaScript 引擎看到它都会切换到严格模式。选择这种语法形式的目的是不破坏 ECMAScript 3 语法。

也可以单独指定一个函数在严格模式下执行，只要把这个预处理指令放到函数体开头即可：

```javascript
function doSomething() {
    "use strict";
    // 函数体
}
```

严格模式实际上是一种假定的现代 JavaScript 应有的程序形式。ES6 模块和类不需要 "use strict" 指令就自动应用严格模式。另外，webpack 等现代的代码编译器和打包器也会自动插入这个指令。

<br>

## 5. 语句

ECMAScript 中的语句以分号结尾。省略分号意味着由解析器确定语句在哪里结尾，如下面的例子所示：

```javascript
let sum = a + b; // 没有分号也有效，但不推荐
let diff = a - b; // 有效，推荐加分号
```

即使语句末尾的分号不是必需的，也应该加上。加分号有助于防止省略造成的问题，比如不会补足你输入的内容，从而便于开发者通过删除空白符来压缩代码（如果没有结尾的分号，则删除空行可能会导致语法错误）。加分号也有助于在某些情况下提升性能，因为否则解析器会尝试在合适的位置补上分号以纠正语法错误。

多条语句可以合并到一个 C 语言风格的代码块中。代码块由一个左花括号（{）标识开始，一个右花括号（}）标识结束：

```javascript
if (test) {
    test = false;
    console.log(test);
}
```

if 之类的控制语句只在执行多条语句时要求必须有代码块。不过，最佳实践是始终在控制语句中使用代码块，即使要执行的只有一条语句，如下例所示：

```javascript
// 有效，但容易导致错误，应该避免
if (test) 
    console.log(test);

// 推荐
if (test) {
    console.log(test);
}
```

在控制语句中使用代码块可以让内容更清晰，在需要修改代码时也可以减少出错的可能性。

<br>

# 2. 关键字与保留字

ECMA-262 描述了一组保留的关键字，这些关键字有特殊用途，比如表示控制语句的开始和结束，或者执行特定的操作。按照规定，保留的关键字不能用作标识符或属性名。ECMA-262 规定的所哟关键字如下：

await				break				case				catch				class				const 				continue

debugger			default			      delete			     do				     else				 export	

extends			   false				  finally			      for				    function			  if					import

in				      instanceof		        new				 null				   return			    super				 switch

this				   throw			        true				 try				     typeof			    var	          void            while

with				  yield



规范中也描述了一组未来的保留字，同样不能用作标识符或属性名。虽然保留字在语言中没有特定用途，但它们是保留给将来左关键字用的。

以下是 ECMAScript-262 为将来保留的所有词汇。

始终保留：

enum



严格模式下保留：

arguments eval implements interface package private protected public static

<br>

# 3. 变量

ECMAScript 变量是松散类型的，意思是变量可以用于保存任何类型的数据。每个变量只不过是一个用于保存任意值的命名占位符。有 3 个关键字可以声明变量：var、const 和 let。

## 1. var 关键字

要定义变量，可以使用 var 操作符（注意 var 是一个关键字），后跟变量名（即标识符，如前所述）：

```javascript
var message;
```

这行代码定义了一个名为 message 的变量，可以用它保存任何类型的值。（不初始化的情况下，变量会保存一个特殊值 undefined，下一节讨论数据类型时会谈到。）ECMAScript 执行变量初始化，因此可以同时定义变量并设置它的值：

```javascript
var message = "hi";
```

这里，message 被定义为一个保存字符串值 hi 的变量。像这样初始化变量不会将它标识为字符串类型，只是一个简单的赋值而已。随后，不仅可以改变保存的值，也可以改变值的类型：

```javascript
var message = "hi";
message = 100; // 合法，但不推荐
```

在这个例子中，变量 message 首先被定义为一个保存字符串值 hi 的变量，然后又被重写为保存数值 100。虽然不推荐改变变量保存值的类型，但这在 ECMAScript 中是完全有效的。

<br>

### 1. var 声明作用域

需要注意的是，使用 var 操作符定义的变量会成为包含它的函数的局部变量。比如，使用 var 在一个函数内部定义一个变量，就意味着该变量将在退出时被销毁：

```javascript
function test() {
    var message = "hi"; // 局部变量
}
test();
console.log(message); // 出错！
```

这里，message 变量是在函数内部使用 var 定义的。函数叫 test()，调用它会创建这个变量并给它赋值。调用之后变量随即被销毁，因此示例中的最后一行会导致错误。然而，在函数内定义变量时省略 var 操作符是可以创建全局变量的：

```javascript
function test() {
    message = "hi"; // 全局变量
}
test();
console.log(message); // "hi"
```

去掉之前的 var 操作符之后，message 就变成了全局变量。只要调用一次函数 test()，就会定义这个变量，并且可以在函数外部访问它。

>注意
>
>虽然可以通过省略 var 操作符定义全局变量，但不推荐这么做。在局部作用域中定义的全局变量很难维护，也会造成困惑。这是因为不能一下子断定省略 var 是不是有意为之。在严格模式下，如果像这样给未声明的变量赋值，则会导致抛出 ReferenceError。

如果需要定义多个变量，可以在一条语句中用逗号分隔每个变量（及可选的初始化）：

```javascript
var message- "hi",
    found = false,
    age = 29;
```

这里定义并初始化了 3 个变量。因为 ECMAScript 是松散类型的，所以使用不同数据类型初始化的变量可以用一条语句来声明。插入换行和空格缩进并不是必需的，但这样有利于阅读理解。

在严格模式下，不能定义名为 eval 和 arguments 的变量，否则会导致语法错误。

<br>

### 2. var 声明提升

使用 var 时，下面的代码不会报错。这是因为使用这个关键字声明的变量会自动提升到函数作用域顶部：

```javascript
function foo() {
    console.log(age);
    var age = 26;
}
foo(); // undefined
```

之所以不会报错，是因为 ECMAScript 运行时把它看成等价于如下代码：

```javascript
function foo() {
    var age;
    console.log(age);
    age = 26;
}
foo(); // undefined
```

这就是所谓的提升（hoist），也就是把所有变量声明都拉到函数作用域的顶部。此外，反复多次使用 var 声明同一个变量也没有问题：

```javascript
function foo() {
    var age = 16;
    var age = 26;
    var age = 36;
    console.log(age);
}
foo(); // 36
```

<br>

## 2. let 声明

let 跟 var 的作用差不多，但有着非常重要的区别。最明显的是 let 声明的范围是块作用域，而 var 声明的范围是函数作用域。

```javascript
if (true) {
    var name = "Bob";
    console.log(name); // Bob
}
console.log(name); // Bob

if (true) {
    let age = 26;
    console.log(age); // 26
}
console.log(age); // ReferenceError: age 没有定义
```

在这里，age 变量之所以不能再 if 块外部使用，是因为它的作用域仅限于该代码块内部。块作用域是函数作用域的子集，因此适用于 var 的作用域限制同样也适用于 let。

let 也不允许同一个块作用域中出现冗余声明。这样会导致报错：

```javascript
var name;
var name;
let age;
let age; // SyntaxError: 标识符 age 已经声明过了
```

JavaScript 引擎会记录作为变量声明的标识符及声明它的块作用域，因此嵌套使用相同的标识符不会报错，因为同一个块中没有重复声明：

```javascript
var name = "Alice";
console.log(name); // "Alice"
if (true) {
    var name = "Bob";
    console.log(name); // "Bob"
}

let age = 30;
console.log(age); // 30
if (true) {
    let age = 26;
    console.log(age); // 26
}
```

对声明冗余报错不会因混用 let 和 var 而受影响。这两个关键字声明的病不是不同类型的变量，而只是指出变量在相关作用域中是否存在。

```javascript
var name;
let name; // SyntaxError

let age;
var age; // SyntaxError
```

<br>

### 1. 暂时性死区

let 与 var 的另一个重要的区别，就是 let 声明的变量不会在作用域中被提升。

```javascript
// name 会被提升
console.log(name); // undefined
var name = "Bob";

// age 不会被提升
console.log(age); // ReferenceError: age 没有定义
let age = 26;
```

在解析代码时，JavaScript 引擎也会注意出现在块后面的 let 声明，只不过子在此之前不能以任何方式来使用未声明的变量。在 let 声明之前的执行瞬间被称为暂时性死区（temporal dead zone），在此阶段使用任何后面才声明的变量都会抛出 ReferenceError。

<br>

### 2. 全局声明

与 var 关键字不同，使用 let 在全局作用域中声明的变量不会像 var 声明的变量那样成为 window 对象的属性。

```javascript
var name = "Bob";
console.log(window.name); // "Bob"

let age = 26;
console.log(window.age); // undefined
```

不过，let 声明仍然是在全局作用域中发生的，相应变量会在页面的生命周期内存续。因此，为了避免 SyntaxError，必须确保页面不会声明同一个变量。

<br>

### 3. 条件声明

在使用 var 声明变量时，由于声明会被提升，JavaScript 引擎会顺便将多余的声明在作用域顶部合并为一个声明。因为 let 的作用域被限定在块中，所以不可能检查前面是否已经使用 let 声明过同名变量并在没有声明的情况下声明它（条件式声明）。

```html
<script>
    var name = "Alice";
    let age = 26;
</script>

<script>
    // 假设脚本不确定页面中是否已经声明了同名变量
    // 那它可以假设还没有声明过
    
    var name = "Bob";
    // 这里没问题，因为这个声明会被提升
    // 不需要检查之前是否声明过同名变量
    
    let age = 36;
    // 如果之前声明过 age，这里会报错
</script>
```

使用 try/catch 语句或 typeof 操作符也不行，因为条件块中 let 声明的作用域会被限制在该块中。

```html
<script>
    let name = "Alice";
    let age = 36;
</script>

<script>
    // 假设脚本不确定页面中是否已经声明了同名变量
    // 那它可以假设还没有声明过
    
    if (typeof name === "undefined") {
        let name;
    }
    // name 被限制在 if {} 块的作用域内
    // 因此这个赋值形同全局赋值
    name = "Bob";
    
    try {
        console.log(age); // 如果没有声明过 age，则会报错
    } catch(error) {
        let age;
    }
    // age 被限制在 catch {} 块的作用域内
    // 因此这个赋值形同全局赋值
    age = 26;
</script>
```

为此，不能依赖条件声明模式。

>注意
>
>不能使用 let 进行条件式声明是件好事，因为条件声明式一种反模式，它让程序变得更难理解。如果你发现自己在使用这个模式，那一定有更好的替代方式。











































