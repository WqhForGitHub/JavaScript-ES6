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

<br>

### 4. for 循环中的 let 声明

在 let 出现之前，for 循环定义的迭代变量会泄露到循环体外部：

```javascript
for (var i = 0; i < 5; ++i) {
    // 循环逻辑
}
console.log(i); // 5
```

改成使用 let 之后，这个问题就不存在了，因为迭代变量的作用域仅限于 for 循环块内部：

```javascript
for (let i = 0; i < 5; ++i) {
    // 循环逻辑
}
console.log(i); // ReferenceError: i 没有定义
```

在使用 var 的时候，一个常见问题就是对迭代变量不可思议的声明及修改：

```javascript
for (var i = 0; i < 5; ++i) {
    setTimeout(() => console.log(i), 0);
}
// 你可能会以为会输出 0、1、2、3、4
// 实际上会输出 5、5、5、5、5
```

之所以会这样，是因为在退出循环时，迭代变量保存的已经是导致循环退出的值：5。在之后执行超时逻辑时，所有的 i 都是同一个变量，因而输出的都是同一个最终值。

而在使用 let 声明迭代变量时，JavaScript 引擎会在后台为每次迭代循环声明一个新的迭代变量。这样每个 setTimeout 引用的都是不同的变量 i 的实例，所以 console.log 输出的才是我们期望的值，也就是循环过程中每个迭代变量的值。

```javascript
for (let i = 0; i < 5; ++i) {
    setTimeout(() => console.log(i), 0);
}
// 会输出 0、1、2、3、4
```

这种每次迭代都声明一个变量实例的行为适用于所有 for 循环，包括 for-in 和 for-of。

<br>

## 3. const 声明

const 的行为与 let 基本相同，唯一一个重要的区别是用它声明变量时必须同时初始化变量，且尝试修改 const 声明的变量会导致运行时错误。

```javascript
const age = 26;
age = 36; // TypeError: 给常量赋值

// const 也不允许重复声明
const name = "Bob";
const name = "Alice"; // SyntaxError

// const 声明的作用域也是块
const name = "Bob";
if (true) {
    const name = "Alice";
}
console.log(name); // Bob
```

const 声明的限制只适用于它指向的变量的引用。换句话说，如果 const 变量引用的是一个对象，那么修改这个对象内部的属性并不违反 const 的限制。

```javascript
const person = {};
person.name = "Bob"; // ok
```

即使 JavaScript 引擎会为 for 循环中的 let 分别创建独立的变量实例，即使 const 变量跟 let 变量很相似，也不能用 const 来声明迭代变量（因为迭代变量会自增）：

```javascript
for (const i = 0 ; i < 10; ++i) {} // TypeError: 给常量赋值
```

不过，如果你只想用 const 声明一个不会被修改的 for 循环变量，那是可以的。也就是说，每次迭代只是创建一个新变量。这对 for-of 和 for-in 循环再合适不过了：

```javascript
let i = 0;
for (const j = 7; i < 5; ++i) {
    console.log(j);
}
// 7, 7, 7, 7, 7

for (const key in { a: 1, b: 2 }) {
    console.log(key);
}
// a, b

for (const value of [1, 2, 3, 4, 5]) {
    console.log(value);
}
// 1, 2, 3, 4, 5
```

<br>

## 4. 声明风格及最佳实践

ECMAScript 6 增加 let 和 const 从客观上让这门语言能够更精确地声明作用域和表达语义。行为怪异地 var 所造成地各种问题，已经令整个 JavaScript 社区苦恼多年。随着这两个新关键字的出现，新的有助于提升代码质量的最佳实践也逐渐显现。

### 1. 不使用 var

有了 let 和 const，大多数开发者会发现自己不再需要 var 了。限制自己只使用 let 和 const 有助于提升代码的质量，因为变量有了明确的作用域、声明位置，以及不变的值。

<br>

### 2. 先 const 再 let

使用 const 声明可以让浏览器运行时强制保持变量的值不变，也可以让静态代码分析工具提前发现不合法的赋值操作。因此，很多开发者认为应该优先使用 const 来声明变量，只在提前知道未来会有修改时再使用 let。这样可以让开发者更有信息地推断某些变量地值永远不会变，同时也能迅速发现因意外赋值导致地非预期行为。

<br>

# 4. 数据类型

ECMAScript 有 7 种简单数据类型（也称为原始类型）：Undefined、Null、Boolean、Number、BigInt、String 和 Symbol。还有一种复杂数据类型叫 Object（对象），是一个无序名值对的集合。因为在 ECMAScript 中不能定义自己的数据类型，所有值都可以用上述 8 种数据类型之一来表示。只有 8 种数据类型似乎不足以表示全部数据。但 ECMAScript 中不能定义自己的数据类型，所有值都可以用上述 8 种数据类型之一来表示。只有 8 种数据类型似乎不足以表示全部数据。但 ECMAScript 的数据类型很灵活，一种数据类型可以当作多种数据类型来使用。

## 1. typeof 操作符

因为 ECMAScript 的类型系统是松散的，所以需要一种手段来确定任意变量的数据类型。typeof 操作符就是为此而生的。对一个值使用 typeof 操作符会返回下列字符串之一：

* "undefined" 表示值未定义
* "boolean" 表示值为布尔值
* "string" 表示值为字符串
* "number" 表示值为数值
* "object" 表示值为对象（而不是函数）或 null
* "function" 表示值为函数
* "symbol" 表示值为符号
* "bigint" 表示值为大整数

下面是使用 typeof 操作符的例子：

```javascript
let message = "some string";
console.log(typeof message); // "string"
console.log(typeof(message)); // "string"
console.log(typeof 95); // "number"
```

在这个例子中，我们把一个变量（message）和一个数值字面量传给了 typeof 操作符。注意，因为 typeof 是一个操作符而不是函数，所以不需要参数（但可以使用参数）。

注意 typeof 在某些情况下返回的结果可能会让人费解，但技术上讲还是正确的。比如，调用 typeof null 返回的是 "object"。这是因为特殊值 null 被认为是一个对空对象的引用。

>注意
>
>严格来讲，函数在 ECMAScript 中被认为是对象，并不代表一种数据类型。可是，函数也有自己特殊的属性。为此，就有必要通过 typeof 操作符来区分函数和其他对象。

<br>

## 2. Undefined 类型

Undefined 类型只有一个值，就是特殊值 undefined。当使用 var 或 let 声明了变量但没有初始化时，就相当于给变量赋予了 undefined 值：

```javascript
let message;
console.log(message == undefined); // true
```

在这个例子中，变量 message 在声明的时候并未初始化。而在比较它和 undefined 的字面值时，两者是相等的。这个例子等同于如下示例：

```javascript
let message = undefined;
console.log(message == undefined); // true
```

这里，变量 message 显式地以 undefined 来初始化。但这是不必要的，因为默认情况下，任何未经初始化的变量都会取得 undefined 值。

>注意
>
>一般来说，永远不会显式地给某个变量设置 undefined 值。字面值 undefined 主要用于比较，而且在 ECMA-262 第 3 版之前是不存在地。增加这个特殊值地目的就是为了正式明确空对象指针（null）和未初始化变量的区别。

注意，包含 undefined 值的变量跟未定义是有区别的。请看下面的例子：

```javascript
let message; // 这个变量被声明了，但值为 undefined

// 确保没有声明过这个变量
// let age

console.log(message); // "undefined"
console.log(age); // 报错
```

在上面的例子中，第一个 console.log 会输出变量 message 的值，即 "undefined"。而第二个 console.log 要输出一个未声明的变量 age 的值，因此会导致报错。对未声明的变量，只能执行一个有用的操作就是对它调用 typeof。（对未声明的变量调用 delete 也不会报错，但这个操作没什么用，实际上在严格模式下会抛出错误。）

在对未初始化的变量调用 typeof 时，返回的结果是 "undefined"，但对未声明的变量调用它时，返回的结果还是 "undefined"，这就有点让人看不懂了。比如下面的例子：

```javascript
let message; // 这个变量被声明了，只是值为 undefined

// 确保没有声明过这个变量
// let age

console.log(typeof message); // "undefined"
console.log(typeof age); // "undefined"
```

无论声明还是未声明，typeof 返回的都是字符串 "undefined"。逻辑上讲这是对的，因为虽然严格来讲这两个变量存在根本性差异，但对它们都无法执行实际操作。

>注意
>
>即使未初始化的变量会被自动赋予 undefined 值，但我们仍然建议在声明变量的同时进行初始化。这样，当 typeof 返回 "undefined" 时，你就会知道那是因为给定的变量尚未声明，而不是声明了但未初始化。

undefined 是一个假值。因此，如果需要，可以用更简洁的方式检测它。不过要记住，也有很多其他可能的值同样是假值。所以一定要明确自己想检测的就是 undefined 这个字面值，而不仅仅是假值。

```javascript
let message; // 这个变量被声明了，但值为 undefined
// age 没有声明

if (message) {
    // 这个块不会执行
}

if (!message) {
    // 这个块会执行
}

if (age) {
    // 这里会报错
}
```

<br>

## 3. Null 类型

Null 类型同样只有一个值，即特殊值 null。逻辑上讲，null 值表示一个空对象指针，这也是给 typeof 传一个 null 会返回 "object" 的原因：

```javascript
let car = null;
console.log(typeof car); // "object"
```

在定义将来要保存对象值得变量时，建议使用 null 来初始化，不要使用其他值。这样，只要检查这个变量的值是不是 null 就可以知道这个变量是否在后来被重新赋予了一个对象的引用，比如：

```javascript
if (car != null) {
    // car 是一个对象的引用
}
```

undefined 值是由 null 值派生而来的，因此 ECMA-262 将它们定义为表面上相等，如下面的例子所示：

```javascript
console.log(null == undefined); // true
```

用等于操作符（==）比较 null 和 undefined 始终返回 true。但要注意，这个操作数会为了比较而转换它的操作数（本章后面将详细介绍）。

即使 null 和 undefined 有关系，它们的用途也是完全不一样的。如前所述，永远不必显式地将变量值设置为 undefined。但 null 不是这样地。任何时候，只要变量要保存对象，而当时又没有哪个对象可保存，就要用 null 来填充该变量。这样就可以保持 null 是空对象指针的语义，并进一步将其与 undefined 区分开来。

null 是一个假值。因此，如果需要，可以用简洁的方式检测它。不过要记住，也有很多其他可能的值同样是假值。所以一定要明确自己想检测的就是 null 这个字面值，而不仅仅是假值。

```javascript
let message = null;
let age;

if (message) {
    // 这个块不会执行
}

if (!message) {
    // 这个块会执行
}

if (age) {
    // 这个块不会执行
}

if (!age) {
    // 这个块会执行
}
```

<br>

## 4. Boolean 类型

Boolean（布尔值）类型是 ECMAScript 中使用最频繁的类型之一，它有两个字面值：true 和 false。这两个布尔值不同于数值，因此 true 不等于 1，false 不等于 0。下面是给变量赋布尔值的例子：

```javascript
let found = true;
let lost = false;
```

注意，布尔值字面量 true 和 false 是区分大小写的，因此 True 和 False（及其他大小混写形式）是有效的标识符，但不是布尔值。

虽然布尔值只有两个，但所有其他 ECMAScript 类型的值都有相应布尔值得等价形式。要将一个其他类型得值转换为布尔值，可以调用特定的 Boolean() 转型函数：

```javascript
let message = "Hello world!";
let messageBoolean = Boolean(message);
```

在这个例子中，字符串 message 会被转换为布尔值并保存在变量 messageAsBoolean 中。Boolean() 转型函数可以在任何类型的数据上调用，而且始终返回一个布尔值。什么值能转换为 true 或 false 的规则取决于数据类型和实际的值。下表总结了不同类型与布尔值之间的转换规则。

| 数据类型  | 转换为 true 的值       | 转换为 false 的值            |
| --------- | ---------------------- | ---------------------------- |
| Boolean   | true                   | false                        |
| String    | 非空字符串             | ""（空字符串）               |
| Number    | 非零数值（包括无穷值） | 0、NaN（参见后面的相关内容） |
| Object    | 任意对象               | null                         |
| Undefined | N/A（不存在）          | undefined                    |

理解以上转换非常重要，因为像 if 等流控制语句会自动执行其他类型值到布尔值的转换，例如：

```javascript
let message = "Hello world!";
if (message) {
    console.log("Value is true");
}
```

在这个例子中，console.log 会输出字符串 "Value is true"，因为字符串 message 会被自动转换为等价的布尔值 true。由于存在这种自动转换，理解流控制语句中使用的是什么变量就非常重要。错误地使用对象而不是布尔值会明显改变应用程序的执行流。

<br>

## 5. Number 类型

ECMAScript 中的 Number 类型使用 IEEE 754 格式表示整数和浮点值（在某些语言中也叫双精度值）。不同的数值类型相应地也有不同地数值字面量格式。

最基本的数值字面量格式是十进制整数，直接写出来即可：

```javascript
let intNum = 55; // 整数
```

整数也可以用二进制（以 2 为基数）、八进制（以 8 为基数）或十六进制（以 16 为基数）字面量表示。二进制字面量的前缀 0b 后面必须是一系列 1 和 0：

```javascript
let binaryNum1 = 0b110; // 二进制的 6
let binaryNum2 = 0b333; // 无效的二进制值，SyntaxError
```

八进制字面量可以隐式或显式地定义。隐式声明地第一个数字必须是零（0），然后是相应地八进制数组（数值 0~7）。如果字面量中包含的数字超出了范围，就会忽略前缀的零，后面的数字序列会被当成十进制数，如下所示：

```javascript
let octalNum1 = 070; // 八进制的 56
let octalNum2 = 079; // 无效的八进制值，当成 79 处理
```

八进制字面量也可以显式定义，此时要加上 0o 前缀：

```javascript
let octalNum3 = 0o70; // 八进制的 56
let octalNum4 = 0o79; // 无效的八进制值，SyntaxError
```

八进制字面量的隐式声明声明在严格模式下是无效的，会导致 JavaScript 引擎抛出语法错误。要创建十六进制字面量，必须使用前缀 0x（区分大小写），然后跟十六进制数字（0~9 以及 A~F）。十六进制数字中的字母大小写均可。下面是几个例子：

```javascript
let hexNum1 = 0xA; // 十六进制 10
let hexNum2 = 0x1f; // 十六进制 31
```

使用二进制、八进制和十六进制格式创建的数值在所有数学操作中都被视为十进制数值。

>注意
>
>由于 JavaScript 保存数值的方式，实际上可能存在正零（+0）和负零（-0）。正零和负零在所有情况下都被认为是等同的，这里特地说明一下。

<br>

### 1. 浮点值

要定义浮点值，数值中必须包含小数点，而且小数点后面必须至少有一个数字。虽然小数点前面不是必须有整数，但推荐加上。下面是几个例子：

```javascript
let floatNum1 = 1.1;
let floatNum2 = 0.1;
let floatNum3 = .1; // 有效，但不推荐
```

对于非常大或非常小的数值，浮点值可以用科学记数法来表示。科学记数法用于表示一个应该乘以 10 的给定次幂的数值。ECMAScript 中科学记数法的格式要求是一个数值（整数或浮点数）后跟一个大写或小写的字母 e，再加上一个要乘的 10 的多少次幂。比如：

```javascript
let floatNum = 3.125e7; // 等于 31250000
```

在这个例子中，floatNum 等于 31250000，只不过科学记数法显得更简洁。这种表示法实际上相当于说以 3.125 作为系数，乘以 10 的 7 次幂。

科学记数法也可以用于表示非常小的数值，例如 0.000000000000000003。这个数值用科学记数法可以表示为 3e-17。默认情况下 ECMAScript 会将小数点后至少包含 6 个零的浮点值转换为科学记数法（例如，0.0000003 会被转换为 3e-7）。

浮点值的精确度最高可达 17 位小数，但在算术计算中远不如整数精确。例如，0.1 加 0.2 得到的不是 0.3，而是0.30000000000000004。由于这种微笑的舍入错误，导致很难测试特定的浮点值。比如下面的例子：

``` javascript
// 别这么干
if (a + b == 0.3) {
    console.log("You got 0.3.");
}
```

这里检测两个数值之和是否等于 0.3。如果两个数值分别是 0.05 和 0.25，或者 0.15 和 0.15。那没问题。但如果是 0.1 和 0.2，如前所述，测试将失败。因此永远不要测试某个特定的浮点值。

>注意
>
>之所以存在这种舍入错误，是因为使用了 IEEEE 754 数值，这种错误并非 ECMAScript 所独有。其他使用相同格式的语言也有这个问题。

<br>

### 2. 数字分隔符

所有数值都可以使用下划线作为数字分隔符以增进可读性。下划线在数值字面量中可以出现任意次，解释器会静默地忽略它们，比如：

```javascript
let oneMillion = 1_000_000;
let binary = 0b0100_0000;
let float = 1_000.000_001;
```

作为分隔符地下划线不能出现在数值字面量地开头或末尾，不能紧挨着小数点，前面也不能有打头儿的 0：

```javascript
let invalid1 = _101; // ReferenceError, _101 会被当成变量名
let invalid2 = 101_; // SyntaxError
let invalid3 = 0_01; // SyntaxError
let invalid4 = 1._4; // SyntaxError
```

<br>

### 3. 值的范围

由于内存的限制，ECMAScript 并不支持表示这个世界上的所有数值。ECMAScript 可以表示的最小数值保存在 Number.MIN_VALUE 中，这个值在多数浏览器中是 5e-324。可以表示的最大数值保存在 Number.MAX_VALUE 中，这个值在多数浏览器中是 1.7976931348623157e+308。如果某个计算得到的数值超出了 JavaScript 可以表示的范围，那么这个数值会被自动转换为一个特殊的 Infinity（无穷）值。任何无法表示的负数以 -Infinity（负无穷大）表示，任何无法表示的正数以 Infinity（正无穷大）表示。

如果计算返回正 Infinity 或负 Infinity，则该值件更不能再进一步用于任何计算。这是因为 Infinity 没有可用于计算的数值表示形式。要确定一个值是不是有限大（即介于 JavaScript 能表示的最小值和最大值之间），可以使用 isFinite() 函数，如下所示：

```javascript
let result = Number.MAX_VALUE + Number.MAX_VALUE;
console.log(isFinite(result)); // false
```

虽然超出有限数值范围的计算并不多见，但总归还是有可能的。因此再计算非常大或非常小的数值时，有必要监测一下计算结果是否超出范围。

>注意
>
>使用 Number.NEGATIVE_INFINITY 和 Nunber.POSITIVE_INFINITY 也可以获取正、负 Infinity。没错，这两个属性包含的值分别就是 -Infinity 和 Infinity。

<br>

### 4. NaN

有一个特殊的数值叫 NaN，意思是不是数值（Not a Number），用于表示本来要返回数值的操作失败了（而不是抛出错误）。比如，求一个负数的平方根在其他语言中通常都会导致错误，从而中止代码执行。但在 ECMAScript 中，求一个负数的平方根会返回 NaN。

NaN 有几个独特的性质。首先，任何涉及 NaN 的操作始终返回 NaN（如 NaN / 10），在连续多步计算时这可能是个问题。其次，NaN 不等于包括 NaN 在内的任何值。例如，下面的比较操作会返回 false：

```javascript
console.log(NaN == NaN); // false
```

为此，ECMAScript 提供了 isNaN() 函数。该函数接收一个参数，可以是任意数据类型，然后判断这个参数是否不是数值。把一个值传给 isNaN() 后，该函数会尝试把它转换为数值。某些非数值的值可以直接转换成数值，如字符串 "10" 或布尔值。任何不能转换为数值的值都会导致这个函数返回 true。

举例如下：

```javascript
console.log(isNaN(NaN)); // true
console.log(isNaN(10)); // false, 10 是数值
console.log(isNaN("10")); // false，可以转换为数值 10
console.log(isNaN("blue")); // true，不可以转换为数值
console.log(isNaN(true)); // false，可以转换为数值 1
```

上述的例子测试了 5 个不同的值。首先测试的是 NaN 本身，显然会返回 true。接着测试了数值 10 和字符串 "10"，都返回 false，因为它们的数值都是 10。字符串 "blue" 不能转换为数值，因此函数返回 true。布尔值 true 可以转换为数值 1，因此返回 false。

>注意
>
>虽然通常不会那么做，但可以用 isNaN() 测试对象。此时，首先会调用对象的 valueOf() 方法，然后再确定返回的值是否可以转换为数值。如果不能，再调用 toString() 方法，并测试其返回值。这是 ECMAScript 内置函数和操作符的正常工作方式，本章后面会讨论。

<br>

### 5. 数值转换

有 3 个函数可以将非数值转换为数值：Number()、parseInt() 和 parseFloat()。Number() 是转型函数，可用于任何数据类型。后两个函数主要用于将字符串转换为数值。对于同样的参数，这 3 个函数执行的操作也不同。

Number() 函数基于如下规则执行转换。

* 布尔值，true 转换为 1, false 转换为 0。
* 数值，直接返回。
* null，返回 0。
* undefined，返回 NaN。
* 字符串，应用以下规则。
  * 如果字符串包含数值字符，包括数值字符前面带加、减号的情况，则转换为一个十进制数值。因此，Number("1") 返回 1，Number("123") 返回 123，Number("011") 返回 11（忽略前面的零）。
  * 如果字符串包含有效的浮点值格式如 "1.1"，则会转换为相应的浮点值（同样，忽略前面的零）。
  * 如果字符串包含有效的十六进制格式如 "0xf"，则会转换为与该十六进制值对应的十进制整数值。
  * 如果是空字符串（不包含字符），则返回 0.
  * 如果字符串包含除上述情况之外的其他字符，则返回 NaN。
* 对象，调用 valueOf() 方法，并按照上述规则则转换返回的值。如果转换结果是 NaN，则调用 toString() 方法，再按照转换字符串的规则转换。

toString() 方法，再按照转换字符串的规则转换。

从不同数据类型到数值的转换有时候会比较复杂，看一看 Number() 的转换规则就知道了。下面是几个具体的例子：

```javascript
let num1 = Number("Hello world!"); // NaN
let num2 = Number(""); // 08
let num3 = Number("000011"); // 11
let num4 = Number(true); // 1
```

可以看到，字符串 "Hello wrold" 转换之后是 NaN，因为它找不到对应的数值。空字符串转换后是 0.字符串 000011 转换后是 11，因为前面的零被忽略了。最后，true 转换为 1。

>注意
>
>本章后面会讨论到的一元加操作符与 Number() 函数遵循相同的转换规则。

考虑到用 Number() 函数转换字符串时相对复杂且有点反常规，通常在需要得到整数时可以优先使用 parseInt() 函数。parseInt() 函数更专注于字符串是否包含数值模式。字符串最前面的空格会被忽略，从第一个非空格字符开始转换。如果第一个字符不是数值字符、加号或减号，parseInt() 立即返回 NaN。这意味着空字符串也会返回 NaN（这一点跟 Number() 不一样，它返回 0）。如果第一个字符是数值字符、加号或减号，则继续依次检测每个字符，直到字符串末尾，或碰到非数值字符。比如，"1234blue" 会被转换为 1234，因为 "blue" 会被完全忽略。类似地，"22.5" 会被转换为 22，因为小数点不是有效的整数字符。

假设字符串中的第一个字符是数值字符，parseInt() 函数也能识别不同的整数格式（十进制、八进制、十六进制）。换句话说，如果字符串以 "0x" 开头，就会被解释为十六进制整数。如果字符串以 "0" 开头，且紧跟着数值字符，在非严格模式下会被某些实现解释为八进制整数。

下面几个转换示例有助于理解上述规则：

```javascript
let num1 = parseInt("1234blue"); // 1234
let num2 = parseInt(""); // NaN
let num3 = parseInt("0xA"); // 10，解释为十六进制整数
let num4 = parseInt(22.5); // 22
let num5 = parseInt("70"); // 70，解释为十进制值
let num6 = parseInt("0xf"); // 15，解释为十六进制整数
```

不同的数值格式很容易混淆，因此 parseInt() 也接受第二个参数，用于指定底数（进制数）。如果知道要解析的值是十六进制，那么可以传入 16 作为第二个参数，以便正确解析：

```javascript
let num = parseInt("0xAF", 16); // 175
```

事实上，如果提供了十六进制参数，那么字符串前面的 "0x" 可以省掉：

```javascript
let num1 = parseInt("AF", 16); // 175
let num2 = parseInt("AF"); // NaN
```

在这个例子中，第一个转换四正确的，而第二个转换失败了。区别在于第一次传入了进制数作为参数，告诉 parseInt() 要解析的是一个十六进制字符串。而第二个转换检测到第一个字符就是非数值字符，随即自动停止并返回 NaN。

通过第二个参数，可以极大扩展转换后获得的结果类型。比如：

```javascript
let num1 = parseInt("10", 2); // 2，按二进制解析
let num2 = parseInt("10", 8); // 8，按八进制解析
let num3 = parseInt("10", 10); // 10，按十进制解析
let num4 = parseInt("10", 16); // 16，按十六进制解析
```

因为不传底数参数相当于让 parseInt() 自己决定如何解析，所以为避免解析出错，建议始终传给它第二个参数。

>注意
>
>多数情况下解析的应该都是十进制数，此时第二个参数就要传入 10。

parseFloat() 函数的工作方式跟 parseInt() 函数类似，都是从位置 0 开始检测每个字符。同样，它也是解析到字符串末尾或者解析到一个无效的浮点数值字符为止。这意味着第一次出现的小数点是有效的，但第二次出现的小数点就无效了，此时字符串的剩余字符都会被忽略。因此，"22.34.5" 将转换成 22.34。

parseFloat() 函数的另一个不同之处在于，它始终忽略字符串开头的零。这个函数能识别前面讨论的所有浮点格式，以及十进制格式（开头的零始终被忽略）。十六进制数值始终会返回 0。由于 parseFloat() 只解析十进制值。因此不能指定底数。最后，如果字符串表示整数（没有小数点或者小数点后面只有一个零），则 parseFloat() 返回整数。下面是几个示例：

```javascript
let num1 = parseFloat("1234blue"); // 1234，按整数解析
let num2 = parseFloat("0xA"); // 0
let num3 = parseFloat("22.5"); // 22.5
let num4 = parseFloat("22.34.5"); // 22.34
let num5 = parseFloat("0908.5"); // 908.5
let num6 = parseFloat("3.125e7"); // 31250000
```

<br>

## 6. BigInt 类型

BigInt 这种原始数据类型用于处理超过 Number.MAX_SAFE_INTEGER 的大整数。在内部，对于 BigInt 原始值，引擎会在内存中分配一个对象来表示 CPU 寄存器中放不下的任意大整数。这个大整数不再使用 IEEE 754 64 位格式，而是使用一组能够放入 CPU 寄存器中的较小的值来表示。BigInt 都是有符号整数。

>注意
>
>BigInt 应该只用于数值大于 2e53 的场景。

要创建 BigInt 值，可以在任意数值字面量末尾添加 "n"，也可以使用 BigInt() 函数：

```javascript
let bigintA = 12345n;
let bigintB = BigInt(12345);
let bigintC = BigInt(0x12345);
let bigintD = BigInt("12345");
let bigintE = BigInt("0o12345");
```

如上所示，BigInt() 函数接受要给数值字面量（或数字字符串），可以是二进制、八进制、十进制或十六进制。

BigInt 与 Number 类似，但这两种类型不能同时出现在算术或位运算中。另外，BigInt 不能用于内置的 Math 方法：

```javascript
123n + 123n; // ok

1235 + 123n; // TypeError
Math.round(123n); // TypeError
```

<br>

### 1. 格式转换

普通整数值可以与 BigInt 格式相互转换，但由于底层内存表示方式的根本差异，这种转换免不了会丢失精度。BigInt 类型与非整数是不兼容的：

```javascript
123n === BigInt(123); // true
123 === Number(123n); // true

// 注意，转换后会丢失精度
Number(BigInt(10000000000054321)); // 10000000000054320
Number(54321n + BigInt(1E16)); // 10000000000054320

BigInt(0.5); // RangeError
```

<br>

### 2. 操作符

BigInt 支持几乎所有 Number 类型使用的算术、一元和位操作符。注意下面例子中的 bigintB，两个大整数相除之后的余数会自动向下舍入：

```javascript
let bigintA = 10n ** 2n; // 100n
let bigintB = 100n / 3n; // 33n
let bigintC = 16n | 8n; // 24n
let bigintD = -8n + -8n; // -16n
```

以下两个操作符不支持：

* 无符号右移操作符 >>>
* 一元 + 操作符

尽管在算术和位运算中不能混合 Number 和 BigInt，但这两个类型可以相互比较、排序：

```javascript
4n > 3; // true
[5n, 1, 3n].sort(); // [1, 3n, 5n]
```

<br>

### 3. 静态方法

BigInt 有两个静态方法：asIntN 和 asUintN，用于限制整数不越界。所谓限制，指的是将整数截短尾指定的最低有效位。

* BigInt.asIntN(bits, bigint) 截短到有符号整数。
* BigInt.asUintN(bits, bigint) 截短到无符号整数。

BigInt 在内存中以二的补数形式表示，因此截短方法必须谨慎使用。如下面的例子所示，虽然位数减少了，但输出的数值与输入的数值可能存在巨大差异：

```javascript
// 将 00011000 截短为 1000
BigInt.asIntN(4, 24n); // -8n
BigInt.asUintN(4, 24n); // 8n

// 将 11111111 截短为 1111
BigInt.asIntN(4, -1n); // -1n
BigInt.asUintN(4, -1n); // 15n

// 将 00010000 截短为 10000
BigInt.asIntN(5, 16n); // -16n

// 将 00010000 截短为 010000
BigInt.asIntN(6, 16n); // 16n
```

<br>

### 4. JSON

BigInt 不支持 JSON 序列化，但内置的 JSON 全局方法可以接受 replacer 和 reviver 参数，利用这两个函数可以实现序列化。

```javascript
let data = {
    bigNumber: 1234n;
};

JSON.stringify(data); // TypeError

const replacer = (k, v) => typeof v === "bigint" ? v.toString() : v;

JSON.stringify(data, replacer); // {"bigNumber": "1234"}

const reviver = (k, v) => k === "bigNumber" ? BigInt(v) : v;

JSON.parse(`{"bigNumber": "1234"}`, reviver);
// { bigNumber: 1234n }
```

<br>

## 7. String 类型

String（字符串）数据类型表示零或多个 16 位 Unicode 字符序列。字符串可以使用双引号（"）、单引号（'）或反引号（`）标示，因此下面的代码都是合法的：

```javascript
let firstName = "John";
let middleName = "Jacob";
let lastName = `Jingleheimerschmidt`;
```

跟某些语言中使用不同的引号会改变对字符串的解释方式不同，ECMAScript 语法中表示字符串的引号没有区别。不过要注意的是，以某种引号作为字符串开头，必须仍然以该种引号作为字符串结尾。比如，下面的写法会导致语法错误：

```javascript
let firstName = 'Alice"; // 语法错误：开头和结尾的引号必须是同一种
```

### 1. 字符字面量

字符串数据类型包含一些字符字面量，用于表示非打印字符或有其他用途的字符，如下表所示：

| 字面量 | 含义                                                         |
| ------ | ------------------------------------------------------------ |
| \n     | 换行                                                         |
| \t     | 制表                                                         |
| \b     | 退格                                                         |
| \r     | 回车                                                         |
| \f     | 换页                                                         |
| `\\`   | 反斜杠（\）                                                  |
| `\'`   | 单引号（'），在字符串以单引号标识时使用，例如 'He said, `\'hey.\''` |
| `\"`   | 双引号（"），在字符串以双引号标示时使用，例如 "He said, `\"hey.\""` |
| \`     | 反引号（`），在字符串以反引号表示时间使用，例如 He said, \'hey,\``` |
| \xnn   | 以十六进制编码 nn 表示的字符（其中 n 是十六进制数字 0~F），例如 \x41 等于 "A" |
| \unnnn | 以十六进制编码 nnnn 表示的 Unicode 字符（其中 n 是十六进制数字 0~F），例如 \u03a3 等于希腊字符 |

这些字符字面量可以出现在字符串种的任意位置，且可以作为单个字符被解释：

```javascript
let text = "This is the letter sigma: \u03a3.";
```

在这个例子中，即使包含 6 个字符长的转义序列，变量 text 仍然是 28 个字符长。因为转义序列表示一个字符，所以只算一个字符。

字符串的长度可以通过其 length 属性获取：

```javascript
console.log(text.length); // 28
```

这个属性返回字符串中 16 位字符的个数。

>注意
>
>如果字符串中包含你双字节字符，那么 length 属性返回的值可能不是准确的字符数。第 5 章将具体讨论如何解决这个问题。

<br>

### 2. 字符串的特点

ECMAScript 中的字符串是不可变的（immutable），意思是一旦创建，它们的值就不能变了。要修改某个变量中的字符串值，必须先销毁原始的字符串，然后将包含新值的另一个字符串保存到该变量，如下所示：

```javascript
let lang = "Java";
lang = lang + "Script";
```

这里，变量 lang 一开始包含字符串 "Java"。紧接着，lang 被重新定义为包含 "Java" 和 "Script" 的组合，也就是 "JavaScript"。整个过程首先会分配要给足够容纳 10 个字符的空间，然后填充上 "Java" 和 "Script"。最后销毁原始的字符串 "Java" 和字符串 "Script"，因为这两个字符串都没有用了。

<br>

### 3. 转换为字符串

有两种方式把一个值转换为字符串。首先是使用几乎所有值都有的 toString() 方法。这个方法唯一的用途就是返回当前值的字符串等价物。比如：

```javascript
let age = 11;
let ageAsString = age.toString(); // 字符串 "11"
let found = true;
let foundAsString = found.toString(); // 字符串 "true"
```

toString() 方法可用于数值、布尔值、对象和字符串值。（没错，字符串也有 toString() 方法，该方法只是简单地返回自身的一个副本。）null 和 undefined 值没有 toString() 方法。

多数情况下，toString() 不接受任何参数。不过，在对数值调用这个方法时，toString() 可以接收一个底数参数，即以什么底数来输出数值的字符串表示。默认情况下，toString() 返回数值的十进制字符串表示。而通过传入参数，可以得到数值的二进制、八进制、十六进制，或者其他任何有效基数的字符串表示，比如：

```javascript
let num = 10;
console.log(num.toString()); // "10"
console.log(num.toString(2)); // "1010"
console.log(num.toString(8)); // "12"
console.log(num.toString(10)); // "10"
console.log(num.toString(16)); // "a"
```

这个例子展示了传入底数参数时，toString() 输出的字符串值也会随之改变。数值 10 可以输出为任意数值格式。注意，默认情况下（不传参数）的输出与传入参数  10 得到的结果相同。

如果你不确定一个值是不是 null 或 undefined，可以使用 String() 转型函数，它始终会返回表示相应类型值得字符串。String() 函数遵循如下规则。

* 如果值有 toSring() 方法，则调用该方法（不传参数）并返回结果。
* 如果值是 null，返回 "null"
* 如果值是 undefined，返回 "undefined"

下面看几个例子：

```javascript
let value1 = 10;
let value2 = true;
let value3 = null;
let value4;

console.log(String(value1)); // "10"
console.log(String(value2)); // "true"
console.log(String(value3)); // "null"
console.log(String(value4)); // "undefined"
```

这里展示了将 4 个值转换为字符串的情况：一个数值、一个布尔值、一个 null 和一个 undefined。数值和布尔值的转换结果与调用 toString() 相同。因为 null 和 undefined 没有 toString() 方法，所以 String() 方法就直接返回了这两个值的字面量文本。

>注意
>
>用加号操作符给一个值加上一个空字符串 "" 也可以将其转换为字符串（加号操作符本章后面会介绍）。

<br>

### 4. 模板字面量

使用模板字面量也可以定义字符串，此时要使用反引号（`）作为定界符。与使用单引号或双引号不同，模板字面量保留换行字符，可以跨行定义字符串：

```javascript
let myMultiLineString = 'first line\nsecond line';
let myMultiLineTemplateLiteral = `first line
second line`;

console.log(myMultiLineString);
// first line
// second line

console.log(myMultiLineTemplateLiteral);
// first line
// second line

console.log(myMultiLineString === myMultiLineTemplateLiteral); // true
```

顾名思义，模板字面量在定义模板时特别有用，比如下面这个 HTML 模板：

```javascript
let pageHTML = `
<div>
	<a href="#">
		<span>Jake</span>
	</a>
</div>`;
```

由于模板字面量会保持反引号内部的空格，因此在使用时哟啊格外注意。格式正确的模板字符串看起来可能会缩进不当：

```javascript
// 这个模板字面量在换行符之后有 25 个空格符
let myTemplateLiteral = `first line
						 second line`;
console.log(myTemplateLiteral.length); // 47

// 这个模板字面量以一个换行符开头
let secondTemplateLiteral = `
first line
second line`;
console.log(secondTemplateLiteral[0] === '\n'); // true

// 这个模板字面量没有意料之外的字符
let thirdTemplateLiteral = `first line
second line`;
console.log(thirdTemplateLiteral);
// first line
// second line
```

<br>

### 5. 字符串插值

模板字面量最常用的一个特性是支持字符串插值，也就是可以在一个连续定义中插入一个或多个值。技术上讲，模板字面量不是字符串，而是一种特殊的 JavaScript 句法表达式，只不过求值后得到的是字符串。模板字面量在定义时立即求值并转换为字符串实例，任何插入的变量也会从它们最接近的作用域中取值。

字符串插值通过在 ${} 中使用一个 JavaScript 表达式实现：

```javascript
let value = 5;
let exponent = "second";

// 以前，字符串插值是这样实现的：
let interpolatedString = 
    value + ' to the ' + exponent + ' power is ' + (value * value);

// 现在，可以用模板字面量这样实现：
let interpolatedTemplateLiteral = 
    `${value} to the ${ exponent } power is ${ value * value }`;

console.log(interpolatedString); // 5 to the second power is 25
console.log(interpolatedTemplateLiteral); // 5 to the second power is 25
```

所有插入的值都会被强制转型为字符串，而且任何 JavaScript 表达式都可以用于插值。嵌套的模板字符串无须转义：

```javascript
console.log(`Hello, ${World}!`); // Hello, World!
```

将表达式转换为字符串时会调用 toString()：

```javascript
let foo = { toString: () => 'World' };
console.log(`Hello, ${ foo }!`); // Hello, World!
```

在插值表达式中可以调用函数和方法：

```javascript
function capitalize(word) {
    return `${ word[0].toUpperCase() }${ word.slice(1) }`;
}

console.log(`${ capitalize('hello') }, ${ capitalize('world') }!`); // Hello, World!
```

此外，模板也可以插入自己之前的值：

```javascript
let value = ''l
function append() {
    value = `${value}abc`;
    console.log(value);
}
append(); // abc
append(); // abcabc
append(); // abcabcabc
```

<br>

### 6. 模板字面量标签函数

模板字面量也支持定义标签函数（tag function），而通过标签函数可以自定义插值行为。标签函数会接收被插值记号分隔后的模板和对表达式求值的结果。

标签函数本身是一个常规函数，通过前缀到模板字面量来应用自定义行为，如下例所示。标签函数接收到额参数依次是原始字符串数组和对每个表达式求值的结果。这个函数的返回值是对模板字面量求值得到的字符串。

最好通过一个例子来理解：

```javascript
let a = 6;
let b = 9;

function simpleTag(strings, aValExpression, bValExpression, sumExpression) {
    console.log(strings);
    console.log(aValExpression);
    console.log(bValExpression);
    console.log(sumExpression);
    
    return 'foobar';
}

let untaggedResult = `${ a } + ${ b } = ${ a + b }`;
let taggedResult = simpleTag`${ a } + ${ b } = ${ a + b }`;
// ["", " + ", " = ", ""]
// 6
// 9
// 15

console.log(untaggedResult); // "6 + 9 = 15"
console.log(taggedResult); // "foobar"
```

因为表达式参数的数量是可变的，所以通常应该使用剩余操作符（rest operator）将它们收集到一个数组中：

```javascript
let a = 6;
let b = 9;

function simpleTag(strings, ...expressions) {
    console.log(strings);
    for(const expression of expressions) {
        console.log(expression);
    }
    
    return 'foobar';
}
let taggedResult = simpleTag`${ a } + ${ b } = ${ a + b }`;
// ["", " + ", " = ", ""]
// 6
// 9
// 15

console.log(taggedResult); // "foobar"
```

对于有 n 个插值的模板字面量，传给标签函数的表达式参数的个数始终是 n，而传给标签安徽念书的第一个参数所包含的字符串个数则始终是 n+1。因此，如果你想把这些字符串和对表达式求值的结果拼接起来作为默认返回的字符串，可以这样做：

```javascript
let a = 6;
let b = 9;

function zipTag(strings, ...expressions) {
    return strings[0] +
        expressions.map((e, i) => `${e}${strings[i + 1]}`);
}

let untaggedResult = `${ a } + ${ b } = ${ a + b }`;
let taggedResult = zipTag`${ a } + ${ b } = ${ a + b }`;

console.log(untaggedResult); // "6 + 9 = 15"
console.log(taggedResult); // "6 + 9 = 15"
```

<br>

### 7. 原始字符串

使用模板字面量也恶意直接获取原始的模板字面量内容（如换行符或 Unicode 字符），而不是被转换后的字符表示。为此，可以使用默认的 String.raw 标签函数：

```javascript
// Unicode 示例
// \u00A9 是版权符号
console.log(`\u00A9`);
console.log(String.raw`\u00A9`); // \u00A9

// 换行符示例
console.log(`first line\nsecond line`);
// first line
// second line

console.log(String.raw`first line\nsecond line`); // "first line\nsecond line"

// 对实际的换行符来说是不行的
// 它们不会被转换成转义序列的形式
console.log(`first line
second line`);
// first line
// second line

console.log(String.raw`first line
second line`);
// first line
// second line
```

另外，也可以通过标签函数的第一个参数，即字符串数组的 .raw 属性取得每个字符串的原始内容：

```javascript
function printRaw(strings) {
    console.log('Actual characters:');
    for (const string of strings) {
        console.log(string);
    }
    
    console.log('Escaped characters:');
    for (const rawString of strings.raw) {
        console.log(rawString);
    }
}

printRaw`\u00A9${ 'and' }\n`;
// Actual characters:
// 
// (换行符)
// Escaped characters:
// \u00A9
// \n
```

<br>

## 8. Symbol 类型

符号是原始值，且符号实例是唯一、不可变的。符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险。

尽管听起来跟私有属性有点类似，但符号并不是为了提供私有属性的行为才增加的（尤其是因为 Object API 提供了方法，可以更方便地发现符号属性）。相反，符号就是用来创建唯一记号，进而用作非字符串形式的对象属性。

### 1. 符号的基本用法

符号需要使用 Symbol() 函数初始化。因为符号本身是原始类型，所以 typeof 操作符对符号返回 "symbol"。

```javascript
let sym = Symbol();
console.log(typeof sym); // symbol
```

调用 Symbol() 函数时，也可以传入一个字符串参数作为符号的描述（description），将来可以通过这个字符串来调试代码。但是，这个字符串参数与符号定义或标识完全无关：

```javascript
let genericSymbol = Symbol();
let otherGenericSymbol = Symbol();

let fooSymbol = Symbol('foo');
let otherFooSymbol = Symbol('foo');

console.log(genericSymol == otherGenericSymbol); // false
console.log(fooSymbol == otherFooSymbol); // false
```

符号没有字面量语法，这也是它们发挥作用的关键。按照规范，你只要创建 Symbol() 实例并将其用作对象的新属性，就可以保证它不会覆盖已有的对象属性，无论符号属性还是字符串属性。

```javascript
let genericSymbol = Symbol();
console.log(genericSymbol); // Symbol()

let fooSymbol = Symbol('foo');
console.log(fooSymbol); // Symbol(foo);
```

最重要的是，Symbol() 函数不能与 new 关键字一起作为构造函数使用。这样做是为了避免创建符号包装对象，像使用 Boolean、String 或 Number 那样，它们支持构造函数且可用于初始化包含原始值的包装对象：

```javascript
let myBoolean - new Boolean();
console.log(typeof myBoolean); // "object"

let myString = new String();
console.log(typeof myString); // "object"

let myNumber = new Number();
console.log(typeof myNumber); // "object"

let mySymbol = new Symbol(); // TypeError: Symbol is not a constructor
```

如果你确实想使用符号包装对象，可以借用 Object() 函数：

```javascript
let mySymbol = Symbol();
let myWrappedSymbol = Object(mySymbol);
console.log(typeof myWrappedSymbol); // "object"
```

<br>

### 2. 使用全局符号注册表

如果运行时的不同部分需要共享和重用符号实例，那么可以用一个字符串作为键，在全局符号注册表中创建并重用符号。

为此，需要使用 Symbol.for() 方法：

```javascript
let fooGlobalSymbol = Symbol.for('foo');
console.log(typeof gooGlobalSymbol); // symbol
```

Symbol.for() 对每个字符串键都执行幂等操作。第一次使用某个字符串调用时，它会检查全局运行时注册表，发现不存在对应的符号，于是就会生成一个新符号实例并添加到注册表中。后续使用相同字符串的调用同样会检查注册表，发现存在与该字符串对应的符号，然后就会返回该符号实例。

```javascript
let fooGlobalSymbol = Symbol.for('foo'); // 创建新符号
let otherFooGlobalSymbol = Symbol.for('foo'); // 重用已有符号

console.log(fooGlobalSymbol === otherFooGlobalSymbol); // true
```

即使采用相同的符号描述，在全局注册表中定义符号跟使用 Symbol() 定义的符号也并不等同：

```javascript
let localSymbol = Symbol('foo');
let globalSymbol = Symbol.for('foo');

console.log(localSymbol === globalSymbol); // false
```

全局注册表中的符号必须使用字符串键来创建，因此作为参数传给 Symbol.for() 的任何值都会被转换为字符串。此外，注册表中使用的键同时也会被用作符号描述。

```javascript
let emptyGlobalSymbol = Symbol.for();
console.log(emptyGlobalSymbol); // Symbol(undefined)
```

还可以使用 Sybol.keyFor() 来查询全局注册表，这个方法接收符号，返回该全局符号对应的字符串键。如果查询的不是全局符号，则返回 undefined。

```javascript
// 创建全局符号
let s = Symbol.for('foo');
console.log(Symbol.keyFor(s)); // foo

// 创建普通符号
le s2 = Symbol('bar');
console.log(Symbol.keyFor(s2)); // undefined
```

如果传给 Symbol.keyFor() 的不是符号，则该方法抛出 TypeError：

```javascript
Symbol.keyFor(123); // TypeError: 123 is not a symbol
```

<br>

### 3. 使用符号作为属性

凡是可以使用字符串或数值作为属性的地方，都可以使用符号。这就包括了对象字面量属性和 Object.defineProperty() / Object.defineProperties() 定义的属性。对象字面量只能在计算属性语法中使用符号作为属性。

```javascript
let s1 = Symbol('foo'),
    s2 = Symbol('bar'),
    s3 = Symbol('baz'),
    s4 = Symbol('qux');

let o = {
    [s1]: 'foo val';
};
// 这样也可以: o[s1] = 'foo val';

console.log(o);
// {Symbol(foo): foo val}

Object.defineProperty(o, s2, { value: 'bar val' });

console.log(o);
// {Symbol(foo): foo val, Symbol(bar): bar val}

Object.defineProperties(o, {
    [s3]: {value: 'baz val'},
    [s4]: {value: 'qux val'}
});

console.log(o);
// {Symbol(foo): foo val, Symbol(bar): bar val,
// Symbbol(baz): baz val, Symbol(qux): qux val}
```

类似于 Object.getOwnPropertyNames() 返回对象实例的常规属性数组，Object.getOwnPropertySymbols() 返回对象实例的符号属性数组。这两个方法的返回值彼此互斥。Object.getOwnPropertyDescriptors() 会返回同时包含常规和符号属性描述符对象。Reflect.ownKeys() 会返回两种类型的键：

```javascript
let s1 = Symbol('foo'),
    s2 = Symbol('bar');

let o = {
    [s1]: 'foo val',
    [s2]: 'bar val',
    baz: 'baz val',
    qux: 'qux val'
};

console.log(Object.getOwnPropertySymbols(o));
// [Symbol(foo), Symbol(bar)]

console.log(Object.getOwnPropertyNames(o));
// ["baz", "qux"]

console.log(Object.getOwnPropertyDescriptors(o));
// {baz: {...}, qux: {...}, Symbol(foo): {...}, Symbol(bar): {...}}

console.log(Reflect.ownKeys(o));
// ["baz", "qux", Symbol(foo), Symbol(bar)]
```

因为符号属性是对内存中符号的一个引用，所以直接创建并用作属性的符号不会丢失。但是，如果没有显式地保存对这些属性的引用，那么遍历对象的所有符号属性才能找到相应的属性键：

```javascript
let o = {
    [Symbol('foo')]: 'foo val',
    [Symbol('bar')]: 'bar val'
};

console.log(o);
// {Symbol(foo): "foo val", Symbol(bar): "bar val"}

let barSymbol = Object.getOwnPropertySymbols(o).find((symbol => symbol.toString().match(/bar/)));

console.log(barSymbol);
// Symbol(bar)
```

<br>

### 4. 常用内置符号

ECMAScript 定义了一批常用内置符号（well-known symbol），用于暴露语言内部行为，开发者可以直接访问、重写或模拟这些行为。这些内置符号都以 Symbol 工厂函数字符串属性的形式存在。

这些内置符号最重要的用途之一是重新定义它们，从而改变原生结构的行为。比如，我们知道 for-of 循环会在相关对象上使用 Symbol.iterator 属性，那么就可以通过在自定义对象上重新定义 Symbol.iterator 的值，来改变 for-of 在迭代该对象时的行为。

这些内置符号也没有什么特别之处，它们就是全局函数 Symbol 的普通字符串属性，指向一个符号的实例。所有内置符号属性都是不可写、不可枚举、不可配置的。

>注意
>
>在提到 ECMAScript 规范时，经常会引用符号在规范中的名称，前缀为 @@。比如，@@iterator 指的就是 Symbol.iterator。

#### 1. Symbol.asyncIterator

这个符号表示一个作为属性的方法，该方法返回对象默认的 AsyncIterator，在底层由 for-await-of 语句使用。换句话说，这个符号表示实现异步迭代器 API 的函数。

for-await-of 循环会利用这个函数执行异步迭代操作。循环时，它们会调用 Symbol.asyncIterator 为键的函数，并期望这个函数会返回一个实现迭代器 API 的对象。很多时候，返回的对象是实现该 API 的 AsyncGenerator：

```javascript
class Foo {
    async *[Symbol.asyncIterator]() {}
}

let f = new Foo();

console.log(f[Symbol.asyncIterator]());
// AsyncGenerator {<suspended>}
```

技术上，这个由 Symbol.asyncIterator 函数生成的对象应该通过其 next() 方法陆续返回 Promise 实例。可以通过显式地调用 next() 方法返回，也可以隐式地通过异步生成器函数返回：

```javascript
class Emitter {
    constructor(max) {
        this.max = max;
        this.asyncIdx = 0;
    }
    
    async *[Symbol.asyncIterator]() {
        while(this.asyncIdx < this.max) {
            yield new Promise((resolve) => resolve(this.asyncIdx++));
        }
    }
}

async function asyncCount() {
    let emitter = new Emitter(5);
    
    for await(const x of emitter) {
        console.log(x);
    }
}

asyncCount();
// 0
// 1
// 2
// 3
// 4
```

<br>

#### 2. Symbol.hasIntance

这个符号表示一个作为属性的方法，该方法决定一个构造器对象是否认可一个对象是它的实例，由 instanceof 操作符在底层使用。instanceof 操作符可以用来确定一个对象实例的原型链上是否有原型。instanceof 的典型使用场景如下：

```javascript
function Foo() {}
let f = new Foo();
console.log(f instanceof Foo); // true

class Bar {}
let b = new Bar();
console.log(b instanceof Bar); // true
```

在 ES6 中，instanceof 操作符会使用 Symbol.hasIntance 函数来确定关系。以 Symbol.hasIntance 为键的函数会执行同样的操作，只是操作数对调了一下：

```javascript
function Foo() {}
let f = new Foo();
console.log(Foo[Symbol.hasIntance](f)); // true

class Bar {}
let b = new Bar();
console.log(Bar[Symbol.hasInstance](b)); // true
```

这个属性定义在 Function 的原型上，因此默认在所有函数和类上都可以调用。由于 instanceof 操作符会在原型链上寻找这个属性定义，就跟在原型链上寻找其他属性一样，因此可以在继承的类上通过静态方法重新定义这个函数：

```javascript
class Bar {}
class Baz extends Bar {
    static [Symbol.hasInstance]() {
        return false;
    }
}

lket b = new Baz();
console.log(Bar[Symbol.hasInstance](b)); // true
console.log(b instanceof Bar); // true
console.log(Baz[Symbol.hasInstance](b)); // false
console.log(b instanceof Baz); // false
```

<br>

#### 3. Symbol.isConcatSpreadable

这个符号表示一个作为属性的布尔值，如果是 true，则意味着对象应该用 Array.prototype.concat() 打平其数组元素。ES6  中的 Array.prototype.concat() 方法会根据接收到的对象类型选择如何将一个类数组对象拼接成数组实例。覆盖 Symbol.isConcatSpreadable 的值可以修改这个行为。

数组对象默认情况下会被打平到已有数组，false 或假值会导致整个对象被追加到数组末尾。类数组对象默认情况下会被追加到数组末尾，true 或真值会导致这个类数组对象被打平到数组实例。其他不是类数组对象的对象在 Symbol.isConcatSpreadable 被设置为 true 的情况下将被忽略。

```javascript
let initial = ['foo'];

let array = ['bar'];
console.log(array[Symbol.isConcatSpreadable]); // undefined
console.log(initial.concat(array)); // ['foo', 'bar']
array[Symbol.isConcatSpreadable] = false;
console.log(initial.concat(array)); // ['foo', Array(1)]

let arrayLikeObject = { length: 1, 0: 'baz' };
console.log(arrayLikeObject[Symbol.isConcatSpreadable]); // undefined
console.log(initial.concat(arrayLikeObject)); // ['foo', {...}]
arraylikeObject[Symbol.isConcatSpreadable] = true;
console.log(initial.concat(arrayLikeObject)); // ['foo', 'baz']

let otherObject - new Set().add('qux');
console.log(otherObject[Symbol.isConcatSpreadable]); // undefined
console.log(initial.concat(otherObject)); // ['foo', Set(1)]
otherObject[Symbol.isConcatSpreadable] = true;
console.log(initial.concat(otherObject)); // ['foo']
```

<br>

#### 4. Symbol.iterator

这个符号表示一个作为属性的方法，该方法返回对象默认的迭代器，由 for-of 语句在底层使用。换句话说，这个符号表示实现迭代器 API 的函数。

for-of 循环这样的语言结构会利用这个函数执行迭代操作。循环时，它们会调用以 Symbol.iterator 为键的函数，并默认这个函数会返回一个实现迭代器 API 的对象。很多时候，返回的对象是实现该 API 的 Generator：

```javascript
class Foo {
    *[Symbol.iterator]() {}
}

let f = new Foo();

console.log(f[Symbol.iterator]());
// Generator {<suspended>}
```

技术上，这个由 Symbol.iterator 函数生成的对象应该通过其 next() 方法陆续返回值。可以通过显式地调用 next() 方法返回，也可以隐式地通过生成器函数返回：

```javascript
class Emitter {
    constructor(max) {
        this.max = max;
        this.idx = 0;
    }
    
    *[Symbol.iterator]() {
        while(this.idx < this.max) {
            yield this.idx++;
        }
    }
}

function count() {
    let emitter = new Emitter(5);
    
    for (const x of emitter) {
        console.log(x);
    }
}

count();
// 0
// 1
// 2
// 3
// 4
```

>注意
>
>迭代器的相关内容将在第 7 章详细介绍

<br>

#### 5. Symbol.match

这个符号表示一个作为属性的正则表达式方法，该方法用正则表达式去匹配字符串，在底层由 String.prototype.match() 方法使用。String.prototype.match() 方法会使用以 Symbol.match 为键的函数来对正则表达式求值。正则表达式的原型上默认有这个函数的定义，因此所有正则表达式实例默认是这个 String 方法的有效参数：

```javascript
console.log(RegExp.prototype[Symbol.match]);
// f [Symbol.match]() { [native code] }

console.log('foobar'.match(/bar/));
// ["bar", index: 3, input: "foobar", groups: undefined]
```

给这个方法传入非正则表达式值会导致该值被转换为 RegExp 对象。如果想改变这种行为，让方法直接使用参数，则可以重新定义 Symbol.match 函数以取代默认对正则表达式求值的行为，从而让 match() 方法使用正则表达式实例。Symbol.match 函数接收一个参数，就是调用 match() 方法的字符串实例。返回的值没有限制：

```javascript
class FooMatcher {
    static [Symbol.match](target) {
        return target.includes('foo');
    }
}
console.log('foobar'.match(FooMatcher)); // true
console.log('barbaz'.match(FooMatcher)); // false

class StringMatcher {
    constructor(str) {
        this.str = str;
    }
    
    [Symbol.match](target) {
        return target.includes(this.str);
    }
}

console.log('foobar'.match(new StringMatcher('foo'))); // true
console.log('barbaz'.match(new StringMatcher('qux'))); // false
```

<br>

#### 6. Symbol.replace

这个符号表示一个作为属性的正则表达式方法，该方法替换一个字符串中匹配的子串，在底层由 String.prototype.replace() 方法使用。String.prototype.replace() 方法会使用以 Symbol.replace 为键的函数来对正则表达式求值。正则表达式的原型上默认有这个函数的定义，因此所有正则表达式实例默认是这个 String 方法的有效参数：

```javascript
console.log(RefExp.prootype[Symbol.replace]);
// f [Symbol.replace]() { [native code] }

console.log('foobarbaz'.replace(/bar/, 'qux'));
// 'fooquxbaz'
```

给这个方法传入非正则表达式值会导致该值被转换为 RegExp 对象。如果想改变这种行为，让方法直接使用参数，可以重新定义 Symbol.replace 函数以取代默认对正则表达式的行为，从而让 replace() 方法使用非正则表达式实例。Symbol.replace 函数接收两个参数，即调用 replace() 方法的字符串实例和替换字符串。返回的值没有限制：

```javascript
class FooReplacer {
    static [Symbol.replace](target, replacement) {
        return target.split('foo').join(replacement);
    }
}

console.log('barfoobaz'.replace(FooReplacer, 'qux'));
// "barquxbaz"

class StringReplacer {
    constructor(str) {
        this.str = str;
    }
    
    [Symbol.replace](target, replacement) {
        return target.split(this.str).join(replacement);
    }
}

console.log('barfoobaz'.replace(new StringReplacer('foo'), 'qux'));
// "barquxbaz"
```



































































