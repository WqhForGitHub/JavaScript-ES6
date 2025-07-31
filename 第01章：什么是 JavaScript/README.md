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

<br>

## 2. DOM

DOM（Document Object Model，文档对象模型）是 XML 的一套 API（Application Programming Interface，应用编程接口），经过扩展可以在 HTML 中使用。DOM 将整个页面抽象为一组分层节点。HTML 或 XML 页面的每个组成部分都是一种节点，包含不同的数据。比如下面的 HTML 页面：

```html
<html>
    <head>
        <title>Sample Page</title>
    </head>
    <body>
        <p> Hello World!</p>
    </body>
</html>
```

这些代码通过 DOM 可以表示为一组分层节点，如下图所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC1%E7%AB%A0%EF%BC%9A%E4%BB%80%E4%B9%88%E6%98%AF%20JavaScript/DOM%20%E8%8A%82%E7%82%B9%E5%88%86%E5%B1%82%E7%9A%84%E4%BE%8B%E5%AD%90.png)

DOM 通过创建表示文档的树，让开发者可以随心所欲地控制网页的内容和结构。使用 DOM API，可以轻松地删除、添加、替换、修改节点。

<br>

### 1. 为什么 DOM 是必需的

当年，在 IE4 和 netscape navigator 4 支持不同形式的 DHTML（dynamic HTML，动态 HTML）的情况下，开发者有史以来第一次可以做到不刷新页面就修改页面外观和内容。这代表了 web 技术的一个巨大进步，但同时也是一个很大的问题。由于网景和微软采用不同思路开发 DHTML，开发者写一个 HTML 页面就可以在任何浏览器中运行的好日子就此终结。

为了保持 web 跨平台的天性，必须要做点什么。人们担心如果无法限制网景和微软各行其是，那么 web 就会发生分裂，导致人们面向浏览器开发网页。就在这时，旨在为 web 健康发展制定标准的万维网联盟（w3c，world wide web comsortium）开始了制定 DOM 标准的进程。

<br>

### 2. DOM 级别

1998 年 10 月，DOM level 1 成为 w3c 的推荐标准。这个规范由两个模块组成：DOM Core 和 DOM HTML。。前者提供了一种映射 XML 文档，从而方便访问和操作文件任意部分的方式。后者扩展了前者，并增加了特定于 HTML 的对象和方法。

>注意
>
>DOM 并非只能通过 JavaScript 访问，而且确实被其他很多语言实现了。不过对于浏览器来说，DOM 就是使用 ECMAScript 实现的，如今已经成为 JavaScript 语言的一大组成部分。

DOM level 1 的目标是映射文档结构，而 DOM level 2 的目标则宽泛得多。这个对最初 DOM 规范的扩展增加了对（DHTML 早就支持的）鼠标和用户界面事件、范围、遍历（迭代 DOM 节点的方法）的支持，而且通过对象接口支持了层叠样式表。另外，DOM level 1 中的 DOM core 也被扩展以包含对 XML 命名空间的支持。

DOM level 1 新增了以下模块，以支持新的接口。

* **DOM 视图**：描述追踪文档不同视图（如应用 css 样式前后的文档）的接口。
* **DOM 事件**：描述事件及事件处理的接口。
* **DOM 样式**：描述处理元素 CSS 样式的接口。
* **DOM 遍历和范围**：描述遍历和操作 DOM 树的接口。

DOM level 3 进一步扩展了 DOM，增加了以统一的方式加载和保存文档的方法（包含在一个叫 DOM load and save 的新模块中），还有验证文档的方法（DOM validation）。在 level 3 中，DOM core 经过扩展支持了 XML 1.0 的所有特性，包含 XML infoset、xpath 和 xml base。

目前，w3c 不再按照 level 来维护 DOM 了，而是作为 DOM living standard 来维护，其快照称为 DOM4。DOM4 新增的内容包括替代 mutation events 的 mutation observers。

>注意
>
>在阅读关于 DOM 的资料时，你可能会看到 DOM level 0 的说。注意，并没有一个标准叫 DOM level 0，这只是 DOM 历史中的一个参照点。DOM level 0 可以看作 IE4 和 netscape navigator 4 中最初支持的 DHTML。

<br>

### 3. 其他DOM

除了 DOM core 和 DOM HTML 接口，有些其他语言也发布了自己的 DOM 标准。下面列出的语言是基于 XML 的，每一种都增加了该语言独有的 DOM 方法和接口：

* 可伸缩矢量图（SVG，scalable vector graphics）
* 数学标记语言（MathML，Mathematical Markup Language）
* 同步多媒体集成语言（SMIL，synchronized multimedia integration language）

此外，还有一些语言开发了自己的 DOM 实现，比如 mozilla 的 XML 用户界面语言（XUL，XML user interface language）。不过，只有前面列出的语言是 w3c 推荐标准。

<br>

## 3. BOM

IE3 和 netscape navigator 3 最早推出了 BOM（Browser object model， 浏览器对象模型）API，用于支持访问和操作浏览器的窗口。使用 BOM，开发者可以操控浏览器显示的页面之外的部分。而 BOM 真正独一无二的地方，当然也是问题最多的地方，就是它唯一一个没有相关标准的 JavaScript 实现。HTML5 的出现改变了这个局面，这个版本的 HTML 以正式规范的形式涵盖了尽可能多的 BOM 特性。由于 HTML5 的出现，之前很多与 BOM 有关的问题都迎刃而解了。

总的来说，BOM 主要针对浏览器窗口和窗格（frame），不过人们通常会把任何特定于浏览器的扩展都归在 BOM 的范畴内。比如，下面就是这样一些扩展：

* 弹出新浏览器窗口的能力
* 移动、缩放和关闭浏览器的详尽信息
* navigator 对象，提供关于浏览器的详尽信息
* location 对象，提供浏览器加载页面的详尽信息
* screen 对象，提供关于用户屏幕分辨率的详尽信息
* performance 对象，提供浏览器内存占用、导航行为和时间统计的详尽信息
* 对 cookie 的支持
* 其他自定义对象，如 XMLHttpRequest

因为在很长时间内都没有标准，所以每个浏览器实现的都是自己的 BOM。有一些所谓的事实标准，比如对于 window 对象和 navigator 对象，每个浏览器都会给它们定义自己的属性和方法。现在有了 HTML5，BOM 的实现细节应该会日趋一致。关于 BOM，本书会在第 12 章再专门详细介绍。























