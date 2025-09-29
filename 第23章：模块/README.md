现代 JavaScript 开发母庸置疑会遇到代码量打和广泛使用第三方库的问题。解决这个问题的方案通常需要把代码拆分成很多部分，然后再通过某种方式将它们连接起来。

在 ECMAScript 6 模块规范出现之前，虽然浏览器原生不支持模块的行为，但迫切需要这样的能力。ECMAScript 同样不支持模块，因此希望使用模块模式的库或代码库必须基于 JavaScript 的语法和词法特性伪造出类似模块的行为。

因为 JavaScript 是异步加载的解释性语言，所以得到广泛应用的各种模块实现也表现出不同的形态。这些不同的形态决定了不同的结果，但最终它们都实现了经典的模块模式。

# 1. 理解模块模式

将代码拆分成独立的块，然后再把这些块连接起来可以通过模块模式实现。这种模式背后的思想很简单：把逻辑分块，各自封装，相互独立，每个块自行决定对外暴露什么，同时自行决定引入执行哪些外部代码。不同的实现和特性让这些基本的概念变得有点复杂，但这个基本思想是所有 JavaScript 模块系统的基础。

## 1. 模块标识符

模块标识符是所有模块系统通用的概念。模块系统本质上是键/值实体，其中每个模块都有可用于引用它的标识符。这个标识符在模拟模块的系统中可能是字符串，在原生实现的模块系统中可能是模块文件的实际路径。

有的模块系统支持明确声明模块的标识，还有的模块系统会隐式地使用文件名作为模块标识符。不管怎样，完善的模块系统一定不会存在模块标识冲突的问题，且系统中的任何模块都应该能够无歧义地引用其他模块。

将模块标识符解析为实际模块的过程取决于模块系统对标识符的实现。原生浏览器模块标识符必须提供实际 JavaScript 文件的路径。除了文件路径，Node.js 还会搜索 node_modules 目录，用标识符去匹配包含 index.js 的目录。

## 2. 模块依赖

模块系统的核心是管理依赖。指定依赖的模块与周围的环境会达成一种契约。本地模块向模块系统声明一组外部模块（依赖），这些外部模块对于当前模块正常运行是必需的。模块系统检视这些依赖，进而保证这些外部模块能够被加载并在本地模块运行时初始化所有依赖。

每个模块都会与某个唯一的标识符关联，该标识符可用于检索模块。这个标识符通常是 JavaScript 文件的路径，但在某些模块系统中，这个标识符也可以是在模块本身内部声明的命名空间路径字符串。

## 3. 模块加载

加载模块的概念派生自依赖契约。当一个外部模块被指定为依赖时，本地模块期望在执行它时，依赖已准备好并已初始化。

在浏览器中，加载模块涉及几个步骤。加载模块涉及执行其中的代码，但必须是在所有依赖都加载并执行之后。如果浏览器没有收到依赖模块的代码，则必须发送请求并等待网络返回。收到模块代码之后，浏览器必须确定刚收到的模块是否也有依赖。然后递归得评估并加载所有依赖，直到所有依赖模块都加载完成。只有整个依赖图都加载完成，才可以执行入口模块。

## 4. 入口

相互依赖的模块必须指定一个模块作为入口（entry point），这也是代码执行的起点。这是理所当然的，因为 JavaScript 是顺序执行的，并且是单线程的，所以代码必须有执行的起点。入口模块也可能依赖其他模块，其他模块同样可能有自己的依赖。于是模块化 JavaScript 应用程序的所有模块会形成始于一个入口模块的依赖图。

可以通过有向图来表示应用程序中各模块的依赖关系。下图展示了一个想象中应用程序的模块依赖关系图。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC23%E7%AB%A0%EF%BC%9A%E6%A8%A1%E5%9D%97/%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB%E5%9B%BE%E7%A4%BA%E4%BE%8B.png)

图中的箭头表示依赖方向：模块 A 依赖模块 B 和模块 C，模块 B 依赖模块 D 和模块 E，模块 C 依赖模块 E。因为模块必须在依赖加载完成后才能被加载，所以这个应用程序的入口模块 A 必须在应用程序的其他部分加载后才能执行。

在 JavaScript 中，模块加载的概念可以有多种实现方式。因为模块是作为包含将立即执行的 JavaScript 代码的文件实现的，所以一种可能是按照依赖图的要求一次请求各个脚本。对于前面的应用程序来说，下面的脚本请求顺序能够满足依赖图的要求：

```html
<script src="moduleE.js"></script>
<script src="moduleD.js"></script>
<script src="moduleC.js"></script>
<script src="moduleB.js"></script>
<script src="moduleA.js"></script>
```

模块加载是阻塞的，这意味着前置操作必须完成才能执行后续操作。每个模块在自己的代码到达浏览器之后完成加载，此时其依赖已经加载并初始化。不过，这个策略存在一些性能和复杂性问题。为一个应用程序而按顺序加载五个 JavaScript 文件并不理想，并且手动管理正确的加载顺序也颇为棘手。

## 5. 异步依赖

因为 JavaScript 可以异步执行，所以如果能按需加载就好了。换句话说，可以让 JavaScript 通知模块系统在必要时加载新模块，并在模块加载完成后提供回调。在代码层面，可以通过下面的伪代码来实现：

```javascript
// 在模块 A 里面
load('moduleB').then(function(moduleB) {
    moduleB.doStuff();
});
```

模块 A 的代码使用了 moduleB 标识符向模块系统请求加载模块 B，并以模块 B 作为参数调用回调。模块 B 可能已加载完成，也可能必须重新请求和初始化，但这里的代码并不关心。这些事情都交给了模块加载器去负责。

如果重写前面的应用程序，只使用动态模块加载，那么使用一个 `<script>` 标签即可完成模块 A 的加载。模块 A 会按需请求模块文件，而不会生成必需的依赖列表。这样有几个好处，其中之一就是性能，因为在页面加载时只需同步加载一个文件。

这些脚本也可以分离出来，比如给 `<script>` 标签应用 defer 或 async 属性，再加上能够识别异步脚本何时加载和初始化的逻辑。此行为将模拟在 ECMAScript 模块规范中实现的行为，本章稍后会对此进行讨论。

## 6. 动态依赖

有些模块系统要求开发者在模块开始列出所有依赖，而有些模块系统允许开发者在程序结构中动态添加依赖。动态添加的依赖有别于模块开头列出的常规依赖，这些依赖必须在模块执行前加载完毕。

下面是动态依赖加载的例子：

```javascript
if (loadCondition) {
    require('./moduleA');
}
```

## 7. 静态分析

模块中包含的发送到浏览器的 JavaScript 代码经常会被静态分析，分析工具会检查代码结构并在不实际执行代码的情况下推断其行为。对静态分析友好的模块系统可以让模块打包系统更容易将代码处理为较少的文件。它还将支持在智能编辑器里智能自动完成。

更复杂的模块行为，例如动态依赖，会导致静态分析更困难。不同的模块系统和模块加载器具有不同层次的复杂度。至于模块的依赖，额外的复杂度会导致相关工具更难预测模块在执行时到底需要哪些依赖。

## 8. 循环依赖

要构建一个没有循环依赖的 JavaScript 应用程序几乎是不可能的，因此包括 CommonJS、AMD 和 ECMAScript 在内的所有模块系统都支持循环依赖。在包含循环依赖的应用程序中，模块加载顺序可能会出人意料。不过，只要恰当地封装模块，使它们没有副作用，加载顺序就应该不会影响应用程序的运行。

在下面的模块代码中（其中使用了模块中立的伪代码），任何模块都可以作为入口模块，即使依赖图中存在循环依赖：

```javascript
require('./moduleD');
require('./moduleB');

console.log('moduleA');
require('./moduleA');
require('./moduleC');

console.log('moduleB');
require('./moduleB');
require('./moduleD');

console.log('moduleC');
require('./moduleA');
require('./moduleC');

console.log('moduleD');
```

修改主模块中用到的模块会改变依赖加载顺序。如果 moduleA 最先加载，则会打印如下输出，这表示模块加载完成时的绝对顺序：

moduleB

moduleC

moduleD

moduleA

以上模块加载顺序可以用下图的依赖图来表示，其中加载器会执行深度优先的依赖加载：

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC23%E7%AB%A0%EF%BC%9A%E6%A8%A1%E5%9D%97/%E4%BB%A5%20moduleA%20%E4%B8%BA%E5%85%A5%E5%8F%A3%E8%BF%9B%E8%A1%8C%E6%B7%B1%E5%BA%A6%E4%BC%98%E5%85%88%E7%9A%84%E6%A8%A1%E5%9D%97%E5%8A%A0%E8%BD%BD.png)

如果 moduleC 最先加载，则会打印如下输出，这表示模块加载的绝对顺序：

moduleD

moduleA

moduleB

moduleC

以上模块加载顺序可以通过下图的依赖图来表示，其中加载器会执行深度优先的依赖加载：

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC23%E7%AB%A0%EF%BC%9A%E6%A8%A1%E5%9D%97/%E4%BB%A5%20moduleC%20%E4%B8%BA%E5%85%A5%E5%8F%A3%E8%BF%9B%E8%A1%8C%E6%B7%B1%E5%BA%A6%E4%BC%98%E5%85%88%E7%9A%84%E6%A8%A1%E5%9D%97%E5%8A%A0%E8%BD%BD.png)

# 2. 使用 ES6 之前的模块加载器

在 ECMAScript 原生支持模块之前，使用模块的 JavaScript 代码本质上是希望使用默认没有的语言特性。因此，必须按照符合某种规范的模块语法来编写代码，另外还需要单独的模块工具把这些模块语句与 JavaScript 运行时连接起来。这里的模块语法和连接方式有不同的表现形式，通常需要在浏览器中额外加载库或者在构建时进行预处理。

## 1. CommonJS

CommonJS 规范描述了同步声明依赖的模块定义。这个规范主要用于在服务器端实现模块化代码组织，但也用于定义在浏览器中使用的模块依赖。CommonJS 模块语法不能在浏览器中直接运行。

>注意
>
>一般认为，Node.js 的模块系统使用了 CommonJS 规范，实际上并不完全正确。Node.js 使用了轻微修改版本的 CommonJS，因为 Node.js 主要在服务器环境下使用，所以不需要考虑网络延迟问题。考虑到一致性，本节使用 Node.js 风格的模块定义语法。

CommonJS 模块定义需要使用 require() 指定依赖，而使用 exports 对象定义自己的公共 API。下面的代码展示了简单的模块定义：

```javascript
var moduleB = require('./moduleB');

module.exports = {
    stuff: moduleB.doStuff();
};
```

moduleA 通过使用模块定义的相对路径来指定自己对 moduleB 的依赖。什么是模块定义，以及如何将字符串解析为模块，完全取决于模块系统的实现。比如在 Node.js 中，模块标识符可能指定文件，也可能指向包含 index.js 文件的目录。

请求模块会加载相应模块，而把模块赋值给变量也非常常见，但赋值给变量不是必需的。调用 require() 意味着模块会原封不动地加载进来：

```javascript
console.log('moduleA');
require('./moduleA'); // "moduleA"
```

无论一个模块在 require() 中被引用多少次，模块永远是单例。在下面的例子中，moduleA 只会被打印一次。这是因为无论请求多少次，moduleA 只会被加载一次。

```javascript
console.log('moduleA');
var a1 = require('./moduleA');
var a2 = require('./moduleA');

console.log(a1 === a2); // true
```

模块第一次加载后会被缓存，后续加载会取得缓存的模块（如下代码所示）。模块加载顺序由依赖图决定。

```javascript
console.log('moduleA');
require('./moduleA');
require('./moduleB'); // "moduleA"
require('./moduleA');
```

在 CommonJS 中，模块加载是模块系统执行的同步操作。因此 require() 可以像下面这样以编程方式嵌入在模块中：

```javascript
console.log('moduleA');
if (loadCondition) {
    require('./moduleA');
}
```

这里，moduleA 只会在 loadCondition 求值为 true 时才会加载。这个加载是同步的，因此 if() 块之前的任何代码都会在加载 moduleA 之前执行，而 if() 块之后的任何代码都会在加载 moduleA 之后执行。同样，加载顺序规则也会适用。因此，如果 moduleA 已经在前面某个地方加载过了，这个条件 require() 就意味着只暴露 moduleA 这个命名空间而已。

在上面的例子中，模块系统是 Node.js 实现的，因此 ./moduleB 是相对路径，指向与当前模块位于同一目录中的模块目标。Node.js 会使用 require() 调用中的模块标识符字符串去解析模块引用。在 Node.js 中可以使用绝对路径或相对路径，也可以安装在 node_modules 目录中依赖的模块标识符。我们并不关心这些细节，重要的是知道在不同的 CommonJS 实现中模块字符串引用的含义可能不同。不过，所有 CommonJS 风格实现的共同之处是模块不会指定自己的标识符，它们的标识符由其在模块文件层级中的位置决定。

指向模块定义的路径可能引用一个目录，也可能是一个 JavaScript 文件。无论是什么，这与本地模块实现无关，而 moduleB 被加载到局部变量中。moduleA 在 module.exports 对象上定义自己的公共接口，即 foo 属性。

如果有模块想使用这个接口，可以像下面这样导入它：

```javascript
var moduleA = require('./moduleA');

console.log(moduleA.stuff);
```

注意，此模块不导出任何内容。即使它，诶哟公共接口，如果应用程序请求了这个模块，那也会在加载时执行这个模块体。

module.exports 对象非常灵活，有多种使用方式。如果只想导出一个实体，可以直接给 module.exports 赋值：

```javascript
module.exports = 'foo';
```

这样，整个模块就导出一个字符串，可以像下面这样来使用：

```javascript
var moduleA = require('./moduleB');

console.log(moduleB); // 'foo'
```

导出多个值也很常见，可以使用对象字面量赋值或每个属性赋一次值来实现：

```javascript
// 等价操作：

module.exports = {
    a: 'A',
    b: 'B'
};

module.exports.a = 'A';
module.exports.b = 'B';
```

模块的一个主要用途是托管类定义：

```javascript
class A {}

module.exports = A;

var A = require('./moduleA');

var a = new A();
```

也可以将类实例作为导出值：

```javascript
class A {}

module.exports = new A();
```

此外，CommonJS 也支持动态依赖：

```javascript
if (condition) {
    var A = require('./moduleA');
}
```

CommonJS 依赖几个全局属性如 require 和 module.exports。如果想在浏览器中使用 CommonJS 模块，就需要与其非原生的模块语法之间构筑桥梁。模块级代码与浏览器运行时之间也需要某种屏障，因为没有封装的 CommonJS 代码在浏览器中执行会创建全局变量。这显然与模块模式的初衷相悖。

常见的解决方案是提前把模块文件打包好，把全局属性转换为原生 JavaScript 结构，将模块代码封装在函数闭包中，最终只提供一个文件。为了以正确的顺序打包模块，需要事先生成完整的依赖图。

## 2. 异步模块定义

CommonJS 以服务器端为目标环境，能够一次性把所有模块都加载到内存，而异步模块定义（AMD，Asynchronous Module Definiton）的模块定义系统则以浏览器为目标执行环境，这需要考虑网络延迟的问题。AMD 的一般策略是让模块声明自己的依赖，而运行在浏览器中的模块系统会按需获取依赖，并在依赖加载完成后立即执行依赖它们的模块。

AMD 模块实现的核心是用函数包装模块定义。这样可以防止声明全局变量，并允许加载器库控制何时加载模块。包装函数也便于模块代码的移植，因为包装函数内部的所有模块代码使用的都是原生 JavaScript 结构。包装模块的函数是全局 define 的参数，它是由 AMD 加载器库的实现定义的。

AMD 模块可以使用字符串标识符指定自己的依赖，而 AMD 加载器会在所有依赖模块加载完毕后立即调用模块工厂函数。与 CommonJS 不同，AMD 支持可选地为模块指定字符串标识符。

```javascript
// ID 为 'moduleA' 的模块定义。moduleA 依赖 moduleB.
// moduleB 会异步加载
define('moduleA', ['moduleB'], function(moduleB) {
    return {
        stuff: moduleB.doStuff();
    };
});
```

AMD 也支持 require 和 exports 对象，通过它们可以在 AMD 模块工厂函数内部定义 CommonJS 风格的模块。这样可以像请求模块一样请求它们，但 AMD 加载器会将它们识别为原生 AMD 结构，而不是模块定义：

```javascript
define('moduleA', ['require', 'exports'], function(require, exports) {
    var moduleB = require('moduleB');
    
    exports.stuff = moduleB.doStuff();
});
```

动态依赖也是通过这种方式支持的：

```javascript
define('moduleA', ['require'], function(require) {
    if (condition) {
        var moduleB = require('moduleB');
    }
});
```

## 3. 通用模块定义

为了统一 CommonJS 和 AMD 生态系统，通用模块定义（UMD，Universal Module Definition）规范应运而生。UMD 可用于创建这两个系统都可以使用的模块代码。本质上，UMD 定义的模块会在启动时检测要使用哪个模块系统，然后进行适当配置，并把所有逻辑包装在一个立即调用的函数表达式（IIFE）中。虽然这种组合并不完美，但在很多场景下足以实现两个生态的共存。

下面是只包含要给依赖的 UMD 模块定义的示例（来源为 Github 上的 UMD 仓库）：

```javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD。注册为匿名模块
        define(['moduleB'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node。不支持严格 CommonJS
        // 但可以在 Node 这样支持 module.exports 的
        // 类 CommonJS 环境下使用
        module.exports = factory(require('moduleB'));
    } else {
        // 浏览器全局上下文（root 是 window）
        root.returnExports = factory(root.moduleB);
    }
}(this, function (moduleB) {
    // 以某种方式使用 moduleB
    
    // 将返回值作为模块的导出
    // 这个例子返回了一个对象
    // 但是模块也可以返回函数作为导出值
    return {};
}));
```

此模式有支持严格 CommonJS 和浏览器全局上下文的变体。不应该期望手写这个包装函数，它应该由构建工具自动生成。开发者只需专注于模块的内容，而不必关心这些样板代码。

## 4. 模块加载器终将没落

随着 ECMAScript 模块规范得到越来越广泛的支持，本节展示的模式最终会走向没落。尽管如此，为了了解什么选择设计决策，了解 ECMAScript 模块规范的由来仍是非常有用的。CommonJS 与 AMD 之间的冲突正是我们现在享用的 ECMAScript 模块规范诞生的温床。



































