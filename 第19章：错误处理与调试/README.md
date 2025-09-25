JavaScript 一直以来被认为是最难调试的编程语言之一，因为它是动态的，且多年来没有适当的开发工具。错误经常会以令人迷惑的浏览器消息形式出现，比如 "object expected"。这样的消息没有上下文，因此很难理解。ECMAScript 第 3 版致力于改进这个方面，引入了 try/catch 和 throw 语句，以及一些错误类型，以帮助开发者在程序出错时正确地处理它们。几年后，JavaScript 调试器和排错工具开始在浏览器中出现。现代浏览器具有强大的 JavaScript 调试能力。

有了适当的语言和开发工具，Web 开发者如今已可以实现适当的错误处理并找到问题的原因。

# 1. 浏览器错误报告

所有现代浏览器都提供了向用户报告错误的机制。默认情况下，所有浏览器都会隐藏错误信息。一个原因是除了开发者之外这些信息对别人没什么用，另一个原因是网页在正常操作中报错的固有特性。

## 1. 桌面控制台

所有现代桌面浏览器都会通过控制台暴露错误。这些错误可以显示在开发者工具内嵌的控制台中。在前面提到的所有浏览器中，访问开发者工具的路径是相似的。可能最简单的查看错误的方式就是在页面上单击鼠标右键，然后在上下文菜单中选择 Inspect（检查）或 Inspect Element（检查元素），然后再点击 Console（控制台）选项卡。

要直接进入控制台，不同操作系统和浏览器支持不同的快捷键，如下表所示。

| 浏览器  | Windows/Linux    | macOS     |
| ------- | ---------------- | --------- |
| Chrome  | Ctrl+Shift+J     | Cmd+Opt+J |
| Firefox | Ctrl+Shift+K     | Cmd+Opt+K |
| Edge    | F12，然后 Ctrl+2 | 不适用    |
| Opera   | Ctrl+Shift+I     | Cmd+Opt+I |
| Safari  | 不适用           | Cmd+Opt+C |

## 2. 移动控制台

移动浏览器不会直接在设备上提供控制台界面。不过，还是有一些途径可以在移动设备中检查错误。

Chrome 移动版和 Safari 的 iOS 版内置了实用工具，支持将设备连接到宿主操作系统中相同的浏览器。然后，就可以在对应的桌面浏览器中查看错误。这涉及设备之间的硬件连接，以及连接到宿主系统的浏览器。

# 2. 错误处理

所有重要的 Web 应用都需要定义完善的错误处理协议，大多数优秀的应用有自己的错误处理策略，尽管只要逻辑是放在服务器端的。事实上，服务器端团队通常会花很多精力根据错误类型、频率和其他重要指标来定义规范的错误日志机制。最终实现通过简单的数据库查询或报告生成脚本就可以了解应用程序的运行状态。

错误处理在应用程序的浏览器端进展缓慢，尽管其重要性一点也不低。这里有一个重要的事实：大多数上网的人没有技术背景，甚至连什么是浏览器都不十分清楚，而且有的人不知道自己使用的是什么浏览器。浏览器处理 JavaScript 报告错误的默认方式对用户并不友好。最好的情况是用户自己不知道发生了什么，然后再重试。最坏的情况是用户感觉特别厌烦，于是永远不回来了。有一个完善的错误处理策略可以让用户知道到底发生了什么。为此，必须理解各种捕获和处理 JavaScript 错误的方式。

## 1. try/catch 语句

try/catch 语句是在 JavaScript 中处理异常的一种方式。基本的语法如下所示，跟 Java 中的 try/catch 语句一样：

```javascript
try {
    // 可能出错的代码
} catch (error) {
    // 出错时要做什么
}
```

任何可能出错的代码都应该放到 try 块中，而处理错误的代码放在 catch 块中，如下所示：

```javascript
try {
    window.someNonexistentFunction();
} catch (error) {
    console.log("An error happened!");
}
```

如果 try 块中发生错误，代码执行会立即跳到 catch  块中，catch 块此时接收到一个错误对象，该对象包含错误的相关信息。

多数时候 catch 要处理错误对象。这个对象上具体包含的信息因浏览器而异，但至少有如下几个共同的属性。

* message：字符串，包含与错误对象相关的错误消息，简洁地描述到底发生了什么错误
* name：字符串，包含错误的名称。这个属性的默认值是 "Error"，但可以覆盖以提供更多信息
* cause：导致错误的具体原因。用于捕获并重新抛出错误

可以像下面的代码这样显示这些信息：

```javascript
try {
    window.someNoneexistentFunction();
} catch (error) {
    console.log(error.message);
}
```

有时候我们并不关心发生了什么错误，而只想把错误摆平：

```javascript
try {
    throw "foo";
} catch (e) {
    // 发生了错误，但我们不在乎错误对象
}
```

ECMAScript 允许忽略错误对象的赋值，即简单地忽略错误：

```javascript
try {
    throw "foo";
} catch {
    // 发生了错误，但我们不在乎错误对象
}
```

### 1. finally 子句

try/catch 语句中可选地 finally 子句始终运行。如果 try 块中的代码运行完，则接着执行 finally 块中的代码。如果出错并执行 catch 块中的代码，则 finally 块中的代码仍执行。如果写出 finally 子句，catch 块就成了可选的（它们两者中只有一个是必需的）。

try 或 catch 块无法阻止 finally 块执行，包括 return 语句。比如：

```javascript
function testFinally() {
    try {
        return 2;
    } catch (error) {
        return 1;
    } finally {
        return 0;
    }
}
```

这个函数在 try/catch 语句的各个部分都只放了一个 return 语句。看起来该函数应该返回 2，因为它是 try 块中，不会导致错误。但是，finally 块的存在导致 try 块中的 return 语句被忽略。因此，无论什么情况下调用该函数都会返回 0。如果去掉 finally 子句，该函数会返回 2。

>注意
>
>只要代码中包含了 finally 子句，try 块或 catch 块中的 return 语句就会被忽略，理解这一点很重要。在使用 finally 时一定要仔细确认代码的行为。

### 2. 抛出值与错误对象

可以在 throw 操作符后面使用任何值，但我们推荐创建并抛出 Error 对象而不是简单地抛出某个值。这样一来就可以记录到栈跟踪，为调试提供更多有价值地信息。以下代码演示了上述区别：

```javascript
function fooError() {
    try {
        throw "foo";
    } catch (e) {
        console.log(e);
    }
}

function barError() {
    try {
        throw new Error("bar");
    } catch (e) {
        console.log(e);
    }
}

fooError();
// foo

barError();
// Error: bar
// 		at barError（?editor_console=true:126:11）
// 		at ?editor_console=true:133:1
```

### 3. 捕获和重新抛出 error.cause

有时候，我们可能希望捕获错误，以某种方式处理错误，然后再重新抛出那个错误，以便错误可以被其他代码处理。在使用 catch 块捕获错误时，可以创建一个新的错误对象并将错误的原因传入 Error 构造函数。这样就可以保留原始的错误对象及栈跟踪信息，同时又能提供与该错误相关的额外上下文和信息。

```javascript
function rethrow() {
    try {
        throw new Error("foo");
    } catch (e) {
        throw new Error("bar", { cause: e });
    }
}

try {
    rethrow();
} catch (e) {
    console.log(e);
    // Error: bar
    // 		at rethrow（?editor_console=true:120:11）
    // 		at ?editor_console=true:125:3
    console.log(e.cause);
    // Error: foo
    // 		at rethrow（?editor_console=true:118:11）
    // 		at ?editor_console=true:125:3
}
```

### 4. 错误类型

代码执行过程中会发生各种类型的错误。每种类型都会对应一个错误发生时抛出的错误对象。ECMA-262 定义了以下错误类型：

* Error
* InternalError
* EvalError
* RangeError
* ReferenceError
* SyntaxError
* TypeError
* URIError
* AggregateError

Error 是基类型，其他错误类型继承该类型。因此，所有错误类型都共享相同的属性（所有错误对象上的方法都是这个默认类型定义的方法）。浏览器很少会抛出 Error 类型的错误，该类型只要用于开发者抛出自定义错误。

InternalError 类型的错误会在底层 JavaScript 引擎抛出异常时由浏览器抛出。例如，递归过多导致了栈溢出。这个类型并不是代码中通常要处理的错误，如果真发生了这种错误，很可能代码哪里弄错了或者有危险了。

EvalError 类型的错误会在使用 eval() 函数发生异常时抛出。ECMA-262 规定：

如果 eval 属性没有被直接调用（即没有将其名称作为一个 Identifier，也就是 CallExpression 中的 MemberExpression），或者如果 eval 属性被赋值，就会抛出错误。

基本上，只要不把 eval() 当成函数调用就会报告该错误：

```javascript
new eval(); // 抛出 EvalError
eval = foo; // 抛出 EvalError
```

实践中，浏览器不会总抛出 EvalError，再加上代码不大可能这样使用 eval()，因此几乎遇不到这种错误。

RangeError 错误会在数值越界时抛出。例如，定义数组时如果设置了并不支持的长度。如 -20 或 Number.MAX_VALUE，就会报告该错误：

```javascript
let items1 = new Array(-20); // 抛出 RangeError
let items2 = new Array(Number.MAX_VALUE); // 抛出 RangeError
```

RangeError 在 JavaScript 中发生得不多。

ReferenceError 会在找不到对象时发生。（这就是著名的 "object expected" 浏览器错误的原因。）这种错误经常是由访问不存在的变量而导致的，比如：

```javascript
let obj = x; // 在 x 没有声明声明时会抛出 ReferenceError
```

SyntaxError 经常在给 eval() 传入的字符串包含 JavaScript 语法错误时发生，比如：

```javascript
eval("a ++ b"); // 抛出 SyntaxError
```

在 eval() 外部，很少会用到 SyntaxError。这是因为 JavaScript 代码中的语法错误会导致代码无法执行。

TypeError 在 JavaScript 中很常见，主要发生在变量不是预期类型，或者访问不存在的方法时。很多原因可能导致这种错误，尤其是在使用类型特定的操作而变量类型不对时。下面是几个例子：

```javascript
let o = new 10; // 抛出 TypeError
console.log("name" in true); // 抛出 TypeError
Function.prototype.toString.call("name"); // 抛出 TypeError
```

在给函数传参数之前没有验证其类型的情况下，类型错误频繁发生。

URIError 只会在使用 encodeURI() 或 decodeURI() 但传入了格式错误的 URI 时间发生。这个错误恐怕是 JavaScript 中难得一见的错误了，因为上面这两个函数非常稳健。

不同的错误类型可用于为异常提供更多信息，以便实现适当的错误处理逻辑。在 try/catch 语句的 catch 块中，可以使用 instanceof 操作符确定错误的类型，比如：

```javascript
try {
    someFunction();
} catch (error) {
    if (error instanceof TypeError) {
        // 处理类型错误
    } else if (error instanceof ReferenceError) {
        // 处理引用错误
    } else {
        // 处理所有其他类型的错误
    }
}
```







































