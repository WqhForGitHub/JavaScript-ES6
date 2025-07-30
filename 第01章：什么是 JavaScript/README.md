# 2. JavaScript 实现

虽然 JavaScript 和 ECMAScript 基本上是同义词，但 JavaScript 远远不限于 ECMA-262 标准所定义的那样。没错，完整的 JavaScript 实现包含以下几个不同的部分（见下图）：

* 核心（ECMAScript，即 ECMA-262 标准）
* DOM（Document Object Model，文档对象模型）
* BOM（Browser Object Model，浏览器对象模型）

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC1%E7%AB%A0%EF%BC%9A%E4%BB%80%E4%B9%88%E6%98%AF%20JavaScript/JavaScript%20%E5%AE%9E%E7%8E%B0%E7%9A%84%E7%BB%84%E6%88%90%E9%83%A8%E5%88%86.png)

## 1. ECMAScript

ECMAScript，即 ECMA-262 定义的语言，并不局限于 web 浏览器。事实上，这门语言没有输入和输出之类的方法。ECMA-262 将这门语言作为一个基准来定义，以便在它之上再构建更稳健的脚本语言。web 浏览器只是 ECMAScript 实现可能存在的一种宿主环境（host environment）。宿主环境提供 ECMAScript 的基准实现和与环境自身交互必需的扩展。扩展（比如 DOM）使用 ECMAScript 核心类型和语法，提供特定于环境的额外功能。其他宿主环境还有服务器端 JavaScript 平台 node.js 和资源受限设备（如 IoT 设备）上的嵌入式系统。

如果不涉及浏览器的话，ECMA-262 到底定义了什么？在基本的层面，它描述这门语言的如下部分：

* 语法
* 类型
* 语句
* 关键字
* 保留字
* 操作符
* 全局对象

ECMAScript 只是对实现这个规范描述的所有这些部分的一门语言的称呼，而 JavaScript 实现了 ECMAScript。

<br>

### 1. ECMAScript 版本

ECMA-262 第 6 版，俗称 ES6、ES2015 或 ES Harmony（和谐版），于 2015 年 6 月发布，这一版包含了大概这个规范有史以来最重要的一批增强特性。ES6 正式支持了类、模块、迭代器、生成器、箭头函数、期约、反射、代理和众多新的数据类型。



### 2. ECMAScript 合规性是什么意思

ECMA-262 阐述了什么是 ECMAScript 合规性。要成为 ECMAScript 是心啊，必须满足下列条件：

* 支持 ECMA-262 中描述的所有类型、值、对象、属性、函数，以及程序语法与语义
* 支持 Unicode 字符标准

此外，合规实现可以像下面这样做。

* 增加 ECMA-262 中未提及的额外的类型、值、对象、属性和函数。ECMA-262 所说的这些额外内容主要指规范中未给出的新对象或对象的新属性。
* 支持 ECMA-262 中没有定义的程序和正则表达式语法（意思是允许修改和扩展内置的正则表达式特性）。

以上条件为实现的开发者基于 ECMAScript 开发新语言提供了极大的权限和灵活度，这也是 ECMAScript 广受欢迎的原因之一。





























