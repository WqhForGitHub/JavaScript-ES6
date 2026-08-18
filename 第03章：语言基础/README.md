# 3.1 语法

ECMAScript 的语法很大程度上借鉴了 C 语言和其他类 C 语言，如 Java 和 Perl。熟悉这些语言的开发者应该很容易理解 ECMAScript 宽松的语法。
## 3.1.1 区分大小写

首先要知道的是，ECMAScript 中一切都区分大小写。无论变量、函数名还是操作符，都区分大小写。换句话说，变量 test 和变量 Test 是两个不同的变量。类似地，typeof 不能作为函数名，因为它是一个关键字（后面会介绍）。但 Typeof 是一个完全有效的函数名。
## 3.1.2 标识符

所谓标识符，就是变量、函数或函数参数的名称。标识符可以由一个或多个下列字符组成：

* 第一个字符必须是字母、下划线（_）或美元符号（$）
* 其他字符可以是字母、下划线、美元符号或数字

标识符中的字母可以是扩展 ASCII（extended ASCII）中的字母，也可以是 Unicode 的字幕组成。
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
## 3.1.3 注释

ECMAScript 采用 C 语言风格的注释，包括单行注释和块注释。单行注释以两个斜杠字符（//）开头，如：
```javascript
// 单行注释
```
块注释以一个斜杠和一个星号（/*）开头，以它们的反向组合（`*/`）结尾，如：
```javascript
/* 这是多行
注释 */
```

## 3.1.4 严格模式

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
## 3.1.5 语句

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
# 3.2 关键字与保留字

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

# 3.3 变量

ECMAScript 变量是松散类型的，意思是变量可以用于保存任何类型的数据。每个变量只不过是一个用于保存任意值的命名占位符。有 3 个关键字可以声明变量：var、const 和 let。
## 3.3.1. var 关键字 

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

### 3.3.1.1 var 声明作用域

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
### 3.3.1.2 var 声明提升

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
## 3.3.2 let 声明

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
var name;
let name;
上面解释下：
第一步：
```javascript
var name;
```
创建一个叫 `name` 的变量
第二步：
```javascript
let name;
```
JavaScript 发现：
>当前作用域已经有一个叫 name 的声明了。

但是 `let` 规定：
>同一个作用域中，不能出现重复声明

所以，
```
SyntaxError: Odemtofoer 'name' has aleady beem declared
```
反过来一样
```javascript
let age;

var age;
```
流程：
第一次：
```javascript
let age;
```
创建：
```
当前作用域
 |
 └── age (let)
```
第二次：
```javascript
var age;
```
想创建：
```
当前作用域
 |
 └── age (var)
```
但是名字冲突
```
age
```
已经存在。
所以报错。
### 3.3.2.1 暂时性死区

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
### 3.3.2.2 全局声明

与 var 关键字不同，使用 let 在全局作用域中声明的变量不会像 var 声明的变量那样成为 window 对象的属性。

```javascript
var name = "Bob";
console.log(window.name); // "Bob"

let age = 26;
console.log(window.age); // undefined
```

不过，let 声明仍然是在全局作用域中发生的，相应变量会在页面的生命周期内存续。因此，为了避免 SyntaxError，必须确保页面不会声明同一个变量。
### 3.3.2.3 条件声明

在使用 var 声明变量时，由于声明会被提升，JavaScript 引擎会顺便将多余的声明在作用域顶部合并为一个声明。因为 let 的作用域被限定在块中，所以不可能检查前面是否已经使用 let 声明过同名变量并在没有声明的情况下声明它（条件式声明）。
```html
<script>
	var name = 'Alice';
	let age = 26;
</script>

<script>
	// 假设脚本不确定页面中是否已经声明了同名变量
	// 那它可以假设还没有声明过
	
	var name = 'Bob';
	// 这里没问题，因为这个声明会被提升
	// 不需要检查之前是否声明过同名变量
	
	let age = 36;
	// 如果之前声明过 age，这里会报错
</script>
```
使用 try/catch 语句或 typeof 操作符也不行，因为条件块中 let 声明的作用域会被限制在该块中。
```html
<script>
	let name = 'Alice';
	let age = 36;
</script>

<script>
	// 假设脚本不确定页面中是否已经声明了同名变量
	// 那它可以假设还没有声明过
	
	if (typeof name === 'undefined') {
		let name;
	}
	// name 被限制在 if () 块的作用域内
	// 因此这个赋值形同全局赋值
</script>                                   
```
为此，不能依赖条件声明模式。
>注意
>不能使用 let 进行条件式声明是件好事，因为条件声明是一种反模式，它让程序变得更难理解。如果你发现自己在使用这个模式，那一定有更好的替代方式。
### 3.3.2.4 for 循环中的 let 声明

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
## 3.3.3 const 声明

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
    const name = "Alice"
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
## 3.3.4 声明风格及最佳实践

ECMAScript 6 增加 let 和 const 从客观上让这门语言能够更精确地声明作用域和表达语义。行为怪异地 var 所造成地各种问题，已经令整个 JavaScript 社区苦恼多年。随着这两个新关键字的出现，新的有助于提升代码质量的最佳实践也逐渐显现。
### 3.3.4.1 不使用 var

有了 let 和 const，大多数开发者会发现自己不再需要 var 了。限制自己只使用 let 和 const 有助于提升代码的质量，因为变量有了明确的作用域、声明位置，以及不变的值。
### 3.3.4.2 先 const 再 let

使用 const 声明可以让浏览器运行时强制保持变量的值不变，也可以让静态代码分析工具提前发现不合法的赋值操作。因此，很多开发者认为应该优先使用 const 来声明变量，只在提前知道未来会有修改时再使用 let。这样可以让开发者更有信息地推断某些变量地值永远不会变，同时也能迅速发现因意外赋值导致地非预期行为。
# 3.4 数据类型

ECMAScript 有 7 种简单数据类型（也称为原始类型）：Undefined、Null、Boolean、Number、BigInt、String 和 Symbol。还有一种复杂数据类型叫 Object（对象），是一个无序名值对的集合。因为在 ECMAScript 中不能定义自己的数据类型，所有值都可以用上述 8 种数据类型之一来表示。只有 8 种数据类型似乎不足以表示全部数据。但 ECMAScript 中不能定义自己的数据类型，所有值都可以用上述 8 种数据类型之一来表示。只有 8 种数据类型似乎不足以表示全部数据。但 ECMAScript 的数据类型很灵活，一种数据类型可以当作多种数据类型来使用。
## 3.4.1 typeof 操作符

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
## 3.4.2 Undefined 类型

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
>一般来说，永远不会显式地给某个变量设置 undefined 值。字面值 undefined 主要用于比较，而且在 ECMA-262 第 3 版之前是不存在的。增加这个特殊值的目的就是为了正式明确空对象指针（null）和未初始化变量的区别。

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
## 3.4.3 Null 类型

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

## 3.4.4 Boolean 类型

Boolean（布尔值）类型是 ECMAScript 中使用最频繁的类型之一，它有两个字面值：true 和 false。这两个布尔值不同于数值，因此 true 不等于 1，false 不等于 0。下面是给变量赋布尔值的例子：

```javascript
let found = true;
let lost = false;
```

注意，布尔值字面量 true 和 false 是区分大小写的，因此 True 和 False（及其他大小混写形式）是有效的标识符，但不是布尔值。

虽然布尔值只有两个，但所有其他 ECMAScript 类型的值都有相应布尔值的等价形式。要将一个其他类型的值转换为布尔值，可以调用特定的 Boolean() 转型函数：

```javascript
let message = "Hello world!";
let messageBoolean = Boolean(message);
```

在这个例子中，字符串 message 会被转换为布尔值并保存在变量 messageAsBoolean 中。Boolean() 转型函数可以在任何类型的数据上调用，而且始终返回一个布尔值。什么值能转换为 true 或 false 的规则取决于数据类型和实际的值。下表总结了不同类型与布尔值之间的转换规则。

| 数据类型      | 转换为 true 的值 | 转换为 false 的值     |
| --------- | ----------- | ---------------- |
| Boolean   | true        | false            |
| String    | 非空字符串       | ""（空字符串）         |
| Number    | 非零数值（包括无穷值） | 0、NaN（参见后面的相关内容） |
| Object    | 任意对象        | null             |
| Undefined | N/A（不存在）    | undefined        |

理解以上转换非常重要，因为像 if 等流控制语句会自动执行其他类型值到布尔值的转换，例如：

```javascript
let message = "Hello world!";
if (message) {
    console.log("Value is true");
}
```

在这个例子中，console.log 会输出字符串 "Value is true"，因为字符串 message 会被自动转换为等价的布尔值 true。由于存在这种自动转换，理解流控制语句中使用的是什么变量就非常重要。错误地使用对象而不是布尔值会明显改变应用程序的执行流。

## 3.4.5 Number 类型

ECMAScript 中的 Number 类型使用 IEEE 754 格式表示整数和浮点值（在某些语言中也叫双精度值）。不同的数值类型相应地也有不同地数值字面量格式。

最基本的数值字面量格式是十进制整数，直接写出来即可：

```javascript
let intNum = 55; // 整数
```

整数也可以用二进制（以 2 为基数）、八进制（以 8 为基数）或十六进制（以 16 为基数）字面量表示。二进制字面量的前缀 0b   后面必须是一系列 1 和 0：

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

使用二进制、八进制和十进制格式创建的数值在所有数学操作中都被视为十进制数值。

>注意
>
>由于 JavaScript 保存数值的方式，实际上可能存在正零（+0）和负零（-0）。正零和负零在所有情况下都被认为是等同的，这里特地说明一下。
### 3.4.5.1 浮点值

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

浮点值的精确度最高可达 17 位小数，但在算术计算中远不如整数精确。例如，0.1 加 0.2 得到的不是 0.3，而是0.30000000000000004。由于这种微笑的舍入错误，导致很难测试特定的浮点值。比如下面的例子：8

``` javascript
// 别这么干
if (a + b == 0.3) {
    console.log("You got 0.3.");
}
```

这里检测两个数值之和是否等于 0.3。如果两个数值分别是 0.05 和 0.25，或者 0.15 和 0.15。那没问题。但如果是 0.1 和 0.2，如前所述，测试将失败。因此永远不要测试某个特定的浮点值。
>注意
>之所以存在这种舍入错误，是因为使用了 IEEE 754 数值，这种错误并非 ECMAScript 所独有。其他使用相同格式的语言也有这个问题。

#### ai overview

在 JavaScript 中，`0.1+0.2`不等于 `0.3` 是因为计算机使用**二进制**存储小数，而 `0.1` 和 `0.2`，转成二进制后是**无限循环小数**。JavaScript 采用 IEEE 754 双精度浮点数标准，尾数最多只能存 52 位，多余的位数互被截断，导致运算时产生微小的精度丢失，最终结果变成了 `0.3000000000000000004`。
核心原因
>- **二进制与十进制的冲突**：十进制的 `0.1` 和 `0.2` 无法在有限的二进制中精确表达。
>- **精度截断（舍入误差）**：由于位数限制，无限循环的二进制数本被截断，造成存储时已经损失了精度。
>- **结果不匹配**：两个失真的数字相加后，无法还原成完美的 `0.3`，而是无限接近。

常见解决方法
>- **使用 `toFixed`** 方法，通过指定保留的小数位来来四舍五入（例如 `(0.1 + 0.2).toFixed(1)`转为字符串（"0.3"））
>- **设置误差范围（Number.EPSILON）**：利用极小的公差判断是否相等，如 `Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON`
>- **放大倍数计算**：先将小数放大成整数进行运算，再缩小（例如 `(0.1 * 10 + 0.2 * 10)`/ 10）。
>- **使用 big.js 解决浮点数精度问题**
### 3.4.5.2 数字分隔符

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
### 3.4.5.3 值的范围

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

#### ai overview
这一节讲的是 **JavaScript Number 类型能表示的数值范围**。核心是：**ECMAScript 使用 IEEE 754 双精度浮点数（64 位）存储数字，所以不是无限大的。** ([ECMA-262](https://262.ecma-international.org/16.0/?utm_source=chatgpt.com "ECMA-262, 16<sup>th</sup> edition, June 2025<br>ECMAScript® 2025 Language Specification"))

1. JavaScript Number 的范围

JavaScript 中所有数字都是：

```js
Number
```

底层采用：

```
IEEE 754 双精度浮点数
```

结构：

```
64 bit
┌────────┬────────────┬────────────────┐
│ 符号位 │ 指数位     │ 尾数位         │
│ 1 bit  │ 11 bit     │ 52 bit         │
└────────┴────────────┴────────────────┘
```

所以它能表示的范围有限。

---

2. 最大值 Number.MAX_VALUE

```js
console.log(Number.MAX_VALUE);
```

输出：

```
1.7976931348623157e+308
```

也就是：

```
1.7976931348623157 × 10³⁰⁸
```

这是 JavaScript 能表示的**最大有限数字**。([TC39](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html?utm_source=chatgpt.com "ECMAScript® 2026 Language Specification"))

例如：

```js
let a = Number.MAX_VALUE;

console.log(a);
```

结果：

```
1.7976931348623157e+308
```

---

继续增加：

```js
console.log(Number.MAX_VALUE * 2);
```

结果：

```
Infinity
```

为什么？

因为：

```
1.7976931348623157 × 10³⁰⁸
        ↓
超过 IEEE754 能保存范围
        ↓
Infinity
```

这叫：

```
overflow（上溢）
```

---

3. Infinity（无穷大）

JavaScript 有三个特殊数字：

```js
Infinity
-Infinity
NaN
```

例如：

```js
console.log(1 / 0);
```

结果：

```
Infinity
```

因为数学：

```
1 ÷ 0 = ∞
```

JavaScript 使用特殊值表示。

---

负数：

```js
console.log(-1 / 0);
```

结果：

```
-Infinity
```

---

4. 最小值 Number.MIN_VALUE

这里容易误解。

很多人认为：

```
Number.MIN_VALUE
=
JavaScript 最小负数
```

❌ 错误。

实际上：

```js
Number.MIN_VALUE
```

表示：

> 最接近 0 的正数

不是最小负数。([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_VALUE?utm_source=chatgpt.com "Number.MIN_VALUE - JavaScript | MDN"))

值：

```
5e-324
```

也就是：

```
0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005
```

非常接近 0。

---

例如：

```js
console.log(Number.MIN_VALUE);
```

输出：

```
5e-324
```

---

如果继续缩小：

```js
console.log(Number.MIN_VALUE / 2);
```

结果：

```
0
```

因为：

```
5e-324
÷2
↓
小于可表示范围
↓
舍入为 0
```

这个叫：

```
underflow（下溢）
```

---

5. 超出范围会发生什么？

正数超过最大值

```js
let x = Number.MAX_VALUE;

console.log(x * 2);
```

结果：

```
Infinity
```

---

负数超过范围

```js
console.log(-Number.MAX_VALUE * 2);
```

结果：

```
-Infinity
```

---

6. Infinity 还能参与计算吗？

可以参与，但是结果通常还是 Infinity。

例如：

```js
console.log(Infinity + 100);
```

结果：

```
Infinity
```

```js
console.log(Infinity * 2);
```

结果：

```
Infinity
```

---

但是：

```js
console.log(Infinity - Infinity);
```

结果：

```
NaN
```

因为：

```
∞ - ∞
```

数学上没有确定值。

---

7. 判断是不是有限数字

使用：

```js
isFinite()
```

例如：

```js
let result = Number.MAX_VALUE + Number.MAX_VALUE;

console.log(result);
```

结果：

```
Infinity
```

检测：

```js
console.log(isFinite(result));
```

结果：

```
false
```

因为：

```
Infinity
不是有限数字
```

([TC39](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html?utm_source=chatgpt.com "ECMAScript® 2026 Language Specification"))

---

8. 注意：范围 ≠ 精度

这是 JavaScript 数字最容易混淆的地方。

JavaScript 有：

范围

能表示多大：

```
5e-324
~
1.7976931348623157e+308
```

---

精度

整数精确到哪里：

```js
Number.MAX_SAFE_INTEGER
```

值：

```
9007199254740991
```

也就是：

```
2^53 - 1
```

超过：

```js
9007199254740992
```

以后整数可能不准确。([TC39](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html?utm_source=chatgpt.com "ECMAScript® 2026 Language Specification"))

例如：

```js
console.log(9007199254740992 + 1);
```

结果：

```
9007199254740992
```

不是：

```
9007199254740993
```

---

总结

| 属性                        | 值                         | 含义        |
| ------------------------- | ------------------------- | --------- |
| `Number.MAX_VALUE`        | `1.7976931348623157e+308` | 最大有限数字    |
| `Number.MIN_VALUE`        | `5e-324`                  | 最接近 0 的正数 |
| `Infinity`                | ∞                         | 正数溢出      |
| `-Infinity`               | -∞                        | 负数溢出      |
| `Number.MAX_SAFE_INTEGER` | `9007199254740991`        | 最大安全整数    |

一句话：

> JavaScript Number 可以表示非常大的数（10³⁰⁸），但只能保证大约 15～17 位有效数字；超过范围变 Infinity，超过精度整数会丢失。

###  3.4.5.4 NaN

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
### 3.4.5.5 数值转换

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
let num2 = Number(""); // 0
let num3 = Number("000011"); // 11
let num4 = Number(true); // 1
```

可以看到，字符串 "Hello wrold" 转换之后是 NaN，因为它找不到对应的数值。空字符串转换后是 0。字符串 000011 转换后是 11，因为前面的零被忽略了。最后，true 转换为 1。

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

在这个例子中，第一个转换是正确的，而第二个转换失败了。区别在于第一次传入了进制数作为参数，告诉 parseInt() 要解析的是一个十六进制字符串。而第二个转换检测到第一个字符就是非数值字符，随即自动停止并返回 NaN。

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
## 3.4.6 BigInt 类型

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

如上所示，BigInt() 函数接受一个数值字面量（或数字字符串），可以是二进制、八进制、十进制或十六进制。
BigInt 与 Number 类似，但这两种类型不能同时出现在算术或位运算中。另外，BigInt 不能用于内置的 Math 方法：

```javascript
123n + 123n; // ok

1235 + 123n; // TypeError
Math.round(123n); // TypeError
```
### 3.4.6.1 格式转换

普通整数值可以与 BigInt 格式相互转换，但由于底层内存表示方式的根本差异，这种转换免不了会丢失精度。BigInt 类型与非整数是不兼容的：

```javascript
123n === BigInt(123); // true
123 === Number(123n); // true

// 注意，转换后会丢失精度
Number(BigInt(10000000000054321)); // 10000000000054320
Number(54321n + BigInt(1E16)); // 10000000000054320

BigInt(0.5); // RangeError
```

### 3.4.6.2 操作符

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
### 3.4.6.3 静态方法

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
### 3.4.6.4 JSON

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
### ai overview
可以把你这大段 BigInt 理解成一句话：

> **BigInt 就是 JavaScript 专门拿来保存“非常大的整数”的数据类型。**

最核心的原因是：**`Number` 在整数超过 `2^53 - 1` 后，无法保证每个整数都精确表示。**

---

#### 1. 为什么需要 BigInt？

JavaScript 普通数字是 `Number`：

```js
let a = 100;
let b = 3.14;
```

但是 `Number` 底层使用 IEEE 754 双精度浮点数。

它能够**精确表示的整数范围**是：

```js
Number.MAX_SAFE_INTEGER
// 9007199254740991
```

也就是：

```text
2^53 - 1
```

超过这个范围，就可能出现“数字看起来对，但实际上已经不精确”。

例如：

```js
console.log(9007199254740991);
// 9007199254740991

console.log(9007199254740992);
// 9007199254740992

console.log(9007199254740993);
// 9007199254740992
```

你写的是：

```text
9007199254740993
```

JavaScript 最后却变成：

```text
9007199254740992
```

因为 `Number` 已经装不下这么多精确的信息了。

---

#### 2. BigInt 就是解决这个问题的

BigInt 可以表示非常大的整数。

例如：

```js
let a = 9007199254740993n;

console.log(a);
// 9007199254740993n
```

注意后面的：

```js
n
```

它表示：

> **这是 BigInt，不是 Number。**

例如：

```js
123
```

是 Number。

```js
123n
```

是 BigInt。

---

#### 3. BigInt 怎么创建？

最简单：

```js
const a = 123n;
```

也可以：

```js
const b = BigInt(123);
```

字符串也可以：

```js
const c = BigInt("12345678901234567890");
```

甚至十六进制：

```js
const d = BigInt("0x12345");
```

---

#### 4. BigInt 和 Number 最大的区别

这是最容易考、也是最容易踩坑的地方：

> **BigInt 和 Number 不能直接混合做算术。**

例如：

```js
123n + 456n
```

可以。

但是：

```js
123 + 456n
```

会报错：

```text
TypeError
```

为什么？

因为：

```text
123
```

是 Number。

而：

```text
456n
```

是 BigInt。

JavaScript 不允许你直接把两种不同的数字体系混在一起计算。

---

#### 5. 怎么转换？

两者可以手动转换。

#### Number → BigInt

```js
BigInt(123)
```

得到：

```js
123n
```

#### BigInt → Number

```js
Number(123n)
```

得到：

```js
123
```

但是这里有一个非常重要的问题：

> **BigInt → Number 可能丢精度。**

例如：

```js
const x = 10000000000054321n;

Number(x);
```

可能得到：

```text
10000000000054320
```

少了 1。

所以可以记住：

```text
Number → BigInt
通常没问题（前提是 Number 本身已经是准确整数）

BigInt → Number
可能丢精度
```

---

#### 6. 为什么 `BigInt(0.5)` 会报错？

因为 BigInt 只表示：

> **整数**

它不能表示：

```js
0.5
1.2
3.14
```

所以：

```js
BigInt(0.5);
```

直接报：

```text
RangeError
```

但：

```js
BigInt(123);
```

可以。

因此：

```text
BigInt = 大整数

不是“大数字”
而是“大整数”
```

这是非常重要的区别。

---

#### 7. BigInt 做除法是什么效果？

例如：

```js
10n / 3n
```

结果：

```js
3n
```

而不是：

```text
3.333333...
```

因为 BigInt 没有小数。

所以：

```js
100n / 3n
```

得到：

```js
33n
```

你可以理解成：

> **BigInt 除法会直接把小数部分扔掉。**

---

#### 8. BigInt 也能比较

虽然：

```js
123 + 123n
```

不允许。

但是比较是可以的：

```js
4n > 3
// true
```

```js
4n === 4
// false
```

为什么 `===` 是 false？

因为：

```text
4  → Number
4n → BigInt
```

类型不同。

而：

```js
4n == 4
```

则是：

```js
true
```

因为 `==` 会进行类型转换。

所以实际开发中最好记：

```js
4n === 4
// false
```

---

#### 9. BigInt 为什么不能使用 Math？

比如：

```js
Math.round(123n)
```

会报错。

因为：

```text
Math
主要是 Number 体系的数学 API
```

而：

```text
BigInt
是另一套整数体系
```

所以不要这样：

```js
Math.max(1n, 2n)
```

---

#### 10. `asIntN` / `asUintN` 是干什么的？

这个部分其实不用一开始就深究。

简单理解：

> **把一个 BigInt 强制限制在指定的“位数”范围里。**

例如：

```js
BigInt.asUintN(4, 24n)
```

4 位无符号整数只能表示：

```text
0 ~ 15
```

因为：

```text
2^4 = 16
```

所以：

```js
24n
```

相当于：

```text
11000
```

只保留最低 4 位：

```text
1000
```

也就是：

```js
8n
```

所以：

```js
BigInt.asUintN(4, 24n);
// 8n
```

---

#### 11. `asIntN` 为什么会出现负数？

因为有符号整数使用：

> **补码（two's complement）**

例如 4 位有符号整数：

```text
1000
```

代表：

```text
-8
```

所以：

```js
BigInt.asIntN(4, 24n);
```

得到：

```js
-8n
```

而：

```js
BigInt.asUintN(4, 24n);
```

得到：

```js
8n
```

你目前学 JS 的话，可以先把它记成：

```text
asUintN → 当成无符号整数处理

asIntN → 当成有符号整数处理
```

真正涉及二进制、位运算、底层数据处理时再深入。

---

#### 12. BigInt 最实用的地方在哪里？

这个比背语法更重要。

例如数据库 ID：

```js
const userId = 12345678901234567890n;
```

订单号：

```js
const orderId = 202608181234567890123n;
```

区块链：

```js
const amount = 123456789012345678901234567890n;
```

金融、加密、文件大小、时间戳、数据库超大整数等场景，都可能需要 BigInt。

不过你贴的书里这句：

> BigInt 应该只用于数值大于 2e53 的场景。

更准确地理解应该是：

> **当你需要精确处理超过 `Number.MAX_SAFE_INTEGER` 的整数时，BigInt 才特别有价值。**

不是说：

```js
100
```

也应该写成：

```js
100n
```

没必要。

---

#### 13. BigInt 和 Number 最重要的对比

||Number|BigInt|
|---|---|---|
|普通整数|✅|✅|
|小数|✅|❌|
|超大整数|⚠️ 可能丢精度|✅|
|`123 + 456`|✅|❌|
|`123n + 456n`|❌|✅|
|`123 + 456n`|❌|❌|
|`Math.xxx()`|✅|❌|
|JSON 默认序列化|✅|❌|

你可以记成一句口诀：

> **Number 能算小数，BigInt 专门算大整数；两者不能直接混算。**

---

#### 14. 为什么 JSON 不支持 BigInt？

这是前端开发中特别容易遇到的问题。

例如：

```js
const data = {
  id: 12345678901234567890n
};

JSON.stringify(data);
```

会报：

```text
TypeError
```

因为 JSON 本身没有专门的 BigInt 类型。

通常的做法是：

```js
JSON.stringify(data, (key, value) => {
  return typeof value === "bigint"
    ? value.toString()
    : value;
});
```

结果：

```json
{
  "id": "12345678901234567890"
}
```

也就是说：

```text
BigInt
   ↓
JSON
   ↓
字符串
```

然后取出来的时候再转回去：

```js
BigInt("12345678901234567890")
```

---

#### 15. 前端项目里最容易遇到的一个坑

例如后端返回：

```json
{
  "userId": 12345678901234567890
}
```

如果这个数字超过 JS `Number` 的安全范围，前端直接解析 JSON 后：

```js
data.userId
```

就可能已经不准确了。

所以实际项目中经常会把超大 ID 返回成字符串：

```json
{
  "userId": "12345678901234567890"
}
```

前端如果确实需要进行大整数计算，再：

```js
const userId = BigInt(data.userId);
```

这也是为什么你在很多真实项目的 API 里，会看到：

```json
"id": "12345678901234567890"
```

明明看起来应该是数字，却故意设计成字符串。

---

#### 16. 你现在真正需要记住的只有 6 个知识点

```js
// 1. Number
123

// 2. BigInt
123n

// 3. 超大整数
9007199254740993n

// 4. BigInt 不能和 Number 直接计算
123n + 123 // TypeError

// 5. BigInt 没有小数
10n / 3n // 3n

// 6. BigInt 转 Number 可能丢精度
Number(10000000000054321n)
```

---

#### 最后用一个生活中的比喻

你可以把：

```text
Number
```

想象成一个**普通计算器**。

它处理：

```text
10
100
3.14
999999
```

完全没问题。

但是数字大到一定程度：

```text
9007199254740993
```

普通计算器开始“不够精确”。

这时候：

```text
BigInt
```

就像一个**专门处理超大整数的计算器**。

所以：

```text
Number
= 普通数字 + 小数

BigInt
= 超大整数
```

这基本就是 BigInt 的核心。

另外，你这段资料里有一个值得纠正的小地方：**“2e53”不是 `Number` 的精确整数上限。真正关键的阈值是 `Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9007199254740991`。**

## 3.4.7 String 类型

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

### 3.4.7.1 字符字面量

字符串数据类型包含一些字符字面量，用于表示非打印字符或有其他用途的字符，如下表所示：

| 字面量    | 含义                                                             |
| ------ | -------------------------------------------------------------- |
| \n     | 换行                                                             |
| \t     | 制表                                                             |
| \b     | 退格                                                             |
| \r     | 回车                                                             |
| \f     | 换页                                                             |
| `\\`   | 反斜杠（\）                                                         |
| `\'`   | 单引号（'），在字符串以单引号标识时使用，例如 'He said, `\'hey.\''`                  |
| `\"`   | 双引号（"），在字符串以双引号标示时使用，例如 "He said, `\"hey.\""`                  |
| \`     | 反引号（`），在字符串以反引号表示时间使用，例如 He said, \'hey,\```                   |
| \xnn   | 以十六进制编码 nn 表示的字符（其中 n 是十六进制数字 0~F），例如 \x41 等于 "A"              |
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
### 3.4.7.2 字符串的特点

ECMAScript 中的字符串是不可变的（immutable），意思是一旦创建，它们的值就不能变了。要修改某个变量中的字符串值，必须先销毁原始的字符串，然后将包含新值的另一个字符串保存到该变量，如下所示：

```javascript
let lang = "Java";
lang = lang + "Script";
```

这里，变量 lang 一开始包含字符串 "Java"。紧接着，lang 被重新定义为包含 "Java" 和 "Script" 的组合，也就是 "JavaScript"。整个过程首先会分配要给足够容纳 10 个字符的空间，然后填充上 "Java" 和 "Script"。最后销毁原始的字符串 "Java" 和字符串 "Script"，因为这两个字符串都没有用了。
#### ai overview
1. JavaScript 字符串本质：UTF-16
在浏览器和 JS 引擎（V8 / SpiderMonkey）里：

> **字符串 = UTF-16 的 code unit 序列**

比如：
```javascript
const s = "A";
```
实际上存的是：
```
0x0041（16 位 code unit）
```
再比如 emoji：
```javascript
const s = "😄";
```
会变成两个 16 位单元（代理对）：
```javascript
0xD83D 0xDE04
```
2. utf-8 在哪里用？
utf-8 **不用于 JS 字符串内部存储**，而是用于：
网络传输
```http
Content-Type: text/html; charset=utf-8
```
浏览器接收的是 UTF-8 字节流，然后：

👉 **解码成 UTF-16 JS 字符串**
3. 文件/API/Buffer
比如 Node.js
```javascript
Buffer.from("你好", "utf-8")
```
这里才是 UTF-8。
4. URL/JSON/HTTP
- JSON 默认 UTF-8
- URL encode 也是 UTF-8
4. 一个完整流程（最重要）
```
服务器（UTF-8字节）
        ↓
浏览器解析
        ↓
转换成 UTF-16
        ↓
JS 字符串（内部表示）
```
反过来：
```
JS 字符串（UTF-16）
        ↓
发送请求 / encode
        ↓
UTF-8 bytes
        ↓
网络传输
```
### 3.4.7.3 转换为字符串

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

给这个方法传入非正则表达式值会导致该值被转换为 RegExp 对象。如果想改变这种行为，让方法直接使用参数，可以重新定义 Symbol.replace 函数以取代默认对正则表达式求值的行为，从而让 replace() 方法使用非正则表达式实例。Symbol.replace 函数接收两个参数，即调用 replace() 方法的字符串实例和替换字符串。返回的值没有限制：

```javascript
class FooReplacer {
    static [Symbol.replace](target, replacement) {
        return target.split('foo').join(replacement);
    }
}

console.log('barfoobaz'.replace(FooReplacer, 'qux'));;
// "barquxbaz"

class StringReplacer {
    constructor(str) {
        this.str = str;
    }
    
    [Symbol.replace](tareget, replacement) {
        return target.split(this.str).join(replacement);
    }
}

console.log('barfoobaz'.replace(new StringReplacer('foo'), 'qux'));
```

<br>

#### 7. Symbol.search

这个符号表示一个作为属性的正则表达式方法，该方法返回字符串中匹配正则表达式的索引，在底层由 String.prototype.search() 方法使用。String.prototype.search() 方法会使用以 Symbol.search 为键的函数来对正则表达式求值。正则表达式的原型上默认有这个函数的定义，因此所有正则表达式实例默认是这个 String 方法的有效参数：

```javascript
console.log(RegExp.prototype[Symbol.search]);
// f [Symbol.search]() { [native code] }

console.log('foobar'.search(/bar/));
// 3
```

给这个方法传入非正则表达式值会导致该值被转换为 RegExp 对象。如果想改变这种行为，让方法直接使用参数，可以重新定义 Symbol.search 函数以取代默认对正则表达式求值的行为，从而让 search() 方法使用非正则表达式实例。Symbol.search 函数接收一个参数，就是调用 search() 方法的字符串实例。返回的值没有限制：

```javascript
class FooSearcher {
    static [Symbol.search](target) {
        return target.indexOf('foo');
    }
}

console.log('foobar'.search(FooSearcher)); // 0
console.log('barfoo'.search(FooSearcher)); // 3
console.log('barbaz'.search(FooSearcher)); // -1

class StringSearcher {
    constructor(str) {
        this.str = str;
    }
    
    [Symbol.search](target) {
        return target.indexOf(this.str);
    }
}

console.log('foobar'.search(new StringSearcher('foo'))); // 0
console.log('barfoo'.search(new StringSearcher('foo'))); // 3
console.log('barbaz'.search(new StringSearcher('qux'))); // -1
```

<br>

#### 8. Symbol.species

这个符号表示作为一个属性的函数值，该函数作为创建派生对象的构造函数。这个属性在内置类型值中最常用，用于对内置类型实例方法的返回值暴露实例化派生对象的方法。用 Symbol.species 定义静态的获取器（getter）方法，可以覆盖新创建实例的原型定义：

```javascript
class Bar extends Array {}
class Baz extends Array {
    static get [Symbol.species]() {
        return Array;
    }
}

let bar = new Bar();
console.log(bar instanceof Array); // true
console.log(bar instanceof Bar); // true

bar = bar.concat('bar');
console.log(bar instanceof Array); // true
console.log(bar instanceof Bar); // true

let baz = new Baz();
console.log(baz instanceof Array); // true
console.log(baz instanceof Baz); // true
baz = baz.concat('baz');
console.log(baz instanceof Array); // true
console.log(baz instanceof Baz); // false
```

<br>

#### 9. Symbol.split

这个符号表示一个作为属性的正则表达式方法，该方法在匹配正则表达式的索引位置拆分字符串，在底层由 String.prototype.split() 方法使用。String.prototype.split() 方法会使用以 Symbol.split 为键的函数来对正则表达式求值。正则表达式的原型上默认有这个函数的定义，因此所有正则表达式实例默认是这个 String 方法的有效参数：

```javascript
console.log(RegExp.prototype[Symbol.split]);
// f [Symbol.split]() { [native code] }

console.log('foobarbaz'.split(/bar/));
// ['foo', 'baz']
```

给这个方法传入非正则表达式值会导致该值被转换为 RegExp 对象。如果想改变这种行为，让方法直接使用参数，可以重新定义 Symbol.split 函数以取代默认对正则表达式求值的行为，从而让 split() 方法使用非正则表达式实例。Symbol.split 函数接收一个参数，就是调用 split() 方法的字符串实例。返回的值没有限制：

```javascript
class FooSplitter {
    static [Symbol.split](target) {
        return target.split('foo');
    }
}

console.log('barfoobaz'.split(FooSpliter));
// ["Bar", "baz"]

class StringSplitter {
    constructor(str) {
        this.str = str;
    }
    
    [Symbol.split](target) {
        return target.split(this.str);
    }
}

console.log('barfoobaz'.split(new StringSplitter('foo')));
// ["bar", "baz"]
```

<br>

#### 10. Symbol.toPrimitive

这个符号表示一个作为属性的方法，该方法将对象转换为相应的原始值，由 ToPrimitive 抽象操作使用。很多内置操作会尝试强制将对象转换为原始值，包括字符串、数值和未指定的原始类型。对于一个自定义对象实例，通过在这个实例的 Symbol.toPrimitive 属性上定义一个函数可以改变默认行为。

根据提供给这个函数的参数（"string"、"number" 或 "default"），可以控制返回的原始值：

```javascript
class Foo {}
let foo = new Foo();

console.log(3 + foo); // "3[object Object]"
console.log(3 - foo); // NaN
console.log(String(foo)); // "[object Object]"

class Bar {
    constructor() {
        this[Symbol.toPrimitive] = function(hint) {
            switch (hint) {
                case 'number':
                    return 3;
                case 'string':
                    return 'string bar';
                case 'default':
                default:
                    return 'default bar';
            }
        }
    }
}

let bar = new Bar();

console.log(3 + bar); // "3default bar"
console.log(3 - bar); // 0
console.log(String(bar)); // "string bar"
```

<br>

#### 11. Symbol.toStringTag

这个符号表示一个作为属性的字符串，该字符串用于创建对象的默认字符串描述，由内置方法 Object.prototype.toString() 在底层使用。

通过 toString() 方法获取对象标识时，会检索由 Symbol.toStringTag 指定的实例标识符，默认为 "Object"。内置类型已经指定了这个值，但自定义类实例还需要明确定义：

```javascript
let s = new Set();

console.log(s); // Set(0) {}
console.log(s.toString()); // [object Set]
console.log(s[Symbol.toStringTag]); // Set

class Foo {}
let foo = new Foo();

console.log(foo); // Foo {}
console.log(foo.toString()); // [object Object]
console.log(foo[Symbol.toStringTag]); // undefined

class Bar {
    constructor() {
        this[Symbol.toStringTag] = 'Bar';
    }
}
let bar = new Bar();

console.log(bar); // Bar {}
console.log(bar.toString()); // [object Bar]
console.log(bar[Symbol.toStringTag]); // Bar
```

<br>

#### 12. Symbol.unscopeables

这个符号表示一个作为属性的对象，该对象所有的以及继承的属性，都会从关联对象的 with 环境绑定中排除。设置这个符号并让其映射对应属性的键值为 true，就可以阻止该属性出现在 with 环境绑定中，如下例所示：

```javascript
let o = { foo: 'bar' };

with (o) {
    console.log(foo); // bar
}

o[Symbol.unscopables] = {
    foo: true;
};

with (o) {
    console.log(foo); // ReferenceError
}
```

>注意
>
>不推荐使用 with，因此也不推荐使用 Symbol.unscopeables。

<br>

## 9. Object 类型

ECMAScript 中的对象其实就是一组数据和功能的集合。对象通过 new 操作符后跟对象类型的名称来创建。开发者可以通过创建 Object 类型的实例来创建自己的对象，然后再给对象添加属性和方法：

```javascript
let o = new Object();
```

这个语法类似 Java，但 ECMAScript 只要求在给构造函数提供参数时使用括号。如果没有参数，如上面的例子所示，那么完全可以省略括号（不推荐）：

```javascript
let o = new Object; // 合法，但不推荐
```

Object 的实例本身并不是很有用，但理解与它相关的概念非常重要。类似 Java 中的 java.lang.Object，ECMAScript 中的 Object 也是派生其他对象的基类。Object 类型的所有属性和方法在派生的对象上同样存在。

每个 Object 实例都有如下属性和方法。

* constructor：用于创建当前对象的函数。在前面的例子中，这个属性的值就是 Object() 函数。
* hasOwnProperty(propertyName)：用于判断当前对象实例（不是原型）上是否存在给定的属性。要检查的属性名必须是字符串（如 o.hasOwnproperty("name")）或符号。
* isPrototypeOf(object)：用于判断当前对象是否为另一个对象的原型。
* propertyIsEnumerable(propertyName)：用于判断给定的属性是否可以使用（本章稍后讨论的）for-in 语句枚举。与 hasOwnProperty() 一样，属性名必须是字符串。
* toLocaleString()：返回对象的字符串表示，该字符串反映对象所在的本地化执行环境。
* toString()：返回对象的字符串表示。
* valueOf()：返回对象对应的字符串、数值或布尔值表示。通常与 toString() 的返回值相同。因为在 ECMAScript 中 Object 是所有对象的基类，所以任何对象都有这些属性和方法。

>注意
>
>严格来讲，ECMA-262 中对象的行为不一定适合 JavaScript 中的其他对象。比如浏览器环境中的 BOM 和 DOM 对象，它们都是由宿主环境定义和提供的宿主对象。而宿主对象不受 ECMA-262 约束，所以它们可能会可能不会继承 Object。

<br>

# 5. 操作符

ECMA-262 描述了一组可用于操作数据值的操作符，包括数学操作符（如加、减）、位操作符、关系操作符和相等操作符等。ECMAScript 中的操作符是独特的，因为它们可用于各种值，包括字符串、数值、布尔值，甚至还有对象。在应用给对象时，操作符通常会调用 valueOf() 和 toString() 方法来取得可以计算的值。

## 1. 一元操作符

只操作一个值得操作符叫一元操作符（unary operator）。一元操作符是 ECMAScript 中最简单的操作符。

<br>

### 1. 递增/递减操作符

递增和递减操作符直接照搬自 C 语言，但有两个版本：前缀版和后缀版。顾名思义，前缀版就是位于要操作的变量前头，后缀版就是位于要操作的变量后头。前缀递增操作符会给数值加 1，把两个加号（++）放到变量前头即可：

```javascript
let age = 29;
++age;
```

在这个例子中，前缀递增操作符把 age 的值变成了 30（给之前的值 29 加 1）.因此，它实际上等于如下表达式：

```javascript
let age = 29;
age = age + 1;
```

前缀递减操作符也类似，只不过是从一个数值减 1。使用前缀递减操作符，只要把两个减号（--）放到变量前头即可：

```javascript
let age = 29;
--age;
```

执行操作后，变量 age 的值变成了 28（从 29 减 1）。

无论使用前缀递增还是前缀递减操作符，变量的值都会在语句被求值之前改变。（在计算机科学中，这通常被称为具有副作用）。请看下面的例子：

```javascript
let age = 29;
let anotherAge = --age + 2;

console.log(age); // 28
console.log(anotherAge); // 30
```

在这个例子中，变量 anotherAge 以 age 减 1 后的值再加 2 进行初始化。因为递减操作先发生，所以 age 的值先变成 28，然后再加 2，结果是 30。

前缀递增被递减在语句中的优先级是相等的，因此会从左到右依次求值。比如：

```javascript
let num1 = 2;
let num2 = 20;
let num3 = --num1 + nunm2;
let num4 = num1 + num2;
console.log(num3); // 21
console.log(num4); // 21
```

这里，num3 等于 21 是因为 num1 先减 1 之后才加 num2。变量 num4 也是 21，那是因为加法使用的也是递减后的值。

递增和递减的后缀版语法一样（分别是 ++ 和 --），只不过要放在变量后面。后缀版与前缀版的主要区别在于，后缀版递增和递减在语句被求值后才发生。在某些情况下，这种差异没什么影响，比如：

```javascript
let age = 29;
age++;
```

把递增操作符放到变量后果不会改变语句执行的结果，因为递增是唯一的操作。可是，在跟其他操作混合时，差异就会变明显，比如：

```javascript
let num1 = 2;
let num2 = 20;
let num3 = num1-- + num2;
let num4 = num1 + num2;
console.log(num3); // 22
console.log(num4); // 21
```

这个例子跟前面的那个一样，只是把前缀递减改成了后缀递减，区别很明显。在使用前缀版的例子中，num3 和 num4 的值都是 21。而在这个例子中，num3 的值是 22，num4 的值是 21。这里的不同之处在于，计算 num3 时使用的是 num1 的原始值（2），而计算 num4 时使用的是 num1 递减后的值（1）。

这 4 个操作符可以作用域任何值，意思是不限于整数，字符串、布尔值、浮点值，甚至对象都可以。递增和递减操作符遵循如下规则。

* 对于字符串，如果是有效的数值形式，则转换为数值再应用改变。变量类型从字符串变成数值。
* 对于字符串，如果不是有效的数值形式，则将变量的值设置为 NaN。变量类型从字符串变成数值。
* 对于布尔值，如果是 false，则转换为 0 再应用改变。变量类型从布尔值变成数值。
* 对于布尔值，如果是 true，则转换为 1 再应用改变。变量类型从布尔值变成数值。
* 对于浮点值，加 1 或减 1。
* 如果是对象，则调用其 valueOf() 方法取得可以操作的值。对得到的值应用上述规则。如果是 NaN，则调用 toString() 并再次应用其他规则。变量类型从对象变成数值。

下面的例子演示了这些规则：

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

s1++; // 值变成数值 3
s2++; // 值变成 NaN
b++; // 值变成数值 1
f--; // 值变成 0.10000000000000009（因为浮点数不精确）
o--; // 值变成 -2
```

<br>

### 2. 一元加和减

一元加和减操作符对大多数开发者来说并不陌生，它们在 ECMAScript 中跟在高中数学中的用途一样。一元加由一个加号（+）表示，放在变量前头，对数值没有任何影响：

```javascript
let num = 25;
num = +num;
console.log(num); // 25
```

如果将一元加应用到非数值，则会执行与使用 Number() 转型函数一样的类型转换：布尔值 false 和 true 转换为 0 和 1，字符串根据特殊规则进行解析，对象会调用它们的 valueOf() 和 toString() 方法以得到可以转换的值。

下面的例子演示了一元加在应用到不同数据类型时的行为：

```javascript
let s1 = "01";
let s2 = "1.1";
let x3 = "z"l
let b = false;
let f = 1.1;
let o = {
    valueOf() {
        return -1;
    }
};

s1 = +s1; // 值变成数值 1
s2 = +s2; // 值变成 1.1
s3 = +s3; // 值变成 NaN
b = +b; // 值变成数值 0
f = +f; // 不变，还是 1.1
o = +o; // 值变成数值 -1
```

一元减由一个减号（-）表示，放在变量前头，主要用于把数值变成负值，如把 1 转换为 -1。示例如下：

```javascript
let num = 25;
num = -num;
console.log(num); // -25
```

对数值使用一元减会将其变成相应的负值（如上面的例子所示）。在应用到非数值时，一元减会遵循与一元加同样的规则，先对它们进行转换，然后再取负值：

```javascript
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

s1 = -s1; // 值变成数值 -1
s2 = -s2; // 值变成数值 -1.1
s3 = -s3; // 值变成 NaN
b = -b; // 值变成数值 0
f = -f; // 变成 -1.1
o = -o; // 值变成数值 1
```

一元加和减操作符主要用于基本的算术，但也可以像上面的例子那样，用于数据类型转换。

<br>

## 2. 位操作符

接下来要介绍的操作符用于数值的底层操作，也就是操作内存中表示数据的比特（位）。ECMAScript 中的所有数值都以 IEEE 754 64 位格式存储，但位操作符并不直接应用到 64 位表示，而是先把值转换为 32 位的整数，再进行位操作，之后再把结果转换为 64 位。对开发者而言，就好像只有 32 位整数一样，因为 64 位整数存储格式是不可见的。既然知道了这些，就只需要考虑 32 位整数即可。

有符号整数使用 32 位的前 31 位表示整数值。第 32 位表示数值的符号。如 0 表示正，1 表示负。这一位称为符号位（sign bit），它的值决定了数值其余部分的格式。正值以真正的二进制格式存储，即 31 位中的每一位都代表 2 的幂。第一位（称为第 0 位）表示 2⁰，第二位表示 2¹ ，以此类推。如果一个位是空的，则以 0 填充，相当于忽略不计。比如，数值 18 的二进制格式为 00000000000000000000000000000000010010，或更精简的 10010。后者是用到的 5 个有效位，决定了实际的值（如下图所示）。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC3%E7%AB%A0%EF%BC%9A%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%95%B4%E6%95%B0%E7%9A%84%E8%A1%A8%E7%A4%BA.png)

负值以一种称为二补数（或补码）的二进制编码存储。一个数值的二补数通过如下 3 个步骤计算得到：

1. 确定绝对值的二进制表示（如，对于 -18，先确定 18 的二进制表示）
2. 找到数值的一补数（或反码），换句话说，就是每个 0 都变成 1，每个 1 都变成 0
3. 给结果加 1。

基于上述步骤确定 -18 的二进制表示，首先从 18 的二进制表示开始：

0000	0000	0000	0000	0000	0000	0001	0010

然后，计算一补数，即反转每一位的二进制值：

1111	1111	1111	1111	1111	1111	1110	1101

最后，给一补数加 1：

1111	1111	1111	1111	1111	1111	1110	1101

​														            1

1111	1111	1111	1111	1111	1111	1110	1110

那么，-18 的二进制表示就是 11111111111111111111111111101110。要注意的是，在处理有符号整数时，我们无法访问第 31 位。

ECMAScript 会帮我们记录这些信息。在把负值输出为一个二进制字符串时，我们会得到一个前面加了减号的绝对值，如下所示：

```javascript
let num = -18;
console.log(num.toString(2)); // "-10010"
```

在将 -18 转换为二进制字符串时，结果得到 -10010。转换过程会求得二补数，然后再以更符合逻辑的形式表示出来。

>注意
>
>默认情况下，ECMAScript 中的所有整数都表示为有符号数。不过，确实存在无符号整数。对无符号整数来说，第 32 位不表示符号，因为只有正值。无符号整数比有符号整数的范围更大，因为符号位被用来表示数值了。

在对 ECMAScript 中的数值应用位操作符时，后台会发生转换：64 位会转换为 32 位数值，然后执行位操作，最后再把结果从 32 位转换为 64 位存储起来。整个过程就像处理 32 位数值一样，这让二进制操作变得与其他语言中类似。但这个转换也导致了一个奇特的副作用，即特殊值 NaN 和 Infinity 在位操作中都会被当成 0 处理。

如果将位操作应用到非数值，那么首先会使用 Number() 函数将该值转换为数值（这个过程是自动的），然后再应用位操作。最终结果是数值。

<br>

### 1. 按位非

按位非操作符用波浪号（~）表示，它的作用是返回数值的一补数。按位非是 ECMAScript 中为数不多的几个二进制数学操作符之一。看下面的例子：

```javascript
let num1 = 25; // 二进制 0000000000000000000000000011001
let num2 = ~num1; // 二进制 11111111111111111111111111111100110
```

这里，按位非操作符作用到了数值 25，得到的结果是 -26.由此可以看出，按位非得最终效果是对数值取反并减 1，就像执行如下操作的结果一样：

```javascript
let num1 = 25;
let num2 = -num1 - 1;
console.log(num2); // -26
```

实际上，尽管两者返回的结果一样，但位操作的速度快得多。这是因为位操作是在数值的底层表示上完成的。

<br>

### 2. 按位与

按位与操作符用和号（&）表示，有两个操作数。本质上，按位与就是将两个数的每一位对齐，然后基于真值表中的规则，对每一位执行相应的与操作。

| 第一个数值的位 | 第二个数值的位 | 结果 |
| -------------- | -------------- | ---- |
| 1              | 1              | 1    |
| 1              | 0              | 0    |
| 0              | 1              | 0    |
| 0              | 0              | 0    |

按位与操作在两个位都是 1 时返回 1，在任何一位是 0 时返回 0。

下面看一个例子，我们对数值 25 和 3 求与操作，如下所示：

```javascript
let result = 25 & 3;
console.log(result); // 1
```

25 和 3 的按位与操作的结果是 1。为什么，看下面的二进制计算过程：

​    25 = 0000	0000	0000	0000	0000	0000	0001	1001

​      3 = 0000	0000	0000	0000	0000	0000	0000	0011

AND = 0000	0000	0000	0000	0000	0000	0000	0001

如上所示，25 和 3 的二进制表示中，只有第 0 位上的两个数都是 1。于是结果数值的所有其他位都会以 0 填充，因此结果就是 1。

<br>

### 3. 按位或

按位或操作符用管道符（|）表示，同样有两个操作数。按位或遵循如下真值表：

| 第一个数值的位 | 第二个数值的位 | 结果 |
| -------------- | -------------- | ---- |
| 1              | 1              | 1    |
| 1              | 0              | 1    |
| 0              | 1              | 1    |
| 0              | 0              | 0    |

按位或操作在至少一位是 1 时返回 1，两位都是 0 时返回 0。

仍然用按位与的示例，如果对 25 和 3 执行按位或，代码如下所示：

```javascript
let result = 25 | 3;
console.log(result); // 27
```

可见 25 和 3 的按位或操作的结果是 27：

​    25 = 0000	0000	0000	0000	0000	0000	0001	1001

​      3 = 0000	0000	0000	0000	0000	0000	0000	0011

  OR = 0000	0000	0000	0000	0000	0000	0001	1011

在参与计算的两个数中，有 4 位都是 1，因此它们直接对应到结果上。二进制码 11011 等于 27。

<br>

### 4. 按位异或

按位异或用脱字符（^）表示，同样有两个操作数。下面是按位异或的真值表：

| 第一个数的位 | 第二个数的位 | 结果 |
| ------------ | ------------ | ---- |
| 1            | 1            | 0    |
| 1            | 0            | 1    |
| 0            | 1            | 1    |
| 0            | 0            | 0    |

按位异或与按位或的区别是，它只在一位上是 1 的时候返回 1（两位都是 1 或 0， 则返回 0）。

对数值 25 和 3 执行按位异或操作：

```javascript
let result = 25 ^ 3;
console.log(result); // 26
```

可见，25 和 3 的按位异或操作结果为 26，如下所示：

​    2  5 = 0000	0000	0000	0000	0000	0000	0001	1001

​        3 = 0000	0000	0000	0000	0000	0000	0000	0011

  XOR = 0000	0000	0000	0000	0000	0000	0001	1010

两个数在 4 位上都是 1，但两个数的第 0 位都是 1，因此那一位在结果中就变成了 0。其余位上的 1 在另一个数上没有对应的 1，因此会直接传递到结果中。二进制码 11010 等于 26。（注意，这比对同样两个值执行按位或操作得到的结果小 1）。

<br>

### 5. 左移

左移操作符用两个小于号（<<）表示，会按照指定的位数将数值的所有位向左移动。比如，如果数值 2（二进制 10）向左移 5 位，就会得到 64（二进制 1000000），如下所示：

```javascript
let oldValue = 2; // 等于二进制 10
let newValue = oldValue << 5; // 等于二进制 1000000，即十进制 64
```

注意在移位后，数值右端会空出 5 位。左移会以 0 填充这些空位，让结果是完整的 32 位数值（见下图）。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC3%E7%AB%A0%EF%BC%9A%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80/%E5%B7%A6%E7%A7%BB%E6%93%8D%E4%BD%9C%E4%B9%8B%E5%89%8D%E6%88%96%E4%B9%8B%E5%90%8E.png)

注意，左移会保留它所操作数数值的符号。如果 -2 左移 5 位，将得到 -64，而不是 64。

<br>

### 6. 有符号右移

有符号右移由两个大于号（>>）表示，会将数值的所有 32 位都向右移，同时保留符号（正或负）。有符号右移实际上是左移的逆运算。如果将 64 右移 5 位，那就是 2：

```javascript
let oldValue = 64; // 等于二进制 1000000
let newValue = oldValue >> 5; // 等于二进制 10，即十进制 2
```

同样，移位后就会出现空位。不过，右移后空位会出现在左侧，且在符号位之后（见下图）。ECMAScript 会用符号位的值来填充这些空位，以得到完整的数值。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC3%E7%AB%A0%EF%BC%9A%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80/%E6%9C%89%E7%AC%A6%E5%8F%B7%E5%8F%B3%E7%A7%BB%E6%93%8D%E4%BD%9C%E4%B9%8B%E5%89%8D%E4%B8%8E%E4%B9%8B%E5%90%8E.png)

<br>

### 7. 无符号右移

无符号右移用 3 个大于号表示（>>>），会将数值的所有 32 位都向右移。对于正数，无符号右移与有符号右移结果相同。仍然以前面有符号右移的例子为例，64 向右移动 5 位，会变成 2：

```javascript
let oldValue = 64; // 等于二进制 1000000
let newValue = oldValue >>> 5; // 等于二进制 10，即十进制 2
```

对于负数，有时候差异会非常打。与有符号右移不同，无符号右移会给空位补 0，而不管符号位是什么。对正数来说，这跟有符号右移效果相同。但对负数来说，结果就差太多了，结果就差太多了。无符号右移操作符将负数的二进制表示当前正数的二进制表示来处理。因为负数是其绝对值的二补数，所以右移之后结果变得非常之大，如下面的例子所示：

```javascript
let oldValue = -64; // 等于二进制 11111111111111111111111111000000
let newValue = oldValue >>> 5; // 等于十进制 134217726
```

在对 -64 无符号右移 5 位后，结果是 134217726。这是因为 -64 的二进制表示是 11111111111111111111111111000000，无符号右移却将它当成正值，也就是 4294967232。把这个值向右移 5 位后，结果是 00000111111111111111111111111110，即134217726。

<br>

## 3. 布尔操作符

对于编程语言来说，布尔操作符跟相等操作符几乎同样重要。如果没有能力测试两个值的关系，那么像 if-else 和循环这样的语句也没什么用了。布尔操作符一共有 3 个：逻辑非、逻辑与和逻辑或。

### 1. 逻辑非

逻辑非操作符由一个叹号（!）表示，可应用给 ECMAScript 中的任何值。这个操作符始终返回布尔值，无论应用到的是什么数据类型。逻辑非操作符首先将操作数转换为布尔值，然后再对其取反。换句话说，逻辑非操作符会遵循如下规则。

* 如果操作数是对象，则返回 false。
* 如果操作数是空字符串，则返回 true。
* 如果操作数是非空字符串，则返回 false。
* 如果操作数是数值 0，则返回 true。
* 如果操作数是非 0 数值（包括 Infinity），则返回 false。
* 如果操作数是 null，则返回 true。
* 如果操作数是 NaN，则返回 true。
* 如果操作数是 undefined，则返回 true。

以下示例验证了上述行为：

```javascript
console.log(!false); // true
console.log(!"blue"); // false
console.log(!0); // true
console.log(!NaN); // true
console.log(!""); // true
console.log(!12345); // false
```

逻辑非操作符也可以用于把任意值转换为布尔值。同时使用两个叹号（!!）相当于调用了转型函数 Boolean()。无论操作数是什么类型，第一个叹号总会返回布尔值。第二个叹号对该布尔值取反，从而给出变量真正对应的布尔值。结果与对同一个值使用 Boolean() 函数是一样的：

```javascript
console.log(!!"blue"); // true
console.log(!!0); // false
console.log(!!NaN); // false
console.log(!!""); // false
console.log(!!12345); // true
```

<br>

### 2. 逻辑与

逻辑与操作符由两个和号（&&）表示，应用到两个值，如下所示：

```javascript
let result = true && false;
```

逻辑与操作符遵循如下真值表：

| 第一个操作数 | 第二个操作数 | 结果  |
| ------------ | ------------ | ----- |
| true         | true         | true  |
| true         | false        | fals  |
| false        | true         | false |
| false        | false        | false |

逻辑与操作符可用于任何类型的操作数，不限于布尔值。如果有操作数不是布尔值，则逻辑与并不一定会返回布尔值，而是遵循如下规则。

* 如果第一个操作数是对下个，则返回第二个操作数。
* 如果第二个操作数是对象，则只有第一个操作数求值为 true 才会返回该对象。
* 如果两个操作数是对象，则返回第二个操作数。
* 如果有一个操作数是 null，则返回 null。
* 如果有一个操作数是 NaN，则返回 NaN。
* 如果有一个操作数是 undefined，则返回 undefined。

逻辑与操作符是一种短路操作符，意思就是如果第一个操作数决定了结果，那么永远不会对第二个操作数求值。对逻辑与操作符来说，如果第一个操作数是 false，那么无论第二个操作数是什么值，结果也不可能等于 true。看下面的例子：

```javascript
let found = true;
let result = (found && someUndeclaredVariable); // 这里会出错
console.log(result); // 不会执行这一行
```

上面的代码之所以会出错，是因为 someUndeclaredVariable 没有事先声明，所以当逻辑与操作符对它求值时就会报错。变量 found 的值是 true，逻辑与操作符会继续求值变量 someUndeclaredVariable。但是由于 someUndeclaredVariable 没有定义，不能对它应用逻辑与操作符，因此就报错了。假如变量 found 的值是 false，那么就不会报错了：

```javascript
let found = false;
let result = (found && someUndeclaredVariable); // 不会出错
console.log(result); // 会执行
```

这里，console.log 会成功执行。即使变量 someUndeclaredVariable 没有定义，由于第一个操作数是 false，逻辑与操作符也不会对它求值，因为此时对 && 右边的操作数求值是没有意义的。在使用逻辑与操作数时，一定别忘了它的这个短路的特性。

<br>

### 3. 逻辑或

逻辑或操作符由两个管道符（||）表示，比如：

```javascript
let result = true || false;
```

逻辑或操作符遵循如下真值表：

| 第一个操作数 | 第二个操作数 | 结果  |
| ------------ | ------------ | ----- |
| true         | true         | true  |
| true         | false        | true  |
| false        | true         | true  |
| false        | false        | false |

与逻辑与类似，如果有一个操作数不是布尔值，那么逻辑或操作符也不一定返回布尔值。它遵循如下规则。

* 如果第一个操作数是对象，则返回第一个操作数。
* 如果第一个操作数求值为 false，则返回第二个操作数。
* 如果两个操作数都是对象，则返回第一个操作数。
* 如果两个操作数都是 null，则返回 null。
* 如果两个操作数是 NaN，则返回 NaN。
* 如果两个操作数都是 undefined，则返回 undefined。

同样与逻辑与类似，逻辑或操作数也具有短路的特性。只不过对逻辑或而言，第一个操作数求值为 true，第二个操作数就不会再被求值了。看下面的例子：

```javascript
let found = true;
let result = (found || someUndeclaredVariable); // 不会出错
console.log(result); // 会执行
```

跟前面的例子一样，变量 someUndeclared 也没有定义。但是，因为变量 found 的值为 true，所以逻辑或操作符不会对变量 someUndeclaredVaiable 求值，而直接返回 true。假如把 found 的值改为 false，那就会报错了：

```javascript
let found = false;
let result = (found || someUndeclaredVariable); // 这里会出错
console.log(result); // 不会执行这一行
```

利用这个行为，可以避免给变量赋值 null 或 undefined。比如：

```javascript
let myObject = preferredObject || backupObject;
```

在这个例子中，变量 myObject 会被赋予两个值中的一个，其中 preferredObject 变量包含首选的值，backupObject 变量包含备用的值。如果 preferredObject 不是 null，则它的值就会赋给 myObject。如果 preferredObject 是 null，则 backupObject 的值就会赋给 myObject。这种模式在 ECMAScript 代码中经常用于变量赋值，本书后面的代码示例中也会经常用到。

<br>

## 4. 乘性操作符

ECMAScript 定义了 3 个乘性操作符：乘法、除法和取模。这些操作符跟它们在 Java、C 语言及 Perl 中对应的操作符作用一样，但在处理非数值时，它们也会包含一些自动的类型转换。如果乘性操作符有不是数值的操作数，则该操作数会在后台被使用 Number() 转型函数转换为数值。这意味着空字符串会被当成 0，而布尔值 true 会被当成 1。

### 1. 乘法操作符

乘法操作符由一个星号（*）表示，可以用于计算两个数值的乘积。其语法类似于 C 语言，比如：

```javascript
let result = 34 * 56;
```

不过，乘法操作符在处理特殊值时也有一些特殊的行为。

* 如果操作数都是数值，则执行常规的乘法运算，即两个正值相乘是正值，两个负值相乘也是正值，正符符号不同的值相乘得到负值。如果 ECMAScript 不能表示乘积，则返回 Infinity 或 -Infinity。
* 如果有任一操作数是 NaN，则返回 NaN。
* 如果是 Infinity 乘以 0，则返回 NaN。
* 如果是 Infinity 乘以非 0 的有限数值，则根据第二个操作数的符号返回 Infinity 或 -Infinity。
* 如果是 Infinity 乘以 Infinity，则返回 Infinity。
* 如果有不是数值的操作数，则先在后台用 Number() 将其转换为数值，然后再应用上述规则。

<br>

### 2. 除法操作符

除法操作符由一个斜杠（/）表示，用于计算第一个操作数除以第二个操作数的商，比如：

```javascript
let result = 66 / 11;
```

跟乘法操作符一样，除法操作符针对特殊值也有一些特殊的行为。

* 如果操作数都是数值，则执行常规的除法运算，即两个正值相除是正值，两个负值相除也是正值，符号不同的值相除得到负值。如果 ECMAScript 不能表示商，则返回 Infinity 或 -Infinity。
* 如果有任一操作数是 NaN，则返回 NaN。
* 如果是 Infinity 除以 Infinity，则返回 NaN。
* 如果是 0 除以 0，则返回 NaN。
* 如果是非 0 的有限值除以 0，则根据第一个操作数的符号返回 Infinity 或 -Infinity。
* 如果是 Infinity 除以任何数值，则根据第二个操作数的符号返回 Infinity 或 -Infinity。
* 如果有不是数值的操作数，则先在后台用 Number() 函数将其转换为数值，然后再应用上述规则。

<br>

### 3. 取模操作符

取模（余数）操作符由一个百分比符号（%）表示，比如：

```javascript
let result = 26 % 5; // 等于 1
```

与其他乘性操作符一样，取模操作符对特殊值也有一些特殊的行为。

* 如果操作数是数值，则执行常规除法运算，返回余数。
* 如果被除数是无限值，除数是有限值，则返回 NaN。
* 如果被除数是有限值，除数是 0，则返回 NaN。
* 如果是 Infinity 除以 Infinity，则返回 NaN。
* 如果被除数是有限值，除数是无限值，则返回被除数。
* 如果被除数是 0，除数不是 0，则返回 0。
* 如果有不是数值的操作数，则先在后台用 Number() 函数将其转换为数值，然后再应用上述规则。

<br>

## 5. 乘方操作符

乘方操作符 ** 与 Math.pow() 是等价的：

```javascript
console.log(Math.pow(3, 2)); // 9
console.log(3 ** 2); // 9

console.log(Math.pow(16, 0.5)); // 4
console.log(16 ** 0.5); // 4
```

不仅如此，乘方操作符也有自己的乘方赋值操作符 **=，该操作符执行乘方运算和结果的赋值操作：

```javascript
let squared = 3;
squared **=2;
console.log(squared); // 9

let sqrt = 16;
sqrt **= 0.5;
console.log(sqrt); // 4
```

<br>

## 6. 加性操作符

加性操作符，即加法和减法操作符，一般都是编程语言中最简单的操作符。不过，在 ECMAScript 中，这两个操作符拥有一些特殊的行为。与乘性操作符类似，加性操作符在后台会发生不同数据类型的转换。只不过对这两个操作符来说，转换规则不是那么直观。

### 1. 加法操作符

加法操作符（+）用于求两个数的和，比如：

```javascript
let result = 1 + 2;
```

如果两个操作数都是数值，加法操作符执行加法运算并根据如下规则返回结果：

* 如果有任何操作数是 NaN，则返回 NaN。
* 如果是 Infinity 加 Infinity，则返回 Infinity。
* 如果是 -Infintiy 加 -Infinity，则返回 -Infinity。
* 如果是 Infinity 加 -Infinity，则返回 NaN。
* 如果是 +0 加 +0，则返回 +0。
* 如果是 -0 加 +0，则返回 +0。
* 如果是 -0 加 -0，则返回 -0。

不过，如果有一个操作数是字符串，则要应用如下规则：

* 如果两个操作数都是字符串，则将第二个字符串拼接到第一个字符串后面。
* 如果只有一个操作数是字符串，则将另一个操作数转换为字符串，再将两个字符串拼接在一起。

如果有任一操作数是对象、数值或布尔值，则调用它们的 toString() 方法以获取字符串，然后再应用前面的关于字符串规则。对于 undefined 和 null，则调用 String() 函数，分别获取 "undefined" 和 "null"。

看下面的例子：

```javascript
let result1 = 5 + 5; // 两个数值
console.log(result1); // 10
let result2 = 5 + "5"; // 一个数值和一个字符串
console.log(result2); // "55"
```

以上代码展示了加法操作符的两种运算模式。正常情况下，5 + 5 等于 10（数值），如前两行代码所示。但是，如果将一个操作数改为字符串，比如 "5"，则相加的结果就变成了 "55"（原始字符串值），因为第一个操作数也会被转换为字符串。

ECMAScript 中最常犯的一个错误，就是忽略加法操作中涉及的数据类型。比如下面这个例子：

```javascript
let num1 = 5;
let num2 = 10;
let message = "The sum of 5 and 10 is " + num1 + num2;
console.log(message); // "The sum of 5 and 10 is 510"
```

这里，变量 message 中保存的是一个字符串，是执行两次加法操作之后的结果。有人可能会认为最终得到的字符串是 "The sum of 5 and 10 is 15"。可是，实际上得到的是 "The sum of 5 and 10 is 510"。这是因为每次加法运算都是独立完成的。第一次加法的操作数是一个字符串和一个数值（5），结果还是一个字符串。第二次加法仍然是用一个字符串去加一个数值（10），同样也会得到一个字符串。如果想真正执行数学计算，然后把结果追加到字符串末尾，只要使用一对括号即可：

```javascript
let num1 = 5;
let num2 = 10;
let message = "The sum of 5 and 10 is " + (num1 + num2);
console.log(message); // "The sum of 5 and 10 is 15"
```

在此，我们用括号把两个数值变量括了起来，意思是让解释器先执行两个数值的加法，然后再把结果追加给字符串。因此，最终得到的字符串变成了 "The sum of 5 and 10 is 15"。

<br>

### 2. 减法操作符

减法操作符（-）也是使用很频繁的一种操作符，比如：

```javascript
let result = 2 - 1;
```

与加法操作符一样，减法操作符也有一组规则用于处理 ECMAScript 中不同类型之间的转换。

* 如果两个操作数都是数值，则执行数学减法运算并返回结果。
* 如果有任一操作数是 NaN，则返回 NaN。
* 如果是 Infinity 减 Infinity，则返回 NaN。
* 如果是 -Infinity 减 -Infinity，则返回 NaN。
* 如果是 Infinity 减 -Infinity，则返回 Infinity。
* 如果是 -Infinity 减 Infinity，则返回 -Infinity。
* 如果是 +0 减 +0，则返回 +0。
* 如果是 -0 减 +0，则返回 -0。
* 如果是 -0 减 -0，则返回 +0。
* 如果有任一操作数是字符串、布尔值、null 或 undefined，则先在后台使用 Number() 将其转换为数值，然后再根据前面的规则执行数学运算。如果转换结果是 NaN，则减法计算的结果是 NaN。
* 如果有任一操作数是对象，则调用其 valueOf() 方法取得表示它的数值。如果该值是 NaN，则减法计算的结果是 NaN。如果对象没有 valueOf() 方法，则调用其 toString() 方法，然后再将得到的字符串转换为数值。

以下示例演示了上面的规则：

```javascript
let result1 = 5 - true; // true 被转换为 1，所以结果是 4
let result2 = NaN - 1; // NaN
let result3 = 5 - 3; // 2
let result4 = 5 - ""; // ""被转换为 0，所以结果是 5
let result5 = 5 - "2"; // "2" 被转换为 2，所以结果是 3
let result6 = 5 - null; // null 被转换为 0，所以结果是 5
```

<br>

## 7. 关系操作符

关系操作符执行比较两个值的操作，包括小于（<）、大于（>）、小于等于（<=）和大于等于（>=），用法跟数学课上学的一样。这几个操作符都返回布尔值，如下所示：

```javascript
let result1 = 5 > 3; // true
let result2 = 5 < 3; // false
```

与 ECMAScript 中的其他操作符一样，在将它们应用到不同数据类型时也会发生类型转换和其他行为。

* 如果操作数都是数值，则执行数值比较。
* 如果操作数都是字符串，则逐个比较字符串中对应字符的编码。
* 如果有任一操作数是数值，则将另一个操作数转换为数值，执行数值比较。
* 如果有任一操作数是对象，则调用其 valueOf() 方法，取得结果后再根据前面的规则执行比较。如果没有 valueOf()，则调用 toString() 方法，取得结果后再根据前面的规则执行比较。
* 如果有任一操作数是布尔值，则将其转换为数值再执行比较。

在使用关系操作符比较两个字符串，会发生一个有趣的现象。很多人认为小于意味着字母顺序靠前，而大于意味着字母顺序靠后，实际上不是这么回事。对字符串而言，关系操作符会比较字符串中对应字符的编码，而这些编码是数值。比较完之后，会返回布尔值。问题的关键在于，大写字母的编码都小于小写字母的编码，因此以下这种情况就会发生：

```javascript
let result = "Brick" < "alphabet"; // true
```

在这里，字符串 "Brick" 被认为小于字符串 ”alphabet“，因为字母 B 的编码是 66，字母 a 的编码是 97。要得到确实按字母顺序比较的结果，就必须把两者都转换为相同的大小写形式（全大写或全小写），然后再比较：

```javascript
let result = "Brick".toLowerCase() < "alphabet".toLowerCase(); // false
```

将两个操作数都转换为小写，就能保证按照字母表顺序判定 "alphabet" 在 "Brick" 前头。

另一个奇怪的现象是在比较两个数值字符串的时候，比如下面这个例子：

```javascript
let result = "23" < 3; // false
```

因为这次会将字符串 "23" 转换为数值 23，然后再跟 3 比较，结果当然对了。只要是数值和字符串比较，字符串就会先被转换为数值，然后进行数值比较。对于数值字符串而言，这样能保证结果正确。但如果字符串不能转换成数值？比如下面这个例子：

```javascript
let result = "a" < 3; // 因为 "a" 会转换为 NaN，所以结果是 false
```

因为字符 "a" 不能转换成任何有意义的数值，所以只能转换为 NaN。这里有一个规则，即任何关系操作符在涉及比较 NaN 时都返回 false。这样一来，下面的例子有趣了：

```javascript
let result1 = NaN < 3; // false
let result2 = NaN >= 3; // false
```

在大多数比较的场景中，如果一个值不小于另一个值，那就一定大于或等于它。但在比较 NaN 时，无论小于还是大于等于，比较的结果都会返回 false。

<br>

## 8. 相等操作符

判断两个变量是否相等是编程中最重要的操作之一。在比较字符串、数值和布尔值是否相等时，过程都很直观。但是在比较两个对象是否相等时，情形就比较复杂了。ECMAScript 中的相等和不相等操作符，原本在比较之前会执行类型转换，但很快就有人质疑这种转换是否应该发生。最终，ECMAScript 提供共了两组操作符。第一组是等于和不等于，它们在比较之前执行转换。第二组是全等和不全等，它们在比较之前不执行转换。

### 1. 等于和不等于

ECMAScript 中的等于操作符用两个等于号（==）表示，如果操作数相等，则会返回 true。不等于操作符用叹号和等于号（!=）表示，如果两个操作数不相等，则会返回 true。这两个操作符都会先进行类型转换（通常称为强制类型转换）再确定操作数是否相等。

在转换操作数的类型时，相等和不相等操作符遵循如下规则。

* 如果任一操作数是布尔值，则将其转换为数值再比较是否相等。false 转换为 0，true 转换为 1。
* 如果一个操作数是字符串，另一个操作数是数值，则尝试将字符串转换为数值，再比较是否相等。
* 如果一个操作数是对象，另一个操作数不是，则调用对象的 valueOf() 方法取得其原始值，再根据前面的规则进行比较。

在进行比较时，这两个操作符会遵循如下规则。

* null 和 undefined 相等。
* null 和 undefined 不能转换为其他类型的值再进行比较。
* 如果有任一操作数是 NaN，则相等操作符返回 false，不相等操作符返回 true。记住：即使两个操作数都是 NaN，相等操作符也返回 false，因为按照规则，NaN 不等于 NaN。
* 如果两个操作数都是对象，则比较它们是不是同一个对象。如果两个操作数都指向同一个对象，则相等操作符返回 true。否则，两者不相等。

下表总结了一些特殊情况及比较的结果。

| 表达式            | 结果  |
| ----------------- | ----- |
| null == undefined | true  |
| "NaN" == NaN      | false |
| 5 == NaN          | false |
| NaN == NaN        | false |
| NaN != NaN        | true  |
| false == 0        | true  |
| true == 1         | true  |
| true == 2         | false |
| undefined == 0    | false |
| null == 0         | false |
| "5" == 5          | true  |

<br>

### 2. 全等和不全等

全等和不全等操作符与相等和不相等操作符类似，只不过它们在比较相等时不转换操作数。全等操作符由 3  个等于号（===）表示，只有两个操作数在不转换的前提下相等才返回 true，比如：

```javascript
let result1 = ("55" == 55); // true，转换后相等
let result2 = ("55" === 55); // false，不相等，因为数据类型不同
```

在这个例子中，第一个比较使用相等操作符，比较的是字符串 "55" 和数值 55。如前所述，因为字符串 "55" 会被转换为数值 55，然后再与数值 55 进行比较，所以返回 true。第二个比较使用全等操作符，因为没有转换，字符串和数值当然不能相等，所以返回 false。

不全等操作符用一个叹号和两个等于号（!==）表示，只有两个操作数在不转换的前提下不相等才返回 true。比如：

```javascript
let result1 = ("55" != 55); // false，转换后相等
let result2 = ("55" !== 55); // true，不相等，因为数据类型不同
```

这一次，第一个比较使用不相等操作符，它会把字符串 "55" 转换为数值 55，跟第二个操作数相等。既然转换后两个值相等，那就返回 false。第二个比较使用不全等操作符。这时候可以这么问：“字符串 55 和数值 55 有区别么？” 答案是有（true）。

另外，虽然 null == undefined 是 true（因为这两个值类似），但 null === undefined 是 false，因为它们不是相同的数据类型。

>注意
>
>由于相等和不相等操作符存在类型转换问题，因为推荐使用全等和不全等操作符。这样有助于在代码中保持数据类型的完整性。

<br>

## 9. 条件操作符

条件操作符是 ECMAScript 中用途最为广泛的操作符之一，语法跟 Java 中一样：

variable = boolean_expression ? true_value : false_value;

上面的代码执行了条件赋值操作，即根据条件表达式 boolean_expression 的值决定将哪个值赋给变量 variable。如果 boolean_expression 是 true，则赋值 true_value。如果 boolean_expression 是 false，则赋值 false_value。比如：

```javascript
let max = (num1 > num2) ? num1 : num2;
```

在这个例子中，max 将被赋予一个最大值。这个表达式的意思是，如果 num1 大于 num2（条件表达式为 true），则将 num1 赋给 max。否则，将 num2 赋给 max。

<br>

## 10. 空值合并操作符

空值合并操作符 ?? 为处理空值（null 或 undefined）提供一种简洁的方式。这是一个二元操作符，如果左边的操作数是 null 或 undefined，它就返回右边的操作数：

variable = expression ?? nullish_fallback_value;

如果不使用 ?? 操作符，上面的表达式就需要像下面这样借助条件操作符来实现：

```javascript
variable = expression !== null && expression !== undefined ? expression : nullish_fallback_value;
```

在为变量赋默认值而又需要提防假性值的时候，特别适合使用 ?? 操作符。在没有 ?? 之前，赋默认值通常使用 || 操作符，但 || 操作符在遇到假性值时容易出错。下面的例子对比了这两个操作符的行为：

```javascript
const values = [null, undefined, 0, ""];

console.log(values.map(x => x || "default"));
// ["default", "default", "defalut", "default"]

console.log(values.map(x => x ?? "default"));
// ["default", "default", 0, ""]
```

<br>

## 11. 赋值操作符

简单赋值用等于号（=）表示，将右手边的赋值给左手边的变量，如下所示：

```javascript
let num = 10;
```

复合赋值使用乘性、加性或位操作符后跟等于号（=）表示。这些赋值操作符是类似如下常见赋值操作的简写形式：

```javascript
let num = 10;
num = num + 10;
```

以上代码的第二行可以通过复合赋值来完成：

```javascript
let num = 10;
num += 10;
```

每个数学操作符以及其他一些操作符有对应的复合赋值操作符：

* 乘后赋值（*=）
* 乘方后赋值（**=）
* 除后赋值（/=）
* 取模后赋值（%=）
* 加后赋值（+=）
* 减后赋值（-=）
* 左移后赋值（<<=）
* 右移后赋值（>>=）
* 无符号右移后赋值（>>>=）
* 按位或后赋值（|=）
* 按位与后赋值（&=）
* 按位异或后赋值（^=）
* 逻辑或后赋值（||=）
* 逻辑与后赋值（&&=）
* 空值合并后赋值（??=）

这些操作符仅仅是简写语法，使用它们不会提升性能。

<br>

## 12. 逗号操作符

逗号操作符可以用来在一条语句中执行多个操作，如下所示：

```javascript
let num1 = 1, num2 = 2,num3 = 3;
```

在一条语句中同时声明多个变量是逗号操作符最常用的场景。不过，也可以使用逗号操作符来辅助赋值。在赋值时使用逗号操作符分隔值，最终会返回表达式最后一个值：

```javascript
let num = (5, 1, 4, 8, 0); // num 的值为 0
```

在这个例子中，num 将被赋值为 0，因为 0 是表达式中最后一项。逗号操作符的这种使用场景并不多见，但这种行为的确存在。

<br>

# 6. 语句

ECMA-262 描述了一些语句（也称为流控制语句），而 ECMAScript 中的大部分语法体现在语句中。语句通常使用一或多个关键字完成既定的任务。语句可以简单，也可以复杂。简单的如告诉函数退出，复杂的如列出一堆要重复执行的指令。

## 1. if 语句

if 语句是使用最频繁的语句之一，语法如下：

```javascript
if (condition) statement1 else statement2
```

这里的条件（condition）可以是任何表达式，并且求值结果不一定是布尔值。ECMAScript 会自动调用 Boolean() 函数将这个表达式的值转换为布尔值。如果条件求值为 true，则执行语句 statement1。如果条件求值为 false，则执行语句 statement2。这里的语句可能是一行代码，也可能是一个代码块（即包含咋一对花括号的多行代码）。来看下面的例子：

```javascript
if (i > 25) {
    console.log("Greater than 25."); // 只有一行代码的语句
else {
    console.log("Less than or equal to 25."); // 一个语句块
}
```

这里的最佳实践是使用语句块，即使只有一行代码要执行也是如此。这是因为语句块可以避免对什么条件下执行什么产生困惑。

可以像这样连续使用多个 if 语句：

```javascript
if (condition1) statement1 else if (condition2) statement2 else statement3
```

下面是一个例子：

```javascript
if (i > 25) {
    console.log("Greeter than 25.");
} else if (i < 0) {
    console.log("Less than 0.");
} else {
    console.log("Between 0 and 25, inclusive.");
}
```

<br>

## 2. do-while 语句

do-while 语句是一种后测试循环语句，即循环体中的代码执行后才会对退出条件进行求值。换句话说，循环体内的代码至少执行一次。do-while 的语法如下：

```javascript
do {
    statement
} while (expression);
```

下面是一个例子：

```javascript
let i = 0;
do {
    i += 2;
} while(i < 10);
```

在这个例子中，只要 i 小于 10，循环就会重复执行。i 从 0 开始，每次循环递增 2。

>注意
>
>后测试循环经常用于这种情形：循环体内代码在退出前至少要执行一次。

<br>

## 3. while 语句

while 语句是一种先测试循环语句，即先检测退出条件，再执行循环体内的代码。因此，while 循环体内的代码有可能不会执行。下面是 while 循环的语法：

```javascript
while(expression) statement;
```

这是一个例子：

```javascript
let i = 0;
while (i < 10) {
    i += 2;
}
```

在这个例子中，变量 i 从 0 开始，每次循环递增 2。只要 i 小于 10，循环就会继续。

<br>

## 4. for 语句

for 语句也是先测试语句，只不过增加了进入循环之前的初始化代码，以及循环执行后要执行的表达式，语法如下：

for (initialization; expression; post-loop-expression) statement

下面是一个用例：

```javascript
let count = 10;
for (let i = 0; i < count; i++) {
    console.log(i);
}
```

以上代码在循环开始前定义了变量 i 的初始值为 0。然后求值条件表达式，如果求值结果为 true（i < count），则执行循环体。因此循环体也可能不会被执行。如果循环体被执行了，则循环后表达式也会执行，以便递增变量 i。for 循环跟下面的 while 循环是一样的：

```javascript
let count = 10;
let i = 0;
while (i < count) {
    console.log(i);
    i++;
}
```

无法通过 while 循环实现的逻辑，同样也无法使用 for 循环实现。因此 for 循环只是将循环相关的代码封装在了一起而已。

在 for 循环的初始化代码中，其实是可以不使用变量声明关键字的。不过，初始化定义的迭代器变量在循环执行完成后几乎不可能再用到了。因此，最清晰的写法是使用 let 声明迭代器变量，这样就可以将这个变量的作用域限定在循环中。

初始化、条件表达式和循环后表达式都不是必需的。因此，下面这种写法可以创建一个无穷循环：

```javascript
for (;;) { // 无穷循环
    doSomething();
}
```

如果只包含条件表达式，那么 for 循环实际上就变成了 while 循环：

```javascript
let count = 10;
let i = 0;
for (; i < count; ) {
    console.log(i);
    i++;
}
```

这种多功能性使得 for 语句在这门语言中使用非常广泛。

<br>

## 5. for-in 语句

for-in 语句是一种严格的迭代语句，用于枚举对象中的非符号键属性，语法如下：

for (property in expression) statement

下面是一个例子：

```javascript
for (const propName in window) {
    document.write(propName);
}
```

这个例子使用 for-in 循环显示了 BOM 对象 window 的所有属性。每次执行循环，都会给变量 propName 赋予一个 window 对象的属性作为值，直到 window 的所有属性都被枚举一遍。与 for 循环一样，这里控制语句中的 const 也不是必需的。但为了确保这个局部变量不被修改，推荐使用 const。

ECMAScript 中对象的属性是无序的，因此 for-in 语句不能保证返回对象属性的顺序。换句话说，所有可枚举的属性都会返回一次，但返回的顺序可能会因浏览器而异。

如果 for-in 循环要迭代的变量是 null 或 undefined，则不执行循环体。

<br>

## 6. for-of 语句

for-of 语句是一种严格的迭代语句，用于遍历可迭代对象的元素，语法如下：

for (property of expression) statement

下面是示例：

```javascript
for (const el of [2, 4, 6, 8]) {
    document.write(el);
}
```

在这个例子中，我们使用 for-of 语句显示了一个包含 4 个元素的数组中的所有元素。循环会一直持续到将所有元素都迭代完。与 for 循环一样，这里控制语句中的 const 也不是必需的。但为了确保这个局部变量不被修改，推荐使用 const。

for-of 循环会按照可迭代对象的 next() 方法产生值的顺序迭代元素。关于可迭代对象，本书将在第 7 章详细介绍。

如果尝试迭代的变量不支持迭代，则 for-of 语句会抛出错误。

>注意
>
>for-of 语句的扩展版 for-await-of 循环支持生成契约（promise）的异步可迭代对象，相关内容将在第 7 章介绍。

<br>

## 7. 标签语句

标签语句用于给语句加标签，语法如下：

label: statement

下面是一个简单的例子：

```javascript
start: for (let i = 0;i < count; i++) {
    console.log(i);
}
```

在这个例子中，start 是一个标签，可以在后面通过 break 或 continue 语句引用。标签语句的典型应用场景是嵌套循环。

<br>

## 8. break 和 continue 语句

break 和 continue 语句为执行循环代码提供了更严格的控制手段。break 语句用于立即退出循环，强制执行循环后的下一条语句。而 continue 语句也用于立即退出循环，但会再次从循环顶部开始执行。下面看一个例子：

```javascript
let num = 0;

for (let i = 1; i < 10; i++) {
    if (i % 5 == 0) {
        break;
    }
    num++;
}

console.log(num); // 4
```

在上面的代码中，for 循环会将变量 i 由 1 递增到 10。而在循环体内，有一个 if 语句用于检查 i 能否被 5 整除（使用取模操作符）。如果是，则执行 break 语句，退出循环。变量 num 的初始值为 0，表示循环在退出前执行了多少次。当 break 语句执行后，下一行执行的代码是 console.log(num)，显示 4。之所以循环执行了 4 次，是因为当 i 等于 5 时，break 语句会导致循环退出，该次循环不会执行递增 num 的代码。如果是将 break 换成 continue，则会出现不同的效果：

```javascript
let num = 0;

for (let i = 1; i < 10; i++) {
    if (i % 5 == 0) {
        continue;
    }
    num++;
}

console.log(num); // 8
```

这一次，console.log 显示 8，即循环被完整执行了 8 次。当 i 等于 5 时，循环会在递增 num 之前退出，但会执行下一次迭代，此时 i 是 6。然后，循环会一直执行到自然结束，即 i 等于 10。最终 num 的值是 8 而不是 9，是因为 continue 语句导致它少递增了一次。

break 和 continue 都可以与标签语句一起使用，返回代码中特定的位置。这通常是在嵌套循环中，如下面的例子所示：

```javascript
let num = 0;

outermost:
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        if (i == 5 && j == 5) {
            break outermost;
        }
        num++;
    }
}

console.log(num); // 55
```

在这个例子中，outermost 标签标识的是第一个 for 语句。正常情况下，每个循环执行 10 次，意味着 num++ 语句会执行 100 次，而循环结束时 console.log 的结果应该是 100。但是，break 语句带来了一个变数，既要退出到的标签。添加标签不仅让 break 退出（使用变量 j 的）内部循环，也会退出（使用变量 i 的）外部循环。当执行到 i 和 j 都等于 5 时，循环停止执行，此时 num 的值是 55。continue 语句也可以使用标签，如下面的例子所示：

```javascript
let num = 0;

outermost:
for (let i = 0; i < 10; i++) {
    for (let j = 0;j < 10; j++) {
        if (i == 5 && j == 5) {
            continue outermost;
        }
        num++;
    }
}

console.log(num); // 95
```

这一次，continue 语句会强制循环继续执行，但不是继续执行内部循环，而是继续执行外部循环。当 i 和 j 都等于 5 时，会执行 continue，跳到外部循环继续执行，从而导致内部循环少执行 5 次，结果 num 等于 95。

组合使用标签语句和 break、continue 能实现复杂的逻辑，但也容易出错。注意标签要使用描述性强的文本，而嵌套也不要太深。

<br>

## 9. with 语句

with 语句的用途是将代码作用域设置为特定的对象，其语法是：

with (expression) statement;

使用 with 语句的主要场景是针对一个对象反复操作，这时候将代码作用域设置为该对象能提供便利，如下面的例子所示：

```javascript
let qs = location.search.substring(1);
let hostName = location.hostname;
let url = location.href;
```

上面代码中的每一行都用到了 location 对象。如果使用 with 语句，就可以少写一些代码：

```javascript
with(location) {
    let qs = search.substring(1);
    let hostName = hostname;
    let url = href;
}
```

这里，with 语句用于连接 location 对象。这意味着在这个语句内部，每个变量首先会被认为是一个局部变量。如果没有找到该局部变量，则会搜索 lcoation 对象，看它是否有有一个同名的属性。如果有，则该变量会被求值为 location 对象的属性。

严格模式不允许使用 with 语句，否则会抛出错误。

>警告
>
>由于 with 语句影响性能且难于调试其中的代码，通常不推荐在产品代码中使用 with 语句。

<br>

## 10. switch 语句

switch 语句是与 if 语句紧密相关的一种流控制语句，从其他语句借鉴而来。ECMAScript 中 switch 语句跟 C 语言中 switch 语句的语法非常相似，如下所示：

```javascript
switch (expression) {
    case value1:
        statement
        break;
    case value2:
        statement
        break;
    case value3:
        statement
        break;
    case value4:
		statement
        break;
    default:
        statement
}
```

这里的每个 case（条件/分支）相当于：如果表达式等于后面的值，则执行下面的语句。break 关键字会导致代码执行跳出 switch 语句。如果没有 break，则代码会继续匹配下一个条件。default 关键字用于在任何条件都没有满足时指定默认执行的语句（相当于 else 语句）。

有了 switch 语句，开发者就用不着写类似这样的代码了：

```javascript
if (i == 25) {
    console.log("25");
} else if (i == 35) {
    console.log("35");
} else if (i == 45) {
    console.log("45");
} else {
    console.log("Other");
}
```

而是可以这样写：

```javascript
switch (i) {
    case 25:
		console.log("25");
        break;
    case 35:
        console.log("35");
        break;
    case 45:
        console.log("45");
        break;
    default:
        console.log("Other");
}
```

为避免不必要的条件判断，最好给每个条件后面都加上 break 语句。

虽然 switch 语句是从其他语言借鉴过来的，但 ECMAScript 为它赋予了一些独有的特性。首先，switch 语句可以用于所有数据类型（在很多语言中，它只能用于数值），因此可以使用字符串甚至对象。其次，条件的值不需要是常量，也可以是变量或表达式。

>注意
>
>switch 语句在比较每个条件的值时会使用全等操作符，因此不会强制转换数据类型（比如，字符串 "10" 不等于数值 10）。

<br>

# 7. 函数

函数对任何语言来说都是核心组件，因为它们可以封装语句，然后在任何地方、任何时间执行。ECMAScript 中的函数使用 function 关键字或箭头语法声明，后跟一组参数，然后是函数体。

>注意
>
>第 10 章会更详细地介绍函数。

以下是函数的基本语法：

```javascript
function functionName(arg0, arg1, ..., argN) {
    statements
}
```

下面是一个例子：

```javascript
function sayHi(name, message) {
    console.log("Hello " + name + ", " + message);
}
```

可以通过函数名来调用函数，要传给函数的参数放在括号里（如果有多个参数，则用逗号隔开）。下面是调用函数 sayHi() 的示例：

```javascript
sayHi("Alice", "how are you today?");
```

调用这个函数的输出结果是 "Hello Alice, how are you today?"。参数 name 和 message 在函数内部作为字符串被拼接在了一起，最终通过 console.log 输出到控制台。

ECMAScript 中的函数不需要指定是否返回值。任何函数在任何时间都可以使用 return 语句来返回函数的值，用法是后跟要返回的值。比如：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}
```

函数 sum() 会将两个值相加并返回结果。注意，除了 return 语句之外没有任何特殊声明该函数有返回值。然后就可以这样调用它：

```javascript
const result = sum(5, 10);
```

要注意的是，只要碰到 return 语句，函数就会立即停止执行并退出。因此，return 语句后面的代码不会执行。比如：

```javascript
function sum(num1, num2) {
    return num1 + num2;
    console.log("Hello world"); // 不会执行
}
```

在这个例子中，console.log 不会执行，因为它在 return 语句后面。

一个函数里也可以有多个 return 语句，像这样：

```javascript
function diff(num1, num2) {
    if (num1 < num2) {
        return num2 - num1;
    } else {
        return num1 - num2;
    }
}
```

这个 diff() 函数用于计算两个数值的差。如果第一个数值小于第二个，则用第二个减第一个。否则，就用第一个减第二个。代码中每个分支都有自己的 return 语句，返回正确的差值。

return 语句也可以不带返回值。这时候，函数会立即停止执行并返回 undefined。这种用法最常用于提前终止函数执行，并不是为了返回值。比如在下面的例子中，console.log 不会执行：

```javascript
function sayHi(name, message) {
    return;
    console.log("Hello " + name + ", " + message); // 不会执行
}
```

>注意
>
>最佳实践是函数要么返回值，要么不返回值。只在某个条件下返回值得函数会带来麻烦，尤其是调试时。

严格模式对函数也有一些限制：

* 函数不能以 eval 或 arguments 作为名称
* 函数的参数不能叫 eval 或 arguments
* 两个命名参数不能拥有同一个名称

如果违反上述规则，则会导致语法错误，代码也不会执行。

















































