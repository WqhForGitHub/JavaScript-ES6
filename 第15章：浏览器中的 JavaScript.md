JavaScript 创造于 1994 年，其明确的目的就是为浏览器显示的文档赋予动态行为。自此以后，这门语言经过了多次重大改进，而与此同时，Web 平台的范围与能力也出现了爆炸式增长。今天，Web 对 JavaScript 程序员而言已经是一个完善的应用开发平台。浏览器专注于格式化文本与图片的显示，但与原生操作系统一样，浏览器也提供了其他服务，包括图形、视频、音频、网络、存储和线程。JavaScript 这门语言能够使 Web 应用使用 Web 平台提供的服务，本章将介绍如何使用这些服务最重要的部分。

本章首先会介绍 Web 平台的编程模型，解释如何把脚本嵌入 HTML 页面中（见 15.1 节），以及事件如何异步触发 JavaScript 代码（见 15.2 节）。在这两节的基础性内容之后，接下来各节将分别讲解可以在 Web 应用中使用的核心 JavaScript API：

- 15.3 节和 15.4 节分别讲解控制文档内容和样式。
- 15.5 节讲解确定文档元素在屏幕上的位置。
- 15.6 节讲解创建可复用的用户界面组件。
- 15.7 节和 15.8 节介绍绘图。
- 15.9 节讲解播放和生成声音。
- 15.10 节介绍管理浏览器导航和历史。
- 15.11 节讲解通过网络交换数据。
- 15.12 节介绍在用户计算机上存储数据。
- 15.13 节讲解通过线程执行并行计算。

>客户端 JavaScript
>
>在本书中以及各种网站上，你都会看到 “客户端 JavaScript” 的说法。这个概念指的就是在浏览器中运行的 JavaScript 代码。与之相对的是 “服务器端” 代码，也就是运行在服务器上的程序。
>
>这两 “端” 指的是网络连接的两端，分成了服务器和浏览器。开发 Web 应用通常涉及编写两 “端” 的程序。客户端和服务器端经常也被称为 “前端” 和 “后端”。

本书之前的版本一直在尝试全面介绍由浏览器定义的所有 JavaScript API，结果造成这本书在十年前就已经非常厚了。Web API 的数量和复杂性持续增长，我不再认为有必要在一本书中全部介绍它们。到了撰写第 7 版的时候，我的目标是全面讲解 JavaScript 语言，深入介绍如何在 Node 和浏览器中使用这门语言。本章不会介绍所有 Web API，但会介绍其中最重要的部分，并且详细到可以让你看完后立即上手。此外，在你学习了本章讲解的核心 API 之后，应该可以自己在需要时再选择性地学习新 API（比如 15.15 节总结的那些）。

Node 有自己唯一的实现，也有自己唯一的官方文档。相对而言，Web API 则是通过主要浏览器厂商的共识来定义的。Web API 的官方文档就是一系列规范，这些规范的目标读者是实现它们的 C++ 程序员，而不是使用这些 API 的 JavaScript 程序员。好在，Mozilla 的 “MDN Web 文档” 项目已经成为 Web API 的一个靠谱、全面的文档来源<sup>注 1</sup>。

>废弃的 API
>
>在 JavaScript 面世以来的二十多年间，浏览器厂商一直在增加新功能和 API，供程序员使用。其中有很多 API 已经过时了，包括下面这些。
>
>- 从未被标准化或从未被其他浏览器厂商实现过的专有 API。微软的 Internet Explorer 定义了很多这种 API。其中一些（如 `innerHTML` 属性被证明有用而最终被标准化了，还有一些（如 `attachEvent()` 方法）已经废弃多年了。
>- 低效 API（如 `document.write()` 方法），只要使用就会导致严重的性能问题，因此已经无法被人接受了。
>- 过时的 API，已经在很久以前就被实现同样目的的新 API 取代。例如，`document.bgColor` 的目的是通过 JavaScript 设置文档的背景颜色。而在 CSS 出现后，`document.bgColor` 成了一个历史遗迹，没什么人用了。
>- 设计有缺陷的 API，已经被更好的 API 取代。在 Web 早期，标准委员会以与语言无关的方式定义了关键的 Document Object Model API，以便同样的 API 既可以在 Java 程序中用来操作 XML 文档，也可以在 JavaScript 程序中用来操作 HTML 文档。这就导致了该 API 并不完全适合早期的 JavaScript 语言，存在很多 Web 开发者并不特别关注的功能。为弥补这种平台的设计缺陷，经过几十年的改进，今天的浏览器才都支持了更为优化的 Document Object Model。
>- 在可预见的未来，浏览器厂商可能需要支持这些废弃的 API，以保证向后兼容。但本书已经没有任何理由再讲解它们，或者说让读者再去学习它们了。Web 平台已经成熟且稳定，如果你是一名 Web 开发老兵，还记得本书第 4 版和第 5 版，那么你不仅需要学习很多新东西，同时可能还需要忘记很多过时的知识。

# 15.1 Web 编程基础

本节讲解如何编写 Web 应用中的 JavaScript 程序，如何将这些程序加载到浏览器，以及如何获取输入、产生输出，如何运行响应事件的异步代码。

## 15.1.1 HTML `<script>` 标签中的 JavaScript

浏览器显示 HTML 文档。如果想让浏览器执行 JavaScript 代码，那么必须在 HTML 文档中包含（或引用）相应代码，这时候就要用到 HTML`<script>`标签。

JavaScript 代码可以出现在 HTML 文件的`<script>`与`</script>`标签之间，也就是嵌入 HTML 中。比如，下面示例中展示的 HTML 文件包含一个`<script>`标签，其中的 JavaScript 代码能够动态更新文档中的一个元素，让它像是一个数字时钟：

```html
<!DOCTYPE html>    <!-- 这是一个 HTML5 文件 -->
<html>             <!-- 根元素 -->
<head>             <!-- 标题、脚本和样式可以放在这里 -->
<title>Digital Clock</title>
<style>
#clock {          /* 对带有 id="clock" 属性的元素的样式 */
  font: bold 24px sans-serif; /* 字体比较大且加粗 */
  background: #ddf;           /* 背景为淡灰色 */
  padding: 15px;              /* 周围有一些空间 */
  border: solid black 2px;    /* 实心边框 */
  border-radius: 10px;        /* 边框有圆角 */
}
</style>
</head>
<body>             <!-- 这个主体包含文档内容 -->
<h1>Digital Clock</h1> <!-- 显示标题 -->
<span id="clock"></span> <!-- 我们会向这个元素中插入时间 -->
<script>
// 定义一个函数，用于显示当前时间
function displayTime() {
    let clock = document.querySelector("#clock"); // 取得带有 id="clock" 属性的元素
    let now = new Date();                         // 取得当前时间
    clock.textContent = now.toLocaleTimeString(); // 在时钟里显示时间
}
displayTime()                // 立即显示时间
setInterval(displayTime, 1000); // 然后每秒更新一次
</script>
</body>
</html>
```

虽然 JavaScript 代码可直接嵌入 `<script>` 标签中，但更常见的方式是使用 `<script>` 标签的 `src` 属性指定 JavaScript 代码文件的 URL（绝对 URL 或者相对于当前 HTML 文件的相对 URL）。如果把前面示例中的 JavaScript 代码拿出来放到 `scripts/digital_clock.js` 文件中，则引用该代码文件的 `<script>` 标签就是这样的：

```html
<script src="scripts/digital_clock.js"></script>
```

JavaScript 文件只包含纯 JavaScript 代码，不包含 `<script>` 或其他 HTML 标签。按照约定，JavaScript 代码文件以 `.js` 结尾。

包含 `src` 属性的 `<script>` 标签就如同指定 JavaScript 文件的内容直接出现在 `<script>` 和 `</script>` 标签之间一样。注意，即便指定了 `src` 属性，后面的 `</script>` 标签也是 HTML 文件必需的，HTML 不支持 `<script/>` 标签。

使用 `src` 有如下优点：

- 简化 HTML 文件，因为可以把大段的 JavaScript 代码从中移走。换句话说，这样可以实现内容与行为分离。
- 在多个网页共享同一份 JavaScript 代码时，使用 `src` 属性可以只维护一份代码，而无须在代码变化时修改多个 HTML 文件。
- 如果一个 JavaScript 文件被多个页面共享，那它只会被使用它的第一个页面下载一次，后续页面可以从浏览器缓存中获取该文件。
- 因为 `src` 以任意 URL 作为值，所以来自一个 Web 服务器的 JavaScript 程序或网页可以利用其他服务器暴露的代码。很多互联网广告就依赖这个事实。

### 模块

10.3 节讲解了 JavaScript 模块，介绍了 `import` 和 `export` 指令。如果你用模块写了一个 JavaScript 程序（且没有使用代码打包工具把所有模块都整合到一个非 JavaScript 模块文件中），那必须使用一个带有 `type="module"` 属性的 `<script>` 标签来加载这个程序的顶级模块。这样，浏览器会加载你指定的模块，并加载这个模块导入的所有模块，以及（递归地）加载所有这些模块导入的模块。完整的细节可以参考 10.3.5 节。

### 指定脚本类型

在 Web 的早期，人们认为浏览器将来有一天可能实现 JavaScript 以外的语言，为此，程序员需要给 `<script>` 标签添加 `language="javascript"` 或 `type="application/javascript"` 属性。这些完全是没有必要的。JavaScript 本来就是 Web 的默认（也是唯一）语言。因此 `language` 属性被废弃了，而 `type` 属性也只有两个使用场景：

- 用于指定脚本是模块；
- 在网页中嵌入数据但不会显示（参见 15.3.4 节）。

### 脚本运行时机：async 与 defer

在浏览器引入 JavaScript 语言之初，还没有任何 API 可以遍历和操作已经渲染好的文档的结构或内容。JavaScript 代码能够影响文档内容的唯一方式，就是在浏览器加载文档的过程中动态生成内容。为此，要使用 `document.write()` 方法在脚本所在的位置向 HTML 中注入文本。

虽然现在已经不再提倡使用 `document.write()` 生成内容了，但由于还存在这种可能，浏览器在解析遇到的 `<script>` 元素时的默认行为是必须要运行脚本，就是为了确保不漏掉脚本可能输出的 HTML 内容，然后才能再继续解析和渲染文档。这有可能严重拖慢网页的解析和渲染过程。

好在默认的这种同步或阻塞式脚本执行模式并非唯一选项。`<script>` 标签也支持 `defer` 和 `async` 属性，这两个属性会导致脚本以不同的方式执行。这两个是布尔值属性，没有值，因此只要它们出现在 `<script>` 标签上就会生效。但要注意，这两个属性只对使用 `src` 属性的 `<script>` 标签起作用。

```html
<script defer src="deferred.js"></script>
<script async src="async.js"></script>
```

`defer` 和 `async` 属性都会明确告诉浏览器，当前链接的脚本中没有使用 `document.write()` 生成 HTML 输出。因此浏览器可以在下载脚本的同时继续解析和渲染文档。其中，`defer` 属性会让浏览器把脚本的执行推迟到文档完全加载和解析之后，此时已经可以操作文档了。`async` 属性会让浏览器尽早运行脚本，但在脚本下载期间同样不会阻塞文档解析。如果 `<script>` 标签上同时存在这两个属性，则 `async` 属性起作用。

有一点要注意，推迟（`defer`）的脚本会按照它们在文档中出现的顺序运行。因为异步（`async`）脚本会在它们加载完毕后运行，所以其运行顺序无法预测。

带有 `type="module"` 属性的脚本默认会在文档加载完毕后执行，就好像有一个 `defer` 属性一样。可以通过 `async` 属性来覆盖这个默认行为，这样会导致代码在模块及其所有依赖加载完毕后就立即执行。

如果不使用 `async` 和 `defer` 属性（特别是对那些直接包含在 HTML 中的代码），也可以选择把 `<script>` 标签放在 HTML 文件的末尾。这样，脚本在运行的时候就知道自己前面的文档内容已经解析，可以操作了。

### 按需加载脚本

有时，文档在刚刚加载完成时可能并不需要某些 JavaScript 代码，只有当用户执行了某些操作，比如单击某个按钮或打开某个菜单时才需要。如果你的代码是以模块形式写的，则可以使用 `import()` 来按需加载，具体可以参考 10.3.6 节。

如果没有使用模块，可以通过向文档中动态添加 `<script>` 标签的方式按需加载脚本：

```javascript
// 异步加载和执行指定 URL 的脚本
// 返回期约，脚本加载完毕后解决
function importScript(url) {
    return new Promise((resolve, reject) => {
        let s = document.createElement("script"); // 创建一个 <script> 元素
        s.onload = () => { resolve(); };          // 加载后解决期约
        s.onerror = (e) => { reject(e); };        // 失败时拒绝期约
        s.src = url;                              // 设置脚本的 URL
        document.head.append(s);                  // 把 <script> 添加到文档
    });
}
```

这个 `importScript()` 函数使用 DOM API（参见 15.3 节）创建了一个新的 `<script>` 标签，并将其添加到了文档的 `<head>` 元素中。这个函数也使用了事件处理程序（参见 15.2 节）来判断脚本何时加载成功，何时加载失败。

## 15.1.2 文档对象模型

客户端 JavaScript 编程中最重要的一个对象就是 `Document` 对象，它代表浏览器窗口或标签页中显示的 HTML 文档。用于操作 HTML 文档的 API 被称为文档对象模型（Document Object Model, DOM），将在 15.3 节详细讲解。但 DOM 对于客户端 JavaScript 编程实在太重要了，因此有必要先在这里介绍一下。

HTML 文档包含一组相互嵌套的 HTML 元素，构成了一棵树。以下面这个简单的 HTML 文档为例：

```html
<html>
    <head>
        <title>Sample Document</title>
    </head>
    <body>
        <h1>An HTML Document</h1>
        <p>This is a <<i>simple</</i> document.
    </body>
</html>
```

顶级的 `<html>` 标签包含 `<head>` 和 `<body>` 标签。而 `<head>` 标签包含 `<title>` 标签，`<body>` 标签包含 `<h1>` 和 `<p>` 标签。`<title>` 和 `<h1>` 标签包含文本字符串，而 `<p>` 标签包含两个文本字符串和一个位于它们之间的 `<<i>` 标签。

DOM API 与 HTML 文档的这种树形结构可谓一一对应。文档中的每个 HTML 标签都有一个对应的 JavaScript `Element` 对象，而文档中的每一行文本也都有一个与之对应的 `Text` 对象。`Element` 和 `Text` 类，以及 `Document` 类本身，都是一个更通用的 `Node` 类的子类。各种 `Node` 对象组合成一个树形结构，JavaScript 可以使用 DOM API 对其进行查询和遍历。图 15-1 形象地展示了文档的 DOM 表示是一棵树。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%88%E7%AC%AC7%E7%89%88%EF%BC%89/%E7%AC%AC15%E7%AB%A0%EF%BC%9A%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E7%9A%84%20JavaScript/HTML%20%E6%96%87%E6%A1%A3%E7%9A%84%E6%A0%91%E5%BD%A2%E8%A1%A8%E7%A4%BA.png)

如果你对计算机编程中的树形结构还不熟悉，那至少应该知道这种结构借用了家谱中的一些概念。比如，直接位于一个节点上方的节点是该节点的父亲，而位于一个节点下一级的节点则是该节点的孩子。位于同一层级的节点具有相同的父节点，它们之间互为兄弟。一个节点之下任意层级中的节点，都是该节点的后代。而父亲、祖父和所有位于一个节点之上的节点，都是该节点的祖先。

DOM API 包含创建新 `Element` 和 `Text` 节点的方法，也包含把它们作为其他 `Element` 对象的孩子插入文档的方法。还有用来在文档中移动元素的方法，以及把它们从文档中彻底删除的方法。服务器端应用可以通过 console.log() 产生纯文本输出，而客户端 JavaScript 应用则可以使用 DOM API 通过构建或操作文档树产生格式化的 HTML 输出。

每个 HTML 标签类型都有一个与之对应的 JavaScrtipt 类，而文档中出现的每个标签在 JavaScript 中都有对应类的一个实例表示。例如，`<body>` 标签由 HTMLBodyElement 的实例表示，而 `<table>` 标签则由 HTMLTableElement 的实例表示。JavaScript 中这些元素对象都有与 HTML 标签的属性对应的属性。例如，表示 `<img>` 标签的 HTMLImageElement 应属性的值。在 JavaScript 中修改这个属性的值，也会改变 HTML 属性的值（并导致浏览器加载和显示新图片）。多数 JavaScript 元素类都只是镜像 HTML 标签的属性，但有些也定义了额外的方法。比如，HTMLAudioElement 和 HTMLVideoElement 类都定义了 play() 和 pause() 方法，用于控制音频和视频文件的回放。

## 15.1.3 浏览器中的全局对象

每个浏览器窗口或标签页都有一个全局对象（参见 3.7 节）。在一个窗口中运行的所有 JavaScript 代码（不包括在工作线程中运行的代码，参见 15.13 节）都共享一个全局对象。无论文档中包含多少脚本或模块，这个事实都不会改变：文档中的所有脚本和模块共享同一个全局对象，如果有脚本在该对象上定义了一个属性，则该属性也将对所有其他脚本可见。

全局对象上定义了 JavaScript 标准库，比如`parseInt()`函数、Math 对象、Set 类等。在浏览器中，全局对象也包含各种 Web API 的主入口。例如，`document`属性表示当前显示的文档，`fetch()`方法用于发送 HTTP 网络请求，而`Audio()`构造函数允许 JavaScript 程序播放声音。

在浏览器中，全局对象具有双重角色。它既是定义 JavaScript 语言内置类型和函数的地方，也代表当前浏览器窗口定义了`history`（表示浏览器浏览历史，参见 15.10.2 节）和`innerWidth`（表示窗口的像素宽度）等 Web API 的属性。全局对象中有一个属性叫`window`，它的值就是全局对象本身。这意味着在客户端代码中可以直接通过`window`引用全局对象。在使用窗口特定的功能时，最好加上`window`前缀。比如，写`window.innerWidth`比只写`innerWidth`更明确。

## 15.1.4 脚本共享一个命名空间

在模块中，定义在模块顶级（即位于任何函数或类定义之外）的常量、变量、函数和类是模块私有的，除非它们被明确地导出。被导出时，这些模块成员可以被其他模块有选择地导入（注意，模块的这个性质使用代码打包工具时也得到了维护）。

不过在非模块脚本中，情况完全不同。如果在顶级脚本中定义了一个常量、变量、函数或类，则该声明将对同一文档中的所有脚本可见。如果一个脚本定义了函数`f()`，另一个脚本定义了类`C`，第三个脚本无须采取任何导入操作即可调用该函数和实例化该类。因此如果没有使用模块，同一个文档中共享同一个命名空间，但在大型程序中避免命名冲突则会变成一件麻烦事，特别是在某些脚本还是第三方库的情况下。

这个共享的命名空间在运行时有一些历史遗留问题。比如，顶级的`var`和`function`声明会在共享的全局对象上创建属性。如果一个脚本定义了顶级函数`f()`，那么同一个文档中的另一个脚本可以用`f()`或者`window.f()`调用该函数。而使用 ES6 中`const`、`let`和`class`的顶级声明则不会在全局对象上创建属性。但是，它们仍然会定义在一个共享的命名空间内。如果一个脚本定义了类`C`，另一个脚本也可以通过`new C()`（但不能通过`new window.C()`）创建该类的实例。

简单来说，在模块中，顶级声明被限制在模块内部，可以明确导出。而在非模块脚本中，顶级声明被限制在包含文档内部，顶级声明由文档中所有的脚本共享。以前的`var`和`function`声明是通过全局对象的属性共享的，而现在的`const`、`let`和`class`声明也会被共享且拥有相同的文档作用域，但它们不作为 JavaScript 可以访问到的任何对象的属性存在。

## 15.1.5 JavaScript 程序的执行

客户端 JavaScript 中没有程序的正式定义，但我们可以说 JavaScript 程序由文档中包含和引用的所有 JavaScript 代码组成。这些分开的代码共享同一个全局`Window`对象，它们可以通过这个对象访问表示 HTML 文档的同一个底层`Document`对象。不是模块的脚本还额外共享同一个顶级命名空间。

如果网页中包含嵌入的窗格（`<iframe>`元素），被嵌入文档与嵌入它的文档中的 JavaScript 代码拥有不同的全局对象和`Document`对象，可以看成两个不同的 JavaScript 程序。但要记住，关于 JavaScript 程序的边界在哪里并没有正式的定义。如果包含文档与被包含文档是从同一个服务器加载的，则一个文档中的代码就能够与另一个文档中的代码交互。此时，如果你愿意，可以把它们看成一个程序整体的两个互操作的部分。15.13.6 节将解释 JavaScript 程序如何与在`<iframe>`中运行的 JavaScript 代码相互发送和接收消息。

我们可以把 JavaScript 程序的执行想象成发生在两个阶段。在第一阶段，文档内容加载完成，`<script>`元素指定的（内部和外部）代码运行。脚本通常按照它们在文档中出现的顺序依次执行，不过也可以使用前面介绍过的`async`和`defer`属性来修改。任何一个脚本中的 JavaScript 代码都自上而下运行，当然还要服从 JavaScript 的条件、循环和其他控制语句。有的脚本在这个阶段并不真正做任何事，仅仅是定义供第二阶段使用的函数和类。而有的脚本在第一阶段可能会做很多重要的事情，而在第二阶段则什么也不做。想象一下在文档最末尾有一个脚本，它会找到文档中所有的`<h1>`和`<h2>`标签，然后修改文档，在开头的地方插入一个目录。这件事完全可以在第一阶段完成（15.3.6 节恰好有一个为文档插入目录的示例）。

当文档加载完毕且所有脚本都运行之后，JavaScript 执行就进入了第二阶段。这个阶段是异步的、事件驱动的。如果脚本要在第二阶段执行，那么它在第一阶段必须要做一件事，就是至少要注册一个将被异步调用的事件处理程序或其他回调函数。在事件驱动的第二阶段，作为对异步事件的回应，浏览器会调用事件处理程序或其他回调函数。事件处理程序通常是为响应用户操作（如鼠标点击、敲击键盘等）而被调用的，但也可能会被网络活动、文档和资源加载事件、流逝的时间或者 JavaScript 代码中的错误触发。事件和事件处理程序在 15.2 节有详细的讲解。

事件驱动阶段发生的第一批事件主要有 “`DOMContentLoaded`” 和 “`load`”。“`DOMContentLoaded`” 在 HTML 文档被完全加载和解析后触发。而 “`load`” 事件在所有文档的外部资源（如图片）都完全加载后触发。JavaScript 程序经常使用这两个事件作为触发或启动信号。经常可以看到某些程序的脚本定义了一些函数，但除了注册会被事件驱动阶段执行的 “`load`” 事件的事件处理程序之外，其他什么也不做。而负责操作文档、开始时程序预定要做的正是这个 “`load`” 事件处理程序。注意，在 JavaScript 编程中，类似这里所说的 “`load`” 事件处理程序再去注册其他事件处理程序也是很常见的。

JavaScript 程序的加载阶段相对比较短，理想情况下少于 1 秒。文档加载一完成，事件驱动阶段将在浏览器显示文档的过程中一直持续。因为这个阶段是异步的和事件驱动的，所以可能会有很长一段时间什么也不会发生，也不会执行任何 JavaScript 代码。而这个过程时不时地会被用户操作或网络事件打断。接下来我们将更详细地讲解这两个阶段。

### 客户端 JavaScript 的线程模型

JavaScript 是单线程的语言，而单线程执行让编程更容易：你可以保证自己写的两个事件处理程序永远不会同时运行。在操作文档内容时，你敢肯定不会有别的线程会同时去修改它。而且，在写 JavaScript 代码时，你永远不需要关心锁、死锁或者资源争用。

单线程执行意味着浏览器会在脚本和事件处理程序执行期间停止响应用户输入。JavaScript 程序为此有责任确保 JavaScript 事件处理程序不会长时间运行。如果脚本执行计算量大的任务，就会导致文档加载延迟，用户在脚本执行结束前将看不到文档内容。如果事件处理程序执行计算密集型任务，浏览器可能会变得没有响应，有可能导致用户以为程序已经崩溃了。

Web 平台定义了一种受控的编程模型，即 Web 工作线程（Web worker）。工作线程是一个后台线程，可以执行计算密集型任务而不冻结用户界面。工作线程中运行的代码无权访问文档内容，不会与主线程或其他工作线程共享任何状态，只能通过异步消息事件与主线程或其他工作线程通信。因此这种并发对主线程没有影响，工作线程也不会改变 JavaScript 程序的单线程执行模型。要全面了解 Web 的安全线程机制，请参考 15.13 节。

### 客户端 JavaScript 时间线

前面介绍了 JavaScript 程序会从脚本执行阶段开始，然后过渡到事件处理阶段。这两个阶段可以进一步分成下列步骤。

1. 浏览器创建`Document`对象并开始解析网页，随着对 HTML 元素及其文本内容的解析，不断向文档中添加`Element`对象和`Text`节点。此时，`document.readyState`属性的值是 “`loading`”。
2. HTML 解析器在碰到一个没有`async`、`defer`或`type="module"`属性的`<script>`标签时，会把该标签添加到文档中，然后执行其中的脚本。脚本是同步执行的，而且在脚本下载（如果需要）和运行期间，HTML 解析器会暂停。类似这样的脚本可以使用`document.write()`向输入流中插入文本，而该文本在解析器恢复时将成为文档的一部分。类似的脚本经常只会定义函数和注册事件处理程序，以便后面使用，但它也可以遍历和操作当时已经存在的文档树。换句话说，不带`async`或`defer`属性的非模块脚本可以看到它自己的`<script>`标签及该标签之前的文档内容。
3. 解析器在碰到一个有`async`属性的`<script>`元素时，会开始下载该脚本的代码（如果该脚本是模块，也会递归地下载模块的所有依赖）并继续解析文档。脚本在下载完成后会尽快执行，但解析器不会停下来等待它下载。异步（`async`）脚本必须不使用`document.write()`方法。它们可以看到自己的`<script>`标签及该标签之前的文档内容，同时也有可能访问更多文档内容。
4. 当文档解析完成后，`document.readyState`属性变成 “`interactive`”。
5. 任何有`defer`属性的脚本（以及任何没有`async`属性的模块脚本）都会在按照它们在文档中出现的顺序依次执行。延迟脚本也有可能在此时执行。延迟脚本可以访问完整的文档，必须不使用`document.write()`方法。
6. 浏览器在`Document`对象上派发 “`DOMContentLoaded`” 事件。这标志着程序执行从同步脚本执行阶段过渡到异步的事件驱动阶段。但要注意，此时仍然可能存在尚未执行的`async`脚本。
7. 此时文档已经解析完全，但浏览器可能仍在等待其他内容（如图片）加载。当所有外部资源都加载完成，且所有`async`脚本都加载并执行完成时，`document.readyState`属性变成 “`complete`”，浏览器在`Window`对象上派发 “`load`” 事件。
8. 从这一刻起，作为对用户输入事件、网络事件、定时器超时等的响应，浏览器开始异步调用事件处理程序。

## 15.1.6 程序输入与输出

与任何程序一样，客户端 JavaScript 程序也处理输入数据，产生输出数据。输入的来源有很多种：

- 文档的内容本身，JavaScript 代码可以通过 DOM API 来访问（参见 15.3 节）。
- 事件形式的用户输入，如在 HTML `<button>`元素上单击鼠标（或点按触屏），或在 HTML `<textarea>`元素中输入文本。15.2 节将讲解 JavaScript 程序如何响应类似的用户事件。
- 当前显示文档的 URL 可以在客户端 JavaScript 中通过`document.URL`读到。如果把这个字符串传给`URL()`构造函数（参见 11.9 节），则可以方便地取得 URL 的路径、查询字符串和片段值。
- HTTP “Cookie” 请求头的内容在客户端代码中可以通过`document.cookie`读到。Cookie 通常被服务器端代码用来维持用户会话，但需要时客户端代码也可以读取（和写入）Cookie。更多内容可以参见 15.12.2 节。
- 全局`navigator`属性暴露了关于浏览器、操作系统以及它们能力的信息。例如，`navigator.userAgent`是标识浏览器身份的字符串，`navigator.language`是用户偏好的语言，而`navigator.hardwareConcurrency`返回浏览器可用的逻辑 CPU 的个数。类似地，全局`screen`属性暴露了用户显示器尺寸的信息，比如`screen.width`和`screen.height`分别是显示器的宽度和高度。从某种意义上看，这些`navigator`和`screen`的值对浏览器而言就相当于 Node 程序中的环境变量。

客户端 JavaScript 通常以借助 DOM API（参见 15.3 节）操作 HTML 文档的形式（或者通过使用 React 或 Angular 等高级框架操作文档）产生输出。客户端代码也可以使用`console.log()`及其相关方法（参见 11.8 节）产生输出。但这种输出只能在开发者控制台看到，因此只能用于调试，不能用作对用户的输出。

## 15.1.7 程序错误

与直接运行在操作系统上的应用程序（例如 Node 应用程序）不同，在浏览器中运行的 JavaScript 程序不会真正 “崩溃”。如果 JavaScript 程序在运行期间出现异常，且代码中没有`catch`语句处理它，开发者控制台将会显示一条错误消息，但任何已经注册的事件处理程序照样会继续运行和响应事件。

如果你想定义一个终极错误处理程序，希望在出现这种未捕获异常时调用，那可以把`Window`对象的`onerror`属性设置为一个错误处理函数。当未捕获异常沿调用栈一路向上传播，错误消息即将显示在开发者控制台中时，`window.onerror`函数将会以三个字符串参数被调用。`window.onerror`收到的第一个参数是描述错误的消息。第二个参数是一个字符串，包含导致错误的 JavaScript 代码的 URL。第三个参数是文档中发生错误的行号。如果`onerror`处理程序返回`true`，意味着通知浏览器它已经处理了错误，不需要进一步行动了，换句话说，也就是浏览器不应该再显示自己的错误消息了。

如果期约被拒绝而没有`.catch()`函数处理它，那么这种情况非常类似未处理异常，也就是程序中意料之外的错误或逻辑错误。可以通过定义`window.onunhandledrejection`函数或者使用`window.addEventListener()`为 “`unhandledrejection`” 事件注册一个处理程序来发现它。传给这个处理程序的事件对象会有一个`promise`属性，其值为被拒绝的 Promise 对象，还有一个`reason`属性，其值为本来要传给`.catch()`函数的拒绝理由。与前面介绍的错误处理程序类似，如果在这个未处理拒绝事件对象上调用`preventDefault()`，浏览器就会认为错误已经处理，而不会在开发者控制台中显示错误消息了。

虽然定义`onerror`和`onunhandledrejection`处理程序经常不是必需的，但如果你想知道用户浏览器中发生了哪些意外错误，则作为一种 “遥测” 机制，可以利用它们把客户端错误上报给服务器（比如使用`fetch()`函数发送 HTTP POST 请求）。

## 15.1.8 Web 安全模型

由于网页可以在你的私人设备上执行任意 JavaScript 代码，因此存在明显的安全隐患。浏览器厂商一直在努力平衡两个相互制约的目标：

- 定义强大的客户端 API，让 Web 应用用途更广。
- 防止恶意代码读取或修改用户数据、侵犯用户隐私、欺诈用户或浪费用户的时间。

接下来将简单介绍 Web 平台的安全限制和已知问题，希望每个 JavaScript 程序员都有所了解。

### JavaScript 不能做什么

浏览器对恶意代码的第一道防线就是不支持某些能力。例如，客户端 JavaScript 不能向客户端计算机中写入或删除任何文件，也不能展示任意目录的内容。这意味着 JavaScript 程序不能删除数据，也不能植入病毒。

类似地，客户端 JavaScript 没有通用网络能力。客户端 JavaScript 程序可以发送 HTTP 请求（参见 15.11.1 节）。而另一个标准，即 WebSocket（参见 15.11.3 节），定义了一套类似套接口的 API，用于跟特定的服务器通信。但这些 API 都无法随意访问任意服务器。使用客户端 JavaScript 写不出通用互联网客户端和服务器。

### 同源策略

同源策略指的是对 JavaScript 代码能够访问和操作什么 Web 内容的一整套限制。通常在页面中包含 `<iframe>` 元素时就会涉及同源策略。此时，同源策略控制着一个窗格中的 JavaScript 与另一个窗格中的 JavaScript 的交互。比如，脚本只能读取与包含它的文档同源的 Window 和 Document 对象的属性。

文档的**源**就是文档 URL 的协议、主机和端口。从不同服务器加载的文档是不同源的，从相同主机的不同端口加载的文档也是不同源的。而且，对于通过 http: 协议加载的文档与通过 https: 协议加载的文档来说，即便它们来自同一台服务器，也是不同源的。浏览器通常把每个 file: URL 看成一个独立的源，这意味着如果你写的程序会显示同一台服务器上的多个文档，则可能无法使用 file: URL 在本地测试它，而必须在开发期间运行一个静态 Web 服务器。

有一点非常重要，就是应该知道脚本自身的源与同源策略不相关，相关的是包含脚本的文档的源。比如，假设主机 A 上有一个脚本，而主机 B 上的一个网页（使用 `<script>` 元素的 src 属性）包含了这个脚本。则该脚本的源是主机 B，且该脚本对包含它的文档具有完全访问权。如果文档中嵌入的 `<iframe>` 包含另一个来自主机 B 的文档，则该脚本同样拥有对这个文档的完全访问权。但是，如果顶级文档包含另一个 `<iframe>`，其中显示的文档来自主机 C（或者甚至来自主机 A），则同源策略就会起作用，并阻止该脚本访问这个嵌入的文档。

同源策略也会应用到脚本发起的 HTTP 请求（参见 15.11.1 节）中。JavaScript 代码可以向托管其包含文档的服务器发送任意 HTTP 请求，但不能与其他服务器通信（除非那些服务器开启了后面介绍的 CORS）。

同源策略对使用多子域的大型网站造成了麻烦。比如，来自 [orders.example.com](https://orders.example.com/) 的脚本可能需要读取 [example.com](https://example.com/) 上文档的属性。为了支持这种多子域名网站，脚本可以通过把 `document.domain` 设置为一个域名后缀来修改自己的源。因此，源为 [https://orders.example.com](https://orders.example.com/) 的脚本通过把 `document.domain` 设置为 “[example.com](https://example.com/)”，可以把自己的源修改为 [https://example.com](https://example.com/)。但是，该脚本不能把 `document.domain` 设置为 “orders**[ample.com](https://ample.com/)” 或 “com”。

第二种缓解同源策略的技术是**跨源资源共享（Cross-Origin Resource Sharing，CORS）**，它允许服务器决定对哪些源提供服务。CORS 扩展了 HTTP，增加了一个新的 `Origin:` 请求头和一个新的 `Access-Control-Allow-Origin` 响应头。服务器可以使用这个头部明确列出对哪些源提供服务，或者使用通配符表示可以接收任何网站的请求。浏览器会根据这些 CORS 头部的有无决定是否放松同源限制。

### 跨站点脚本

跨站点脚本（Cross-Site Scripting，XSS）是一种攻击方式，指攻击者向目标网站注入 HTML 标签或脚本。客户端 JavaScript 程序员必须了解并防范跨站点脚本。

如果网页的内容是动态生成的，比如根据用户提交的数据生成内容，但却没有提前对那些数据 “消毒”（删除嵌入的 HTML 标签等），那就可能成为跨站点脚本的攻击目标。下面看一个非常简单的示例，这个示例使用 JavaScript 根据用户输入的名字给出问候：

```html
<script>
let name = new URL(document.URL).searchParams.get("name");
document.querySelector('h1').innerHTML = "Hello " + name;
</script>
```

这两行脚本会从文档 URL 中提取 “name” 这个查询参数，然后使用 DOM API 把一个 HTML 字符串注入文档的第一个 `<h1>` 标签中。页面期望的调用方式是使用类似下面这样的 URL：

```plaintext
http://www.example.com/greet.html?name=David
```

对于这个 URL，网页会显示文本 “Hello David”。但是，如果查询参数是下面这样的，会发生什么呢？

```plaintext
name=%3Cimg%20src=x.png%20onload=alert('hacked')%2F%3E
```

把这个经过 URL 转义的参数解码后，就会导致下面的 HTML 被注入文档：

```html
Hello <img src="x.png" onload="alert('hacked')"/>
```

于是，在图片加载后，`onload` 属性中的 JavaScript 字符串就会执行。全局 `alert()` 函数将显示一个模态对话框。显示一个对话框没什么大不了，但这演示了在这个网站上显示未经处理的 HTML 会导致任意攻击代码执行的可能性。

之所以称其为跨站点脚本攻击，是因为会涉及不止一个网站。网站 B 包含一个特殊编制的链接（类似前面示例中的 URL），指向网站 A。如果网站 B 能够说服用户点击该链接，用户就会导航到网站 A，但网站 A 此时会运行来自网站 B 的代码。该代码可能会破坏网站 A 的页面，或者导致它功能失效。更危险的是，恶意代码可能读取网站 A 存储的cookie（可能包含个人账号或其他用户身份信息）并将该数据发送回网站 B。这种注入的代码甚至可以跟踪用户的键盘输入，并将该数据发送回网站 B。

一般来说，防止 XSS 攻击的办法是从不可信数据中删除 HTML 标签，然后再用它去动态创建文档内容。对于前面展示的 greet.html，可以通过把不可信输入中的特殊 HTML 字符替换成等价的 HTML 实体来解决问题：

```javascript
name = name
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;")
  .replace(/\//g, "&#x2F;");
```

应对 XSS 攻击的另一个思路是让自己的 Web 应用始终在一个 `<iframe>` 中显示不可信内容，并将这个 `<iframe>` 的 `sandbox` 属性设置为禁用脚本和其他能力。

跨站点脚本作为一种有害的漏洞，其根源可以追溯到 Web 的架构设计。深入理解这个漏洞是非常有必要的，但进一步讨论则超出了本书的范畴。网上有很多相关的文章和资源，大家可以自行学习。

# 15.2 事件

客户端 JavaScript 程序使用**异步事件驱动**的编程模型。在这种编程风格下，浏览器会在文档、浏览器或者某些元素或与之关联的对象发生某些值得关注的事情时生成事件。例如，浏览器会在它加载完文档时生成事件，在用户把鼠标移到超链接上时生成事件，也会在用户敲击键盘上的键时生成事件。如果 JavaScript 应用关注特定类型的事件，那它可以注册一个或多个函数，让这些函数在该类型事件发生时被调用。注意，这并非 Web 编程的专利，任意具有图形用户界面的应用都是这样设计的。换句话说，界面就在那里等待用户与之交互（也可以说，它们在等待事件发生），然后给出响应。

在客户端 JavaScript 中，事件可以在 HTML 文档中的任何元素上发生，这也导致了浏览器的事件模型比 Node 的事件模型明显更复杂。本节就从几个重要的定义开始解释这个事件模型。

## 事件类型

事件类型是一个字符串，表示发生了什么事件。例如，“mousemove” 表示用户移动了鼠标，“keydown” 表示用户按下了键盘上的某个键，而 “load” 表示文档（或其他资源）已经通过网络加载完成。因为事件类型是字符串，所以有时也称它为事件名称，我们确实要使用这个名称来谈论某种事件。

## 事件目标

事件目标是一个对象，而事件就发生在该对象上或者事件与该对象有关。说到某个事件，必须明确它的类型和目标。比如，Window 对象上发生了加载（load）事件，或者一个 `<button>` 元素上发生了点击（click）事件。Window、Document 和 Element 对象是客户端 JavaScript 应用中最常见的事件目标，不过也有一些事件会在其他对象上发生。例如，Worker 对象（15.13 节介绍的一种线程）是 “message” 事件的目标，这种事件在工作线程向主线程发消息时发生。

## 事件处理程序或事件监听器

事件处理程序或事件监听器是一个函数，负责处理或响应事件注 2。应用通过浏览器注册自己的事件处理程序，指定事件类型和事件目标。当事件目标上发生指定类型的事件时，浏览器会调用这个处理程序。当事件处理程序在某个对象上被调用时，我们说浏览器 “触发”“派发” 或 “分派” 了该事件。注册事件处理程序有不同的方式，15.2.2 节和 15.2.3 节将具体介绍处理程序的注册和调用。

## 事件对象

事件对象是与特定事件关联的对象，包含有关该事件的细节。事件对象作为事件处理程序的参数传入。所有事件对象都有 `type` 和 `target` 属性，分别表示事件类型和事件目标。每种事件类型都为相关的事件对象定义了一组属性。比如，与鼠标事件相关的事件对象包含鼠标指针的坐标，与键盘事件相关的事件对象包含与被按下的键以及按住不放的修饰键的信息。很多事件类型只定义几个标准属性（包括 `type` 和 `target`），并没有其他有用信息。对这些事件，重要的是它们发生了，而不是事件的细节。

## 事件传播

事件传播是一个过程，浏览器会决定在这个过程中哪些对象触发事件处理程序。对于 Window 对象上的 “load” 或 Worker 对象上的 “message” 等特定于一个对象的事件，不需要传播。但对于发生在 HTML 文档中的某些事件，则会 “冒泡”(bubble) 到文档根元素。如果用户在一个超链接上移动鼠标，这个鼠标事件首先会在定义该超链接的 `<a>` 元素上触发，然后在包含元素上触发，可能经过一个 `<p>` 元素、一个 `<section>` 元素，然后到达文档对象本身。有时，只给文档或包含元素注册一个事件处理程序，比给你关心的每个元素都分别注册一个处理程序更方便。事件处理程序可以阻止事件传播，从而让事件不再冒泡，也就不会在包含元素上触发发事件处理程序。为此，事件处理程序需要调用事件对象上的一个方法。另外一种事件传播形式，即事件捕获（event capturing）（或捕捉）事件，事件冒泡和捕获将在 15.2.4 节详细介绍。

有些事件有与之关联的默认动作（default action）。比如，单击一个超链接，默认动作是让浏览器跟随链接，加载一个新页面。事件处理程序可以通过调用事件对象的一个方法来阻止这个默认动作。对此，我们有时也称为 “取消” 事件，将在 15.2.5 节介绍。

## 15.2.1 事件类别

客户端 JavaScript 支持的事件类型非常多，本章不可能全部介绍。不过，可以将这些事件分成通用的类别，从而了解它们的范围和差异。

### 设备相关输入事件

这类事件直接与特定输入设备（例如鼠标或键盘）相关。这类事件类型包括 “mousedown”“mousemove”“mouseup”“touchstart”“touchmove”“touchend”“keydown”“keyup”，等等。

### 设备无关输入事件

这类输入事件并不与特定输入设备直接相关。比如，“click” 事件表示一个链接或按钮（或其他文档元素）已经被激活。一般来说，这个事件是通过鼠标触发的，但也可能是通过键盘触发（在触屏设备上）通过轻击触发的。而 “input” 事件是对 “keydown” 事件的设备无关的替代，既支持键盘输入，也支持剪切粘贴和表意文字的输入法。“pointerdown”“pointermove” 和 “pointerup” 事件是对鼠标和触摸事件的设备无关的替代。它们既适用于鼠标类型的指针，也适用于触屏，以及手写笔输入。

### 用户界面事件

UI 事件是高级事件，通常在定义应用界面的 HTML 表单元素上触发。这类事件包括 “focus”（当文本输入字段获得键盘焦点时）、“change”（当用户修改了表单元素显示的值时）和 “submit”（当用户单击表单中的 “提交” 按钮时）。

### 状态变化事件

有些事件并不直接由用户活动触发，而是由网络或浏览器活动触发。这类事件表示某种生命周期或状态相关的变化。其中，分别由 Window 和 Document 对象在文档加载结束时触发的 “load” 和 “DOMContentLoaded” 事件可能是这类事件中最常用的两个事件（参见 15.1.5 节）。浏览器会在网络连接变化时在 Window 对象上触发 “online” 和 “offline” 事件。浏览器的历史管理机制（见 15.10.4 节）会触发 “popstate” 事件作为对浏览器 “后退” 按钮的回应。

### API 特定事件

有一些 HTML 及相关规范定义的 Web API 包含自己的事件类型。HTML 的 `<video>` 和 `<audio>` 元素定义了一系列事件，比如 “waiting”“playing”“seeking”“volumechange”，等等。可以使用这些事件自定义媒体播放。一般来说，在 JavaScript 支持期约以前定义的异步 Web 平台 API 都是事件驱动的，会定义 API 特定事件。比如，IndexedDB API（见 15.12.3 节）在数据库请求成功和失败时分别触发 “success” 和 “error” 事件。虽然用于发送 HTTP 请求的 `fetch()` API（见 15.11.1 节）是基于期约的，但它取代的 `XMLHttpRequest` API 则定义了一些 API 特定事件。

## 15.2.2 注册事件处理程序

有两种注册事件处理程序的方式。第一种是 Web 早期就有的，即设置作为事件目标的对象或文档元素的一个属性。第二种（更新也更通用）是把处理程序传给这个对象或元素的 `addEventListener()` 方法。

### 设置事件处理程序属性：JavaScript

注册事件处理程序最简单的方式就是把事件目标的一个属性设置为关联的事件处理程序函数。按照惯例，事件处理程序属性的名字都由 “on” 和事件名称组成，比如：`onclick`、`onchange`、`onload`、`onmouseover`，等等。注意，这些属性名是区分大小写的，必须全部小写。另外，即便事件类型包含多个单词（如 “mousedown”）。以下代码包含两个以这种方式注册事件处理程序的地方：

```javascript
// 设置 Window 对象的 onload 属性为一个函数
// 这个函数是事件处理程序：它会在文档加载完成时被调用
window.onload = function() {
  // 查找一个 <form> 元素
  let form = document.querySelector("form#shipping");
  // 在这个表单上注册一个事件处理程序，在表单被提交之前
  // 会调用这个函数。假设其他地方已经定义了 isFormValid()
  form.onsubmit = function(event) { // 当用户提交表单时
    if (!isFormValid(this)) { // 检查表单是否有效
      event.preventDefault(); // 若无效，则阻止提交
    }
  };
};
```

使用事件处理程序属性有一个缺点，即这种方式假设事件目标对每种事件最多只有一个处理程序。一般来说，使用 `addEventListener()` 注册事件处理程序更好，因为该技术不会重写之前注册的处理程序。

### 设置事件处理程序属性：HTML

文档元素的事件处理程序属性来定义（在 JavaScript 中注册在 Window 元素上的处理程序在 HTML 中可以定义为 `<body>` 标签的属性）。现代 Web 开发中通常不提倡使用这种技术，但它是可能的。之所以在这里记述下来，是因为你仍然有可能在已有代码中看到它们。

在使用 HTML 属性定义事件处理程序时，属性的值应该是一段 JavaScript 代码字符串，这段代码应该是事件处理程序函数的函数体，不是完整的函数声明。换句话说，HTML 事件处理程序的代码应该没有外围的大括号，前面也没有 `function` 关键字。例如：

```html
<button onclick='console.log("Thank you.");'>Please Click</button>
```

如果一个 HTML 事件处理程序属性包含多条 JavaScript 语句，则必须用分号分隔这些语句，或者用回车把这个属性值分成多行。

在给 HTML 事件处理程序属性指定 JavaScript 代码字符串时，浏览器会把这个字符串转换为一个函数，这个函数类似如下所示：

```javascript
function(event) {
    with(document) {
        with(this.form || {}) {
            with(this) {
                /* 你的代码在这里 */
            }
        }
    }
}
```

这个 `event` 参数意味着你的处理程序代码可以通过它引用当前的事件对象。而 `with` 语句意味着你的处理程序可以直接引用目标对象、外层 `<form>`（如果有），乃至 Document 对象的属性，就像它们都是作用域内的变量一样。严格模式下（见 5.6.3 节）是禁止使用 `with` 语句的，但 HTML 属性中的 JavaScript 代码没有严格这一说。这样定义的事件处理程序将在一个可能存在意外变量的环境中执行，因此可能是一些讨厌的 bug 的来源，也是避免在 HTML 中编写事件处理程序的一个充分理由。

### addEventListener()

任何可以作为事件目标的对象（包括 Window 和 Document 对象以及所有文档元素），都定义了一个名为 `addEventListener()` 的方法，可以使用它来注册目标为调用对象的事件处理程序。`addEventListener()` 接收 3 个参数。第一个参数是注册处理程序的事件类型。事件类型（或名称）是一个字符串，不包含作为 HTML 元素属性使用时的前缀 “on”。第二个参数是指定类型的事件发生时调用的函数。第三个参数是可选的，下面会介绍。

以下代码在一个 `<button>` 元素上为 “click” 事件注册了两个事件处理程序。注意这里使用的两种技术的差异：

```html
<button id="mybutton">Click me</button>
<script>
let b = document.querySelector("#mybutton");
b.onclick = function() { console.log("Thanks for clicking me!"); };
b.addEventListener("click", () => { console.log("Thanks again!"); });
</script>
```

以 “click” 作为第一参数调用 `addEventListener()` 不会影响 `onclick` 属性的值。在这段代码中，单击一次按钮会在开发者控制台打印两条消息。如果我们先调用 `addEventListener()`，然后设置 `onclick`，那么仍然会看到两条消息，只是顺序相反。更重要的是，可以多次调用 `addEventListener()` 在同一个对象上为同一事件类型注册多个处理程序。当对象上发生该事件时，所有为这个事件而注册的处理程序都会按照注册它们的顺序被调用。在同一个对象上以相同的参数多次调用 `addEventListener()` 没有作用，同一个处理程序只能注册一次，重复调用不会改变处理程序被调用的顺序。

与 `addEventListener()` 对应的是 `removeEventListener()` 方法，它们的前两个参数是一样的（第三个参数也是可选的），只不过是用来从同一个对象上移除而不是添加事件处理程序。有时，临时注册一个事件处理程序，然后很快移除它是很有用的。比如，在 “mousedown” 事件发生时，可以为 “mousemove” 和 “mouseup” 事件注册临时事件处理程序，以便知道用户是否拖动鼠标。然后，在 “mouseup” 事件发生时移除这两个处理程序。此时，移除处理程序的代码大致如下：

```javascript
document.removeEventListener("mousemove", handleMouseMove);
document.removeEventListener("mouseup", handleMouseUp);
```

`addEventListener()` 可选的第三个参数是一个布尔值或对象。如果传入 `true`，函数就会被注册为**捕获事件处理程序**，从而在事件派发的另一个阶段调用它，15.2.4 节将介绍事件捕获。如果在注册事件监听器时给第三个参数传了 `true`，那么要移除该事件处理程序，必须在调用 `removeEventListener()` 时也传入 `true` 作为第三个参数。

注册捕获事件处理程序只是 `addEventListener()` 支持的 3 个选项之一。如果传入其他选项，可以给第三个参数传一个对象，显式指定这些选项：

```javascript
document.addEventListener('click', handleClick, {
    capture: true,
    once: true,
    passive: true
});
```

如果这个 Options（选项）对象的 `capture` 属性为 `true`，那么函数就会被注册为捕获处理程序。如果这个属性为 false 或省略该属性，那么处理程序就不会注册到捕获阶段。

如果选项对象有 once 属性且值为 true，那么事件监听器在被触发一次后会自动移除。如果这个属性为 false 或省略该属性，那么处理程序永远不会被自动移除。

如果选项对象有 passive 属性且值为 true，则表示事件处理程序永远不调用 preventDefault ()（取消默认动作（参见 15.2.5 节）。这对于移动设备上的触摸事件特别重要。如果 “touchmove” 事件可以阻止浏览器的默认滚动动作，那浏览器就不能实现平滑滚动。passive 属性提供了一种机制，即在注册一个可能存在破坏性操作的事件处理程序时，让浏览器知道可以在事件处理程序运行的同时安全地开始其默认行为（如滚动）。平滑滚动对保证良好的用户体验非常重要，因此 Firefox 和 Chrome 都默认把 “touchmove” 和 “mousewheel” 事件设置为 “被动式”（passive: true）。如果确实想为这两个事件注册一个会调用 preventDefault () 的事件处理程序，应该显式地将 passive 属性设置为 false。

可以把选项对象传给 removeEventListener ()，但其中只有 capture 属性才是有用的，换句话说，移除监听器时不需要指定 once 或 passive，指定了也会被忽略。

## 15.2.3 调用事件处理程序

注册事件处理程序后，浏览器会在指定对象发生指定事件时自动调用它。本节介绍调用事件处理程序的细节，解释事件处理程序的参数、调用上下文（this 值）和事件处理程序返回值的含义。

### 事件处理程序的参数

事件处理程序被调用时会接收到一个 Event 对象作为唯一的参数。这个 Event 对象的属性提供了事件的详细信息。

#### type

​	发生事件的类型。

#### target

​	发生事件的对象。

#### currentTarget

​	对于传播的事件，这个属性是注册当前事件处理程序的对象。

#### timeStamp

​	表示事件发生时间的时间戳（毫秒），不是绝对时间。可以用第二个事件的时间戳减去第一个事件的时间戳来计算两个事件相隔多长时间。

#### isTrusted

​	如果事件由浏览器自身派发，这个属性为 true；如果事件由 JavaScript 代码派发，这个属性为 false。

### 事件处理程序的上下文

在通过设置属性注册事件处理程序时，看起来就像为目标对象定义了一个新方法：

```javascript
target.onclick = function() { /* 处理程序的代码 */ };
```

因此，没有意外，这个事件处理程序将作为它所在对象的方法被调用。换句话说，在事件处理程序的函数体中，this 关键字引用的是注册事件处理程序的对象。

即便使用 addEventListener () 注册，处理程序在被调用时也会以目标作为其 this 值。不过，这不适用于箭头函数形式的处理程序。箭头函数中 this 的值始终等于定义它的作用域的 this 值。

### 处理程序的返回值

在现代 JavaScript 中，事件处理程序不应该返回值。在比较老的代码中，我们还可以看到返回值的事件处理程序，而且返回的值通常用于告诉浏览器不要执行与事件相关的默认动作。比如，如果一个表单 Submit 按钮的 onclick 处理程序返回 false，浏览器将不会提交表单（通常因为事件处理程序确定用户输入未能通过客户端验证）。

阻止浏览器执行默认动作的标准且推荐的方式，是调用 Event 对象的 preventDefault () 方法（参见 15.2.5 节）。

### 调用顺序

一个事件目标可能会为一种事件注册多个处理程序。当这种事件发生时，浏览器会按照注册处理程序的顺序调用它们。有意思的是，即便混合使用 addEventListener () 注册的事件处理程序和在对象属性 onclick 上注册的事件处理程序，结果仍然如此。

## 15.2.4 事件传播

如果事件的目标是 Window 或其他独立对象，浏览器对这个事件的响应就是简单地调用该对象上对应的事件处理程序。如果事件目标是 Document 或其他文档元素，就没有那么简单了。

注册在目标元素上的事件处理程序被调用后，多数事件都会沿 DOM 树向上 “冒泡”。目标父元素的事件处理程序会被调用。然后注册在目标祖父元素上的事件处理程序会被调用。就这样一直向上到 Document 对象，然后到 Window 对象。由于事件冒泡，我们可以不用给个别文档元素注册很多事件处理程序，而是只在它们的公共祖先元素上注册一个事件处理程序，然后在其中处理事件。比如，可以在 `<form>` 元素上注册一个 “change” 事件处理程序，而不是在表单的每个元素上都注册一个 “change” 事件处理程序。

多数在文档元素上发生的事件都会冒泡。明显的例外是 “focus”“blur” 和 “scroll” 事件。文档元素的 “load” 事件冒泡，但到 Document 对象就会停止冒泡，不会传播到 Window 对象（Window 对象的 “load” 事件处理程序只会在整个文档加载完毕后才被触发）。

事件冒泡是事件传播的第三个 “阶段”。调用目标对象本身的事件处理程序是第二个阶段。第一阶段，也就是在目标处理程序被调用之前的阶段，叫作 “捕获” 阶段。还记得 `addEventListener()` 接收的第三个可选参数吧。如果这个参数是 `true` 或 `{capture: true}`，那么就表明该事件处理程序会注册为捕获事件处理程序，将在事件传播的第一阶段被调用。事件传播的捕获阶段差不多与冒泡阶段正好相反。最先调用的是 Window 对象上注册的捕获处理程序，然后才调用 Document 对象的捕获处理程序，接着才是 `<body>` 元素。然后沿 DOM 树一直向下，直到事件目标父元素的捕获事件处理程序被调用。注册在事件目标本身的捕获事件处理程序不会在这个阶段被调用。

事件捕获提供了把事件发送到目标之前先行处理的机会。捕获事件处理程序可用于调试，或者使用下一节介绍的事件取消技术过滤事件，让目标事件处理程序永远不会被调用。事件捕获最常见的用途是处理鼠标拖动，因为鼠标运动事件需要被拖动的对象来处理，而不是让位于其上的文档元素来处理。

## 15.2.5 事件取消

浏览器对很多用户事件都会作出响应，无论你是否在代码中指定。比如，用户在一个链接上单击鼠标，浏览器就会跟随该链接。如果一个 HTML 文本输入元素获得了键盘焦点，而且用户按了某个键，浏览器就会打出用户的输入。如果用户在触摸屏上滑动手指，浏览器就会滚动。如果你为这些事件注册了事件处理程序，那么就可以阻止浏览器执行其默认动作。为此要调用事件对象的 `preventDefault()` 方法（除非你注册处理程序时传入了 `passive` 选项，该选项会导致 `preventDefault()` 无效）。

取消与事件关联的默认动作只是事件取消的一种情况。除此之外，还可以调用事件对象的 `stopPropagation()` 方法，取消事件传播。如果同一对象上也注册了其他处理程序， 则这些处理程序仍然会被调用。但是，在这个对象上调用 `stopPropagation()` 方法之后，其他对象上的事件处理程序都不会再被调用。`stopPropagation()` 可以在捕获阶段、在事件目标本身，以及在冒泡阶段起作用。`stopImmediatePropagation()` 与 `stopPropagation()` 类似，只不过它也会阻止在同一个对象上注册的后续事件处理程序的执行。

## 15.2.6 派发自定义事件

客户端 JavaScript 事件 API 相对比较强大，可以使用它定义和派发自己的事件。比如，假设你的程序需要周期性地执行耗时计算或者发送网络请求，而在执行此操作期间，不能执行其他操作。你想在此时显示一个转轮图标，告诉用户应用程序正忙。但忙碌的模块不需要知道应该在哪里显示转轮图标，它只需要派发一个事件，宣布自己正忙，然后在自己不忙的时候再派发另一个事件即可。UI 模块可以为这两个事件注册处理程序，然后以适当的方式在 UI 上告知用户即可。

如果一个 JavaScript 对象有 `addEventListener()` 方法，那它就是一个 “事件目标”。这意味着该对象也有一个 `dispatchEvent()` 方法。可以通过 `CustomEvent()` 构造函数创建自定义事件对象，然后再把它传给 `dispatchEvent()`。`CustomEvent()` 的第一个参数是一个字符串，表示事件类型；第二个参数是一个对象，用于指定事件对象的属性。可以将这个对象的 `detail` 属性设置为一个字符串、对象或其他值，表示事件的上下文。如果你想在一个文档元素上派发自己的事件，并希望它沿文档树向上冒泡，则要在第二个参数中添加 `bubbles: true`。下面看一个例子：

```javascript
// 派发一个自定义事件，通知 UI 自己正忙
document.dispatchEvent(new CustomEvent("busy", { detail: true }));

// 执行网络操作
fetch(url)
  .then(handleNetworkResponse)
  .catch(handleNetworkError)
  .finally(() => {
    // 无论网络请求成功还是失败，都再派发
    // 一个事件，通知 UI 自己现在已经不忙了
    document.dispatchEvent(new CustomEvent("busy", { detail: false }));
  });

// 在代码其他地方为 "busy" 事件注册一个处理程序，
// 并通过它显示或隐藏转轮图标，告知用户忙与闲
document.addEventListener("busy", (e) => {
  if (e.detail) {
    showSpinner();
  } else {
    hideSpinner();
  }
});
```

# 15.3 操作 DOM

客户端 JavaScript 存在的目的就是把静态 HTML 文档转换为交互式 Web 应用。因此通过脚本操作网页内容无疑是 JavaScript 的核心目标。

每个 Window 对象都有一个 document 属性，引用一个 Document 对象。这个 Document 对象代表窗口的内容，也是本节的主题。不过，Document 对象并不是孤立存在的，它是 DOM 中表示和操作文档内容的核心对象。

15.1.2 节介绍了 DOM。本节详细讲解 DOM API，包括以下内容：

- 如何查询或选择文档中特定的元素。
- 如何遍历文档，如何查找任何文档元素的祖先、同辈和后代。
- 如何查询和设置文档元素的属性。
- 如何查询、设置和修改文档的内容。
- 如何修改文档的结构，包括创建、插入和删除节点。

## 15.3.1 选择 Document 元素

客户端 JavaScript 程序经常需要操作文档中的一个或多个元素。全局 document 属性引用 Document 对象，而 Document 对象有 head 和 body 属性，分别引用 `<head>` 和 `<body>` 标签对应的 Element 对象。但一个程序要想操作文档中嵌入层级更多的元素，必须先通过某种方式获取或选择表示该元素的 Element 对象。

### 通过 CSS 选择符选择元素

CSS 样式表有一个非常强大的语法，就是它的选择符（selector）。选择符用来描述文档中元素或元素的集合。DOM 方法 querySelector () 和 querySelectorAll () 让我们能够在文档中找到与指定选择符匹配的元素。在介绍这两个方法前，我们先来简单讲解一下 CSS 选择符语法。

CSS 选择符通过标签名、标签 id 属性的值或标签 class 属性中的词来描述元素：

```css
div        /* 任意 <div> 元素 */
#nav       /* id="nav" 的元素 */
.warning   /* class 属性中包含 "warning" 的元素 */
```

字符 `#` 用于根据 id 属性匹配，字符 `.` 用于根据 class 属性匹配。此外，也可以根据更通用的属性值来选择元素：

```css
p[lang="fr"]  /* 法语写的段落：<p lang="fr"> */
*[name="x"]   /* 任何有 name="x" 属性的元素 */
```

注意这两个例子组合了标签名选择符（或标签名通配符 `*`）与属性选择符。还可以使用更复杂的组合：

```css
span.fatal.error    /* class 属性中包含 "fatal" 和 "error" 的任何 <span> 元素 */
span[lang="fr"].warning  /* class 属性中包含 "warning" 的法语 <span> 元素 */
```

选择符也可以指明文档结构：

```css
#log span        /* id="log" 的元素的后代中的 <span> 元素 */
#log>span        /* id="log" 的元素的子元素中的 <span> 元素 */
body>h1:first-child  /* <body> 的子元素中的第一个 <h1> */
img + p.caption   /* 紧跟 <img> 的 class 属性中包含 "caption" 的 <p> */
h2 ~ p        /* <h2> 后面所有同辈元素中的 <p> */
```

如果两个选择符被一个逗号隔开，则意味着要选择匹配其中任一选择符的元素：

```css
button, input[type="button"]  /* 所有 <button>，以及所有 <input type="button"> */
```

也就是说，CSS 选择符可以通过元素类型（标签）、ID、类名、属性，以及元素在文档中的位置来引用元素。querySelector () 方法接收一个 CSS 选择符字符串作为参数，返回它在文档中找到的第一个匹配的元素；如果没有找到，则返回 null：

```javascript
// 查找文档中所有 HTML 标签包含属性 id="spinner" 的元素
let spinner = document.querySelector("#spinner");
```

querySelectorAll () 也类似，只不过返回文档中所有的匹配元素，而不是只返回第一个：

```javascript
// 查找所有 <h1>、<h2> 和 <h3> 标签的 Element 对象
let titles = document.querySelectorAll("h1, h2, h3");
```

querySelectorAll () 的返回值不是 Element 对象的数组，而是一个类似数组的 NodeList 对象。NodeList 对象有一个 length 属性，可以像数组一样通过索引访问，因此可以使用传统的 for 循环遍历。NodeList 也是可迭代对象，因此也可以在 for/of 循环中使用它们。如果想把 NodeList 转换为真正的数组，只要把它传给 Array.from () 即可。

如果文档中没有与指定选择符匹配的元素，则 querySelectorAll () 返回的 NodeList 的 length 属性为 0。

Element 类和 Document 类都实现了 querySelector () 和 querySelectorAll ()。当在元素上调用时，这两个方法只返回该元素后代中的元素。

我们知道，CSS 也定义了 ::first-line 和 ::first-letter 的元素。在 CSS 中，它们只匹配文本节点的一部分，而不匹配实际的元素。在 querySelector () 或 querySelectorAll () 中使用它们什么也找不到。而且，很多浏览器也拒绝对 :link 和 :visited 伪类返回匹配结果，因为这有可能暴露用户的浏览历史。

还有一个基于 CSS 的元素选择方法：closest ()。这个方法是 Element 类定义的，以一个选择符作为唯一参数。如果选择符匹配那个调用它的元素，则返回该元素；否则，就返回与选择符匹配的最近祖先元素；如果没有匹配，则返回 null。某种意义上看，`closest()` 是 `querySelector()` 的逆向操作：`closest()` 从当前元素开始，沿 DOM 树向上匹配；而 `querySelector()` 则从当前元素开始，沿 DOM 树向下匹配。如果你在文档树中某个高层级注册了事件处理程序，`closest()` 通常能派上用场。比如，在处理一个单击事件时，你可能想知道该事件是否发生在一个超链接上。事件对象会告诉你事件目标，但该目标也许是超链接的文本而非 `<a>` 标签本身。为此，可以让事件处理程序像这样查找最近的超链接：

```js
// 查找有 href 属性的最近的外围 <a> 标签
let hyperlink = event.target.closest("a[href]");
```

下面是使用 `closest()` 的另一个例子：

```javascript
// 如果 e 被包含在一个 HTML 列表元素内则返回 true
function insideList(e) {
  return e.closest('ul,ol,dl') !== null;
}
```

另一个相关的方法 `matches()` 既不返回祖先，也不返回后代，只会检查元素是否与选择符匹配。如果匹配，返回 `true`；否则，返回 `false`：

```js
// 如果 e 是一个 HTML 标题元素则返回 true
function isHeading(e) {
  return e.matches('h1,h2,h3,h4,h5,h6');
}
```

### 其他选择元素的方法

除了 `querySelector()` 和 `querySelectorAll()`，DOM 也定义了一些老式的元素选择方法。如今，这些方法多多少少已经被废弃了。不过，实际开发中仍然可能会用到其中某些方法（特别是 `getElementById()`）：

```js
// 通过 id 属性查找元素。参数就是 id 属性的值，不包含 CSS 选择符前缀 #
// 类似于 document.querySelector("#sect1")
let sect1 = document.getElementById('sect1');

// 查找具有 name="color" 属性的所有元素（如表单的复选框）
// 类似于 document.querySelectorAll('[name="color"]')
let colors = document.getElementsByName('color');

// 查找文档中所有的 <h1> 元素
// 类似于 document.querySelectorAll('h1')
let headings = document.getElementsByTagName('h1');

// getElementsByTagName() 在 Element 对象上也有定义
// 取得 sect1 的后代中的所有 <h2> 元素
let subheads = sect1.getElementsByTagName('h2');

// 查找所有类名中包含 "tooltip" 的元素
// 类似于 document.querySelectorAll('.tooltip')
let tooltips = document.getElementsByClassName('tooltip');

// 查找 sect1 的后代中所有类名包含 "sidebar" 的元素
// 类似于 sect1.querySelectorAll('.sidebar')
let sidebars = sect1.getElementsByClassName('sidebar');
```

与 `querySelectorAll()` 类似，上面代码中的方法也返回 `NodeList`（除了 `getElementById()`，它返回一个 `Element` 对象）。但是，与 `querySelectorAll()` 不同的是，这些老式选择方法返回的 `NodeList` 是 “活的”。所谓 “活的”，指的是这些 `NodeList` 的 `length` 属性和其中包含的元素会随着文档内容或结构的变化而变化。

### 预选择的元素

由于历史原因，`Document` 类定义了一些快捷属性，可以通过它们直接访问某种节点。例如，通过 `images`、`forms` 和 `links` 属性可以直接访问文档中的 `<img>`、`<form>` 和 `<a>` 元素（但只有 `<a>` 标签有 `href` 属性）。这些属性引用的是 `HTMLCollection` 对象，与 `NodeList` 对象非常相似，只是还可以通过元素 ID 或名字来索引其中的元素。例如，使用 `document.forms` 属性，可以像下面这样访问 `<form id="address">` 标签：

```js
document.forms.address;
```

还有一个更古老的选择元素的 API，即 `document.all` 属性。这个属性引用的对象类似于 `HTMLCollection`，包含文档中的所有元素。`document.all` 已经被废弃，因此实际开发中不应该再使用了。

## 15.3.2 文档结构与遍历

从 `Document` 中选择一个 `Element` 之后，常常还需要查找文档结构中相关的部分（父亲、同辈、孩子）。如果我们只关心文档中的 `Element` 而非其中的文本（以及元素间的空白，其实也是文本），有一个遍历 API 可以让我们把文档作为一棵 `Element` 对象树，树中不包含同样属于文档的 `Text` 节点。这个遍历 API 不涉及任何方法，而只是 `Element` 对象上的一组属性。使用这些属性可以引用当前元素的父亲、孩子和同辈：

### parent Element

​	这个属性引用元素的父节点，也就是另一个 `Element` 对象或 `null`。

### children

​	这个属性是 `NodeList`，包含元素的所有子元素，不含非 `Element` 节点，如 `Text` 节点（也不含 `Comment` 节点）。

### childElementCount

​	这个属性是元素所有子元素的个数。与`children.length`返回的值相同。

### firstElementChild、lastElementChild

​	这两个属性分别引用元素的第一个子元素和最后一个子元素。如果没有子元素，它们的值为`null`。

### previousElementSibling、nextElementSibling

​	这两个属性分别引用元素左侧紧邻的同辈元素和右侧紧邻的同辈元素，如果没有相应的同辈元素则为`null`。

使用这些 `Element` 属性，可以用下面任意一个表达式引用 `Document` 第一个子元素的第二个子元素：

```javascript
document.children[0].children[1]
document.firstElementChild.firstElementChild.nextElementSibling
```

在标准 HTML 文档中，这两个表达式引用的都是文档的 `<body>` 标签。

下面这两个函数演示了如何使用这些属性对文档执行深度优先的遍历，并对文档的每个元素都调用一次指定的函数：

```javascript
// 递归遍历 Document 或 Element e
// 在 e 和每个后代元素上调用函数 f
function traverse(e, f) {
    f(e);                          // 在 e 上调用 f()
    for(let child of e.children) { // 迭代所有孩子
        traverse(child, f);        // 每个孩子递归
    }
}

function traverse2(e, f) {
    f(e);                          // 在 e 上调用 f()
    let child = e.firstElementChild; // 链表式迭代孩子
    while(child != null) {
        traverse2(child, f);        // 在这里递归
        child = child.nextElementSibling;
    }
}
```

### 作为节点树的文档

如果在遍历文档或文档中的某些部分时不想忽略 `Text` 节点，可以使用另一组在所有 `Node` 对象上都有定义的属性。通过这些属性可以看到 `Element`、`Text` 节点，甚至 `Comment` 节点（表示文档中的 HTML 注释）。

所有 `Node` 对象都定义了以下属性：

#### parentNode

​	当前节点的父节点。对于没有父节点的节点或 `Document` 对象则为`null`。

#### childNodes

​	只读的 `NodeList` 对象，包含节点的所有子节点（不仅仅是 `Element` 子节点）。

#### firstChild、lastChild

​	当前节点的第一个子节点和最后一个子节点，如果没有子节点则为`null`。

#### previousSibling、nextSibling

​	当前节点的前一个同辈节点和后一个同辈节点。这两个属性通过双向链表连接节点。

#### nodeType

​	表示当前节点类型的数值。`Document` 节点的值为 9，`Element` 节点的值为 1，`Text` 节点的值为 3，`Comment` 节点的值为 8。

#### nodeValue

​	`Text` 或 `Comment` 节点的文本内容。

#### nodeName

​	`Element` 节点的 HTML 标签名，会转换为全部大写。

使用这些 `Node` 属性，可以用下面任意一个表达式引用 `Document` 第一个子节点的第二个子节点：

```javascript
document.childNodes[0].childNodes[1]
document.firstChild.firstChild.nextSibling
```

假设这个示例中的文档对应如下 HTML：

```html
<html><head><title>Test</title></head><body>Hello world!</body></html>
```

则第一个子节点的第二个子节点是 `<body>` 元素，它的 `nodeType` 是 1，`nodeName` 是 “BODY”。

不过要注意，这套 API 对于文档中文本的变化极为敏感，如果在上例文档的 `<html>` 和 `<head>` 之间插入一个换行符，则表示该换行符的 `Text` 节点就会成为第一个子节点的第一个子节点，而第二个子节点就变成 `<head>` 元素而不是 `<body>` 元素。

为理解这套基于 `Node` 的遍历 API，可以看看下面这个返回元素或文档中所有文本的函数：

```javascript
// 返回元素 e 的纯文本内容，递归包含子元素
// 这个方法类似元素的 textContent 属性
function textContent(e) {
    let s = "";                 // 在这里累积文本
    for(let child = e.firstChild; child !== null; child = child.nextSibling) {
        let type = child.nodeType;
        if (type === 3) {      // 如果是 Text 节点
            s += child.nodeValue;  // 把文本内容追加到字符串
        } else if (type === 1) {   // 而如果是 Element 节点
            s += textContent(child); // 则递归
        }
    }
    return s;
}
```

这个函数仅仅是为演示而写的，实践中可以直接通过`e.textContent`取得元素`e`的文本内容。

## 15.3.3 属性

HTML 元素由标签名和一组称为属性的名 / 值对构成。比如，`<a>`元素定义一个超链接，使用其`href`属性的值作为链接的目标。

`Element`类定义了通用的`getAttribute()`、`setAttribute()`、`hasAttribute()`和`removeAttribute()`方法，用于查询、设置、检测和删除元素的属性。但 HTML 元素的属性（指所有标准 HTML 元素的标准属性）同时也在表示这些元素的`HTMLElement`对象上具有相应的属性。而作为 JavaScript 属性来存取它们，通常要比调用`getAttribute()`及其他方法来更便捷。

### 作为元素属性的 HTML 属性

表示 HTML 文档中元素的`Element`对象通常会定义读 / 写属性，镜像该元素的 HTML 属性。`HTMLElement`为通用 HTML 属性（如`id`、`title`、`lang`和`dir`）和事件处理程序属性（如`onclick`）定义了属性。特定的`Element`子类型则定义了特定于相应元素的属性。例如，要查询图片的 URL，可以使用表示`<img>`元素的`HTMLImageElement`的`src`属性：

```javascript
let image = document.querySelector("#main_image");
let url = image.src;      // src 属性是图片的 URL
image.id === "main_image" // => true: 我们通过 id 找到了图片
```

类似地，可以使用如下代码设置`<form>`元素的表单提交属性：

```javascript
let f = document.querySelector("form");  // 文档中的第一个 form
f.action = "https://www.example.com/submit"; // 设置要提交的哪个 URL
f.method = "POST";           
```

对于某些元素（比如`<input>`），有的 HTML 属性名会映射到不同的 JavaScript 属性。比如，`<input>`元素在 HTML 中的`value`属性是由 JavaScript 的`defaultValue`属性镜像的。JavaScript 的`value`属性包含的是用户当前在`<input>`元素中输入的值。但是修改这个`value`属性，既不会影响 JavaScript 的`defaultValue`属性，也不会影响 HTML 的`value`属性。

HTML 属性是不区分大小写的，但 JavaScript 属性名区分大小写。要把 HTML 属性转换为 JavaScript 属性，全部小写即可。如果 HTML 属性包含多个单词，则从第二个单词开始，每个单词的首字母都大写。比如，`defaultChecked`和`tabIndex`。不过，事件处理程序属性是例外，比如`onclick`，需要全部小写。

有些 HTML 属性名是 JavaScript 中的保留字。对于这些属性，通用规则是对应的 JavaScript 属性包含前缀 “`html`”。比如，`<label>`元素在 HTML 中的`for`属性，变成了 JavaScript 的`htmlFor`属性。“`class`” 也是 JavaScript 的保留字。但这个非常重要的 HTML `class`属性是个例外，它在 JavaScript 代码中会变成`className`。

JavaScript 中表示 HTML 属性的这些属性通常都是字符串值。但是当 HTML 属性是布尔值或数值值时（如`<input>`元素的`defaultChecked`和`maxLength`属性），相应的 JavaScript 属性则是布尔值或数值，不是字符串。事件处理程序属性的值则始终是函数（或`null`）。

注意，这个基于属性的 API 只能获取和设置 HTML 中对应的属性值，并没有定义从元素中删除属性的方式。特别地，不能用`delete`操作符来删除 HTML 属性。如果真想删除 HTML 属性，可以在 JavaScript 中调用`removeAttribute()`方法。

### class 属性

HTML 元素的`class`属性特别重要。它的值是空格分隔的 CSS 类名的列表，用于给元素应用 CSS 样式。由于`class`在 JavaScript 中是保留字，所以这个 HTML 属性是通过`Element`对象上的`className`属性反映出来的。`className`属性可用于设置或返回 HTML 中`class`属性的字符串值。但`class`属性这个名字并不恰当，因为它的值是一个 CSS 类名的列表。在这个列表中添加或删除某个类名（而不是把列表作为整个字符串来操作）在客户端 JavaScript 编程中非常常见。

为此，Element 对象定义了 `classList` 属性，支持将 `class` 属性作为一个列表来操作。`classList` 属性的值是一个可迭代的类数组对象。虽然这个属性的名字叫 `classList`，但它的行为更像类名的集合，而且定义了 `add()`、`remove()`、`contains()` 和 `toggle()` 方法：

```javascript
// 在想让用户知道现在正忙的时候，就显示一个
// 转轮图标。为此必须删除 hidden 类，添加
// animated 类（假设样式表有正确的配置）
let spinner = document.querySelector("#spinner");
spinner.classList.remove("hidden");
spinner.classList.add("animated");
```

### dataset 属性

有时候在 HTML 元素上附加一些信息很有用，因为 JavaScript 代码在选择并操作相应的元素时可以使用这些信息。在 HTML 中，任何以前缀 “data-” 开头的小写属性都被认为是有效的，可以将它们用于任何目的。这些 “数据集”（dataset）属性不影响它们所在元素的展示，在保证文档正确性的前提下定义了一种附加额外数据的标准方式。

在 DOM 中，Element 对象有一个 `dataset` 属性，该属性引用的对象包含与 HTML 中的 `data-` 属性对应的属性，但不带这个前缀。也就是说，`dataset.x` 中保存的是 HTML 中 `data-x` 属性的值。连字符分隔的属性将映射为驼峰式属性名：HTML 中的 `data-section-number` 会变成 JavaScript 中的 `dataset.sectionNumber`。

假设某 HTML 文档中包含以下内容：

```html
<h2 id="title" data-section-number="16.1">Attributes</h2>
```

那么可以使用以下 JavaScript 访问其中的节号（section number）：

```javascript
let number = document.querySelector("#title").dataset.sectionNumber;
```

## 15.3.4 元素内容

现在看一下图 15-1 所示的文档树，问问自己 `<p>` 元素包含哪些 “内容”？这个问题有两个答案。

- 它的内容是 HTML 字符串 “`This is a <<i>simple</</i> document`”。
- 它的内容是纯文本字符串 “`This is a simple document`”。

这两个答案都是正确的，而且每个答案都有自己适用的场景。接下来几小节介绍如何操作元素内容的 HTML 表示和纯文本表示。

### 作为 HTML 的内容

读取一个 Element 的 `innerHTML` 属性会返回该元素内容的标记字符串。在元素上设置这个属性会调用浏览器的解析器，并以新字符串解析后的表示替换元素当前的内容。可以打开开发者控制台，运行下面的代码试试效果：

```javascript
document.body.innerHTML = "<h1>Oops</h1>";
```

你会发现整个网页都不见了，取而代之的是一个标题 “Oops”。浏览器非常擅长解析 HTML，设置 `innerHTML` 通常效率很高。不过要注意，通过 `+=` 操作符给 `innerHTML` 追加文本的效率不高。因为这个操作既会涉及序列化操作，也会涉及解析操作：先把元素内容转换为字符串，然后再把新字符串转换回元素内容。

>在使用这些 HTML API 时，一定要注意永远不要把用户输入直接插到文档中。如果这样做，恶意用户可能会将他们的脚本插入你的应用。详情可以参见 15.1.8 节的 “跨站点脚本”。

Element 的 `outerHTML` 属性与 `innerHTML` 属性类似，只是返回的值包含元素自身。在读取 `outerHTML` 时，该值包含元素的开始和结束标签。而在设置元素的 `outerHTML` 时，新内容会取代元素自身。

另一个相关的 Element 方法是 `insertAdjacentHTML()`，用于插入与指定元素 “相邻”（adjacent）的任意 HTML 标记字符串。要插入的标签作为第二个参数传入，而 “相邻” 的精确含义取决于第一个参数的值。第一个参数可以是以下字符串值中的一个：`"beforebegin"` `"afterbegin"` `"beforeend"` `"afterend"`。图 15-2 展示了这几个值对应的插入位置。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%88%E7%AC%AC7%E7%89%88%EF%BC%89/%E7%AC%AC15%E7%AB%A0%EF%BC%9A%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E7%9A%84%20JavaScript/insertAdjacentHTML%28%29%20%E7%9A%84%E6%8F%92%E5%85%A5%E4%BD%8D%E7%BD%AE.png)

### 作为纯文本的内容

有时候，我们希望得到元素的纯文本内容，或者向文档中插入纯文本（不转义 HTML 中使用的尖括号和 `&` 字符）。这样做的标准方式是使用 `textContent` 属性：

```javascript
let para = document.querySelector("p"); // 文档中的第一个<p>
let text = para.textContent;            // 取得该段落的文本
para.textContent = "Hello world!";      // 修改该段落的文本
```

这个 `textContent` 属性是由 Node 类定义的，因此在 Text 节点和 Element 节点上都可以使用。对于 Element 节点，它会找到并返回元素所有后代中的文本。

Element 类定义了一个 `innerText` 属性，与 `textContent` 类似。但 `innerText` 有一些少见和复杂的行为，如试图阻止表格格式化。这个属性的定义不严谨，浏览器间的实现也存在兼容性问题，因此不应该再使用了。

>`<script>` 元素中的文本
>
>行内（即那些没有 `src` 属性的）`<script>` 元素有一个 `text` 属性，可以用于获取它们的文本。浏览器永远不会显示 `<script>` 元素的内容，HTML 解析器会忽略脚本中的尖括号和 & 字符。这就让 `<script>` 元素成为在 Web 应用中嵌入任意文本数据的理想场所。只要把这个元素的 `type` 属性设置为某个值（如 `text/x-custom-data`），明确它不是可执行的 JavaScript 代码即可。这样，JavaScript 解释器将会忽略这个脚本，但该元素还会出现在文档树中，它的 `text` 属性可以返回你在其中保存的数据。

## 15.3.5 创建、插入和删除节点

我们已经知道了如何获取及使用 HTML 和纯文本字符串修改文档内容。也知道了可以遍历 Document，查找构成文档的个别 Element 和 Text 节点。当然，在个别节点的层级修改文档也是可能的。Document 类定义了创建 Element 对象的方法，而 Element 和 Text 对象拥有在树中插入、删除和替换节点的方法。

使用 Document 类的 `createElement()` 方法可以创建一个新元素，并通过自己的 `append()`和 `prepend()` 方法为自己添加文本或其他元素：

```javascript
let paragraph = document.createElement("p"); // 创建一个空的 <p> 元素
let emphasis = document.createElement("em"); // 创建一个空的 <em> 元素
emphasis.append("world");                     // 向 <em> 元素中添加文本
paragraph.append("Hello ", emphasis, "!");    // 向 <p> 中添加文本和 <em>
paragraph.prepend("");                        // 在 <p> 的开头再添加文本
// => "Hello <em>world</em>!"
```

`append()` 和 `prepend()` 接收任意多个参数，这些参数可以是 Node 对象或字符串。字符串参数会自动转换为 Text 节点（也可以使用 `document.createTextNode()` 来创建 Text 节点，但很少需要这样做）。`append()` 把参数添加到孩子列表的末尾。`prepend()` 把参数添加到孩子列表的开头。

如果想在包含元素的孩子列表中间插入 Element 或 Text 节点，那 `append()` 和 `prepend()`都派不上用场。这时候，应该先获取对一个同辈节点的引用，然后调用 `before()` 在该同辈前面插入新内容，或调用 `after()` 在该同辈后面插入新内容。例如：

```javascript
// 找到 class="greetings" 的标题元素
let greetings = document.querySelector("h2.greetings");
// 在这个标题后面插入新创建的 paragraph 和一条水平线
greetings.after(paragraph, document.createElement("hr"));
```

与 `append()` 和 `prepend()` 类似，`after()` 和 `before()` 也接收任意个数的字符串和元素参数，在将字符串转换为 Text 节点后把它们全部插入文档中。`append()` 和 `prepend()`只在 Element 对象上有定义，但 `after()` 和 `before()` 同时存在于 Element 和 Text 节点上，因此可以使用它们相对于 Text 节点插入内容。

要注意的是，元素只能被插入到文档中的一个地方。如果某个元素已经在文档中了，你又把它插入到了其他地方，那它会转移到新位置，而不会复制一个新的过去：

```javascript
// 刚才我们在这个元素后面插入了 paragraph
// 但现在又把它转移到了元素的前面
greetings.before(paragraph);
```

如果确实想创建一个元素的副本，可以使用 `cloneNode()` 方法，传入 `true` 以复制其全部内容：

```javascript
// 创建 paragraph 的一个副本，再把它插入到 greetings 元素后面
greetings.after(paragraph.cloneNode(true));
```

调用 `remove()` 方法可以把 Element 或 Text 节点从文档中删除，或者可以调用 `replaceWith()`替换它。`remove()` 不接收参数，`replaceWith()` 与 `before()` 和 `after()` 一样，接收任意个数的字符串和元素：

```javascript
// 从文档中删除 greetings 元素，并代之以
// paragraph 元素（如果 paragraph 已经在
// 文档中了，则把它从当前位置移走）
greetings.replaceWith(paragraph);

// 删除 paragraph 元素
paragraph.remove();
```

DOM API 也定义了插入和删除内容的老一代方法。比如，`appendChild()`、`insertBefore()`、`replaceChild()` 和 `removeChild()`，都比这里介绍的方法难用，因此不应该再使用它们了。

## 15.3.6 示例：生成目录

示例 15-1 展示了如何动态为文档创建目录。这个示例演示了前几节介绍的很多操作 DOM 的技术，里边的注释非常多，因此代码应该很容易看懂。

```javascript
/*
 * TOC.js: 为文档创建一个目录
 * 这个脚本在 DOMContentLoaded 事件触发时运行，
 * 将自动为文档生成一个目录。它没有定义任何全局
 * 符号，因此不会与其他脚本发生冲突
 * 脚本在运行时，首先会查找一个 id 为 "TOC" 的文档
 * 元素。如果没有这个元素，它就会在文档开头创建
 * 一个。然后，它会找到所有 <h2> 到 <h6> 标签，将
 * 它们当作每一节的标题，并在 TOC 元素中创建一个
 * 目录。脚本还会给每个节标题添加一个节号，并将
 * 标题包装在一个用 name 属性定义的锚元素中，以便
 * TOC 可以链接到它们。生成的锚元素有 "TOC" 开头的
 * 的名字，因此你不应该在自己的 HTML 中再使用它
 * 生成的 TOC 条目可以通过 CSS 添加样式。所有条目都
 * 有一个 TOCEntry 类，而且每个条目还有一个与
 * 节标题级别对应的类：<h1> 生成的条目有 TOCLevel1，
 * <h2> 生成的条目有 TOCLevel2，……。插入到标题
 * 中的节号有类 TOCSectNum。
 * 使用这个脚本时，可以使用以下样式表：
 * 
 * #TOC { border: solid black 1px; margin: 10px; padding: 10px; }
 * .TOCEntry { margin: 5px 6px; }
 * .TOCEntry a { text-decoration: none; }
 * .TOCLevel1 { font-size: 16pt; font-weight: bold; }
 * .TOCLevel2 { font-size: 14pt; margin-left: .25in; }
 * .TOCLevel3 { font-size: 14pt; margin-left: .25in; }
 * .TOCLevel4 { font-size: 12pt; margin-left: .5in; }
 * .TOCSectNum:after { content: ": "; }
 * 要隐藏节号，可以加上：
 * 
 * .TOCSectNum { display: none }
 */
document.addEventListener("DOMContentLoaded", () => {
  // 查找 TOC 容器元素
  // 如果没找到，则在文档开头创建一个
  let toc = document.querySelector("#TOC");
  if (!toc) {
    toc = document.createElement("div");
    toc.id = "TOC";
    document.body.prepend(toc);
  }

  // 查找所有节标题元素。这里假设文档的标题
  // 使用 <h1>，文档中的各节使用 <h2> 到 <h6>
  let headings = document.querySelectorAll("h2,h3,h4,h5,h6");

  // 数组化一个数组，用来跟踪节号
  let sectionNumbers = [0,0,0,0,0];

  // 遍历我们找到的节标题元素
  for(let heading of headings) {
    // 如果标题位于 TOC 容器中则跳过
    if (heading.parentNode === toc) {
      continue;
    }

    // 确定标题的级别
    // 减 1，因为 <h2> 算第 1 级标题
    let level = parseInt(heading.tagName.charAt(1)) - 2;

    // 递增这个标题级别的节号
    // 并把所有低级编号重置为 0
    sectionNumbers[level]++;
    for(let i = level+1; i < sectionNumbers.length; i++) {
      sectionNumbers[i] = 0;
    }

    // 现在组合所有标题级别的节号
    // 以产生类似 2.3.1 这样的节号
    let sectionNumber = sectionNumbers.slice(0, level+1).join(".");

    // 把节号添加到节标题中
    // 把编号放在 <span> 中方便添加样式
    let span = document.createElement("span");
    span.className = "TOCSectNum";
    span.textContent = sectionNumber;
    heading.prepend(span);

    // 把标题包装在一个命名的锚元素中,以便可以链接到它
    let anchor = document.createElement("a");
    let fragmentName = `TOC${sectionNumber}`;
    anchor.name = fragmentName;
    heading.before(anchor);     // 在标题前插入锚元素
    anchor.append(heading);    // 把标题移到锚元素内

    // 接下来创建对这一节的链接
    let link = document.createElement("a");
    link.href = `#${fragmentName}`;   // 链接目标

    // 把标题文本复制到链接中，此时可以放心使用
    // innerHTML，因为没有插入任何不可信字符串
    link.innerHTML = heading.innerHTML;

    // 把链接放到一个 div 中，以便根据级别添加样式
    let entry = document.createElement("div");
    entry.classList.add("TOCEntry", `TOCLevel${level+1}`);
    entry.append(link);

    toc.append(entry);
  }
});
```

# 15.4 操作 CSS

我们已经知道了 JavaScript 可以控制 HTML 文档的逻辑结构和内容。通过对 CSS 编程，JavaScript 也可以控制文档的外观和布局。接下来几节讲解几种 JavaScript 可以用来操作 CSS 的不同技术。

本书是讲 JavaScript 而不是讲 CSS 的，因此本节假设读者已经了解如何使用 CSS 为 HTML 内容添加样式。不过，这里还是有必要提几个 JavaScript 中常用的 CSS 样式：

- 把 `display` 样式设置为 “none” 可以隐藏元素。随后再把 `display` 设置为其他值可以再显示元素。
- 把 `position` 样式设置为 “absolute”“relative” 或 “fixed”，然后再把 `top` 和 `left` 样式设置为相应的坐标，可以动态改变元素的位置。这个技术对于使用 JavaScript 显示模态对话框或工具提示条等动态内容很重要。
- 通过 `transform` 样式可以移动、缩放和旋转元素。
- 通过 `transition` 样式可以动态改变其他 CSS 样式。这些动画由浏览器自动处理，不需要 JavaScript，但可以使用 JavaScript 启动动画。

## 15.4.1 CSS 类

使用 JavaScript 影响文档内容样式的最简单方式是给 HTML 标签的 `class` 属性添加或删除 CSS 类名。15.3.3 节在 “class 属性” 中介绍过，`Element` 对象的 `classList` 属性可以用来方便地实现此类操作。

比如，假设文档的样式表包含一个 “hidden” 类的定义：

```css
.hidden {
  display:none;
}
```

基于这个定义，可以通过如下代码隐藏（和显示）元素：

```javascript
// 假设 “tooltip” 元素在 HTML 中有 class="hidden"
// 可以像这样让它变得可见：
document.querySelector("#tooltip").classList.remove("hidden");

// 可以像这样让它再隐藏起来：
document.querySelector("#tooltip").classList.add("hidden");
```

## 15.4.2 行内样式

继续前面工具提示条（tooltip）的例子，假设文档的结构中只包含一个提示条元素，而我们想在显示它之前先动态把它定位好。一般来说，我们不可能针对提示条的所有可能位置都创建一个类，因此 `classList` 属性不能用于定位。

这种情况下，我们需要用程序修改提示条在 HTML 中的 `style` 属性，设置只针对它自己的行内样式。DOM 在所有 `Element` 对象上都定义了对应的 `style` 属性。但与大多数镜像属性不同，这个 `style` 属性不是字符串，而是 `CSSStyleDeclaration` 对象，是对 HTML 中作为 `style` 属性值的 CSS 样式文本解析之后得到的一个表示。要在 JavaScript 中显示和设置提示条的位置，可以使用类似下面的代码：

```javascript
function displayAt(tooltip, x, y) {
  tooltip.style.display = "block";
  tooltip.style.position = "absolute";
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}
```

>命名约定：JavaScript 中的 CSS 属性
>
>很多 CSS 样式属性（比如 `font-size`）的名字中都包含连字符。连字符在 JavaScript 中会被解释为减号，因此不允许出现在属性名其他标识符中。为此，`CSSStyleDeclaration` 对象的属性名与实际的 CSS 属性名稍微有点不一样。如果 CSS 属性名包含一个或多个连字符，对应的 `CSSStyleDeclaration` 属性名将删除连字符，并将每个连字符后面的字母变成大写。例如，JavaScript 会使用 `borderLeftWidth` 属性访问 `border-left-width` 这个 CSS 属性，而 CSS 的 `font-family` 属性在 JavaScript 中也会被写成 `fontFamily`。

在使用 `CSSStyleDeclaration` 的样式属性时，要记住所有值都必须是字符串。在样式表或 `style` 属性里，可以这样写：

```css
display: block; font-family: sans-serif; background-color: #ffffff;
```

但在 JavaScript 要对元素 `e` 设置相同的样式，必须给所有值都加上引号：

```javascript
e.style.display = "block";
e.style.fontFamily = "sans-serif";
e.style.backgroundColor = "#ffffff";
```

注意分号不包含在字符串中，它们只是普通的 JavaScript 分号。我们在 CSS 格式表中使用的分号在通过 JavaScript 设置字符串值时并不是必需的。

还有，要记住很多 CSS 属性要求包含单位，如 “px” 表示像素，“pt” 表示点。因此，像下面这样设置 `marginLeft` 属性是不正确的：

```javascript
e.style.marginLeft = 300;  // 不正确：这是一个数值，不是字符串
e.style.marginLeft = "300"; // 不正确：没有包含单位
```

在 JavaScript 中设置样式属性时单位是必需的，就跟在样式表中设置样式属性一样。把元素 `e` 的 `marginLeft` 属性设置为 300 像素的正确方式是：

```javascript
e.style.marginLeft = "300px";
```

如果想把某个 CSS 属性设置为计算值，也要确保在计算表达式末尾加上单位：

```javascript
e.style.left = `${x0 + left_border + left_padding}px`;
```

我们知道，有些 CSS 属性是其他属性的简写形式，比如 `margin` 是 `margin-top`、`margin-right`、`margin-bottom` 和 `margin-left` 的简写。`CSSStyleDeclaration` 对象上也有与这些简写属性对应的属性。例如，可以像这样设置 `margin` 属性：

```javascript
e.style.margin = `${top}px ${right}px ${bottom}px ${left}px`;
```

有时候，以字符串而非 `CSSStyleDeclaration` 对象形式设置和读取行内样式会更方便。为此，可以使用 `Element` 的 `getAttribute()` 和 `setAttribute()` 方法，或者也可以使用 `CSSStyleDeclaration` 对象的 `cssText` 属性：

```javascript
// 把元素 e 的行内样式复制给元素 f
f.setAttribute("style", e.getAttribute("style"));

// 或者，这样也可以
f.style.cssText = e.style.cssText;
```

在读取元素的 `style` 属性时，应该知道它只表示元素的**行内样式**，而多数元素的多数样式都是在样式表中指定的，不是写在行内的。并且，通过 `style` 属性读到的任何单位和简写属性，都是对应 HTML 属性中实际使用的格式，你的代码可能必须进行复杂解析才能解释它们。一般来说，如果你想知道一个元素的样式，那需要的可能是**计算样式**，也就是下一节要讨论的。

## 15.4.3 计算样式

元素的**计算样式（computed style）\**是浏览器根据一个元素的行内样式和所有样式表中适用的样式规则导出（或计算得到）的一组属性值，浏览器实际上使用这组属性值来显示该元素。与行内样式类似，计算样式同样以 `CSSStyleDeclaration` 对象表示。但与行内样式不同的是，计算样式是\**只读**的，不能修改计算样式，但表示一个元素计算样式的 `CSSStyleDeclaration` 对象可以让你知道浏览器在渲染该元素时，使用了哪些属性和值。

使用 `Window` 对象的 `getComputedStyle()` 方法可以获取一个元素的计算样式。这个方法的第一个参数是要查询的元素，可选的第二个参数用于指定一个 CSS 伪元素（如 `::before` 或 `::after`）：

```javascript
let title = document.querySelector("sectiontitle");
let styles = window.getComputedStyle(title);
let beforeStyles = window.getComputedStyle(title, "::before");
```

`getComputedStyle()` 的返回值是一个 `CSSStyleDeclaration` 对象，该对象包含应用给指定元素（或伪元素）的所有样式。这个 `CSSStyleDeclaration` 对象与表示行内样式的 `CSSStyleDeclaration` 对象有一些重要的区别：

- 计算样式的属性是**只读**的。
- 计算样式的属性是**绝对值**，百分比和点等相对单位都被转换成了绝对值。任何指定大小的属性（如外边距大小和字体大小）都将以像素度量，相应的值会包含 “px” 后缀，虽然还需要解析，但不用考虑解析或转换其他单位。值为颜色的属性将以 “rgb ()” 或 “rgba ()” 格式返回。
- 简写属性不会被计算，只有它们代表的基础属性会被计算。例如，不能查询 `margin` 属性，而要查询 `marginLeft`、`marginTop` 等。类似地，不要查询 `border` 甚至 `borderWidth`，而要查询 `borderLeftWidth`、`borderTopWidth`。
- 计算样式的 `cssText` 属性是 `undefined`。

`getComputedStyle()` 返回的 `CSSStyleDeclaration` 对象中包含的属性，通常要比行内样式属性对应到的 `CSSStyleDeclaration` 对象多很多。但计算样式比较难说，查询它们并不一定总能得到想要的信息。以 `font-family` 属性为例，它接收逗号分隔的字体族的列表，以实现跨平台兼容。在查询计算样式的 `fontFamily` 属性时，只是得到应用给元素的最特定于 `font-family` 样式的值，这可能会返回类似 “arial,helvetica,sans-serif” 这样的值，并不说明实际使用了哪种字体。再比如，如果某元素没有被绝对定义，通过计算样式查询其 `top` 和 `left` 属性经常会返回 `auto`。这是个合法的 CSS 值，但却不一定是你想找的。

尽管 CSS 可以精确指定文档元素的位置和大小，查询元素的计算样式并非确定该元素大小和位置的理想方式。15.5.2 节介绍了一个更简单易用的替代方案。

## 15.4.4 操作样式表

除了操作 `class` 属性和行内样式，JavaScript 也可以操作样式表。样式表是通过 `<style>` 标签或 `<link rel="stylesheet">` 标签与 HTML 文档关联起来的。这两个标签都是普通的 HTML 标签，因此可以为它们指定一个 `id` 属性，然后使用 `document.querySelector()`找到它们。

`<style>`和`<link>`标签对应的 Element 对象都有disabled属性，可以用它禁用整个样式表。比如，可以像下面这样使用这个属性：

```javascript
// 这个函数可以实现 “light” 和 “dark” 主题的切换
function toggleTheme() {
    let lightTheme = document.querySelector("#light-theme");
    let darkTheme = document.querySelector("#dark-theme");
    if (darkTheme.disabled) { 
        // 当前是浅色主题，切换到深色主题
        lightTheme.disabled = true;
        darkTheme.disabled = false;
    } else { 
        // 当前是深色主题，切换到浅色主题
        lightTheme.disabled = false;
        darkTheme.disabled = true;
    }
}
```

另一个操作样式表的简单方式是使用前面介绍的 DOM API 向文档中插入新样式表。例如：

```javascript
function setTheme(name) {
    // 创建新 <link rel="stylesheet"> 元素，用以加载指定 name 的样式表
    let link = document.createElement("link");
    link.id = "theme";
    link.rel = "stylesheet";
    link.href = `themes/${name}.css`;

    // 通过 id=“theme” 查找当前的 <link> 元素
    let currentTheme = document.querySelector("#theme");
    if (currentTheme) {
        // 如果找到，则将当前主题替换为新主题
        currentTheme.replaceWith(link);
    } else {
        // 否则，直接插入包含主题的 <link> 元素
        document.head.append(link);
    }
}
```

虽然算不上巧妙，但也可以向文档中插入一段包含 `<style>` 标签的 HTML 字符串。这是一种好玩的技术，例如：

```javascript
document.head.insertAdjacentHTML(
    "beforeend",
    "<style>body{transform:rotate(180deg)}</style>"
);
```

浏览器定义了一套 API，以便 JavaScript 能够在样式表中查询、修改、插入或删除样式规则。这套 API 太专业了，我们没办法在这里讲解。大家可以在 MDN 上自行搜索 “CSS Object Model” 或 “CSSStyleSheet” 并阅读。

## 15.4.5 CSS 动画与事件

假设你的样式表中定义了下面两个 CSS 类：

```css
.transparent { opacity: 0; }
.fadeable { transition: opacity .5s ease-in; }
```

如果把第一个样式应用给某个元素，该元素会变成完全透明，不可见。而第二个样式中的过渡属性（`transition`）会告诉浏览器当元素的不透明度（`opacity`）变化时，该变化应该在 0.5 秒的时间内以动画的形式呈现。其中的`ease-in`要求不透明度的变化动画应该先慢后快。

现在假设 HTML 文档中包含一个有 “fadeable” 类的元素：

```html
<div id="subscribe" class="fadeable notification">...</div>
```

在 JavaScript 中，可以为它添加 “transparent” 类：

```javascript
document.querySelector("#subscribe").classList.add("transparent");
```

这个元素是为不透明度动画而配置的。给它添加 “transparent” 类，改变不透明度，会触发一次动画：浏览器会在半秒内让元素 “淡出” 为完全透明。

相反的过程也能触发动画：如果删除 “fadeable” 元素的 “transparent” 类，又会改变不透明度，因此元素将淡入，变得再次可见。

这个过程不需要 JavaScript 做任何事情，是纯粹的 CSS 动画效果。但 JavaScript 可以用来触发这种动画。

JavaScript 也可以用来监控 CSS 过渡动画的进度，因为浏览器在过渡动画的开始和结束都会触发事件。首次触发过渡时，浏览器会派发 “`transitionrun`” 事件。这时候可能刚刚指定 `transition-delay` 样式，而视觉上还没有任何变化。当发生视觉变化时，又会派发 “`transitionstart`” 事件，而当动画完成时，则会派发 “`transitionend`” 事件。当然，所有这些事件的目标都是发生动画的元素。这些事件传给处理程序的事件对象是一个 `TransitionEvent` 对象。该对象的 `propertyName` 属性是发生动画的 CSS 属性，而 “`transitionend`” 事件对应的事件对象的 `elapsedTime` 属性是从动画开始过的秒数。

除了过渡之外，CSS 也支持更复杂的动画形式，可以称其为 “CSS 动画”。这会用到 `animation-name`、`animation-duration` 和特殊的 `@keyframes` 规则来定义动画细节。讲解 CSS 动画的原理超出了本书范畴，但如果你是在一个 CSS 类上定义了所有这些动画属性，那只要使用 JavaScript 把这个类添加到要做动画的元素上就可以触发动画。

与 CSS 过渡类似，CSS 动画也触发事件，可以供 JavaScript 代码监听。动画开始时触发`"animationstart"`事件，完成时触发`"animationend"`事件。如果动画会重复播放，则每次重复（不包括最后一次）都会触发`"animationiteration"`事件。事件目标是发生动画的元素，而传给处理程序的事件对象是 AnimationEvent 对象。这个对象的`animationName`属性是定义动画的`animation-name`属性，而`elapsedTime`属性反映了动画开始以后经过了多少秒。

# 15.5 文档几何与滚动

本章到现在，我们一直把文档想象成元素和文本节点的抽象树。但当浏览器在窗口中渲染文档时，它会创建文档的一个视觉表示，其中每个元素都有自己的位置和大小。有时候，Web 应用可以把文档看成元素的树，不考虑这些元素在屏幕上如何展示。但有时候，又必须知道某个元素精确的几何位置。例如，要使用 CSS 动态把一个元素（如提示条）定位到某个常规定位的元素旁边，必须先知道这个常规定位元素的位置。

接下来几节将介绍如何在基于树的抽象文档模型和基于几何坐标系的文档视图之间切换。

## 15.5.1 文档坐标与视口坐标

文档元素的位置以 CSS 像素度量，其中 x 坐标向右表示增大，y 坐标向下表示增大。但是有两个点可以用作坐标原点：元素的 x 和 y 坐标可以相对于文档的左上角，也可以相对于显示文档的视口（viewport）的左上角。在顶级窗口和标签页中，“视口” 就是浏览器窗口中实际显示文档内容的区域。因此不包含浏览器的 “外框”（chrome），如菜单、工具条和标签。对于显示在`<iframe>`标签中的文档，由 DOM 中的内嵌窗格（iframe）元素定义嵌套文档的视口。无论哪种情况，说到元素位置，必须首先搞清楚是使用文档坐标还是视口坐标（有时候，视口坐标也被称为 “窗口坐标”）。

如果文档比较小，或者如果文档没有被滚动过，则文档左上角就位于视口左上角，文档和视口坐标系是相同的。但通常情况下，要实现这两种坐标系的转换，都必须加上或减去滚动位移（scroll offset）。如果元素在文档坐标中的 y 坐标是 200 像素，用户向下滚动了 75 像素，则元素在视口坐标中的 y 坐标是 125 像素。类似地，如果用户在视口中水平滚动 200 像素之后元素在文档坐标中的 x 坐标是 400 像素，则元素在文档坐标中的 x 坐标是 600 像素。

如果以打印的纸质文档做比喻，则任由用户怎么上下左右移动文档，其中每个元素在文档坐标中都拥有不变的位置。纸质文档具有的这种性质也适用于简单的网页文档，但一般来说，文档坐标并不真正适合网页。问题在于 CSS 的`overflow`属性允许文档中的元素包含比它能显示的更多的内容。元素可以有自己的滚动条，并作为它们所包含内容的视口。Web 允许在滚动文档中存在滚动元素，意味着不可能只使用一个 (x,y) 点描述元素在文档中的位置。

既然文档坐标实际上没有什么用，客户端 JavaScript 更多地会使用视口坐标。接下来介绍的`getBoundingClientRect()`和`elementFromPoint()`方法使用的就是视口坐标，而鼠标和指针事件对象的`clientX`和`clientY`属性使用的也是这个坐标。

在使用 CSS 的`position:fixed`显式定位元素时，`top`和`left`属性相对于视口坐标来解释。如果使用`position:relative`，则元素会相对于没给它设置`position`属性时的位置进行定位。如果使用`position:absolute`，则`top`和`left`相对于文档或者最近的包含定位元素。这意味着，如果一个相对定位元素中包含一个绝对定位元素，则绝对定位元素会相对于这个相对定位的包含元素而不是整个文档。一个绝对定位元素，则把定位置为相对定位，同时将其`top`和`left`设置为 0（这样作为容器它的布局没有变化），从而为它包含的绝对定位元素建立一个新的坐标系统。可以把这个新的坐标系统称为 “容器坐标”，以便区分于文档坐标和视口坐标。

>CSS 像素
>
>如果读者跟我一样，还记得分辨率为 1024×768 的显示器和 320×480 的触屏手机，那可能你仍然认为 “像素” 这个词语指的是硬件意义上的 “画面元素”（picture element，即 pixel）。今天的 4K 显示器和 “视网膜” 屏的分辨率已经非常高，因此又分出了软件像素与硬件像素的概念。那么一个 CSS 像素（也就是客户端 JavaScript 中的像素），实际上可能相当于多个设备像素。Window 对象的`devicePixelRatio`属性表示多少设备像素对应一个软件像素。比如，设备像素比（dpr，device pixel ratio）为 2，意味着每个软件像素实际上是一个 2×2 硬件像素的网格。`devicePixelRatio`的取值取决于硬件的物理分辨率、操作系统的设置，还有浏览器的缩放级别。
>
>`devicePixelRatio`不一定是整数。如果 CSS 中设置的字体大小为 12px，但设备的像素比为 2.5，那么实际的字体大小就是 30 设备像素。因为 CSS 中使用的像素值不再直接对应屏幕上的像素，像素坐标也不需要必须为整数。如果`devicePixelRatio`是 3，那么坐标 3.33 完全没问题。但如果这个比率是 2，坐标 3.33 会简单地被舍入为 3.5。

## 15.5.2 查询元素的几何大小

调用`getBoundingClientRect()`方法可以确定元素的大小（包括 CSS 边框和内边距，不包括外边距）和位置（在视口坐标中）。这个方法没有参数，返回一个对象，对象有 left、right、top、bottom、width 和 height 属性。其中，left 和 top 属性是元素左上角的 x 和 y 坐标，right 和 bottom 属性是右下角的坐标。这两对属性值的差就是 width 和 height 属性。

块级元素（如段落和 <div> 元素）在浏览器的布局中始终是矩形。行内元素（如 、<code> 和 <b> 元素）则可能跨行，因而包含多个矩形。比如，<em> 和 </em> 标签间的文本显示在两行上，则它的矩形会包含第一行尾和第二行开头。如果在这个元素上调用 getBoundingClientRect ()，则边界矩形将包含两行的整个宽度。如果想查询行内元素中的个别矩形，可以调用 getClientRects () 方法，得到一个只读的类数组对象，其元素为类似 getBoundingClientRect () 返回的矩形对象。

## 15.5.3 确定位于某一点的元素

使用 getBoundingClientRect () 方法可以确定视口中某个元素的当前位置。有时候，我们想从另一个方向出发，确定在视口中某个给定位置上的是哪个元素。为此可以使用 Document 对象的 elementFromPoint () 方法。调用这个方法并传入一个点的 x 和 y 坐标（视口坐标，而非文档坐标。比如，可以使用鼠标事件中的 clientX 和 clientY 坐标），elementFromPoint () 返回一个位于指定位置的 Element 对象。选择元素的碰撞检测（hit detection）算法并没有明确规定，但这个方法的意图是返回相应位置上最内部（嵌套最深）、最外层（最大的 CSS z-index 属性）的元素。

## 15.5.4 滚动

Window 对象的 scrollTo () 方法接收一个点的 x 和 y 坐标（文档坐标），并据以设置滚动条的位移。换句话说，这个方法会滚动窗口，从而让指定的点位于视口的左上角。如果这个点太接近文档底部或右边，浏览器会尽可能让视口左上角接近这个点，但不可能真的移动到该点。以下代码会滚动浏览器让文档最底部的页面显示出来：

```js
// 取得文档和视口的高度
let documentHeight = document.documentElement.offsetHeight;
let viewportHeight = window.innerHeight;
// 滚动到最后“一页”在视口中可见
window.scrollTo(0, documentHeight - viewportHeight);
```

Window 对象的 scrollBy () 方法与 scrollTo () 类似，但它的参数是个相对值，会加在当前滚动位置之上：

```js
// 每 500 毫秒向下滚动 50 像素。注意，没有办法停止！
setInterval(() => { scrollBy(0,50); }, 500);
```

如果想让 scrollTo () 和 scrollBy () 平滑滚动，需要传入一个对象，而不是两个数值，比如：

```js
window.scrollTo({
  left: 0,
  top: documentHeight - viewportHeight,
  behavior: "smooth"
});
```

有时候，我们不是想让文档滚动既定的像素距离，而是想滚动到某个元素在视口中可见。此时可以在相应 HTML 元素上调用 scrollIntoView () 方法，这个方法保证在上面调用它的那个元素在视口中可见。默认情况下，滚动后的结果会尽量让元素的上边对齐或接近视口上沿。如果给这个方法传入唯一的参数 false，则滚动后的结果会尽量让元素的底边对齐视口下沿。为了让元素可见，浏览器也会水平滚动视口。

同样可以给 scrollIntoView () 传入一个对象，设置 behavior:"smooth" 属性，以实现平滑滚动。而设置 block 属性可以指定元素在垂直方向上如何定位，设置 inline 属性可以指定元素在水平方向上如何定位（假设需要水平滚动）。这两个属性的有效值均包括 start、end、nearest 和 center。

## 15.5.5 视口大小、内容大小和滚动位置

前面说过，浏览器窗口和一些 HTML 元素可以显示滚动的内容。在这种情况下，我们有时候需要知道视口大小、内容大小和视口中内容的滚动位移。本节介绍这些细节。

对浏览器窗口而言，视口大小可以通过 window.innerWidth 和 window.innerHeight 属性获得（针对移动设备优化的网页通常会在 <head> 中使用 <meta name="viewport"> 标签为页面设置想要的视口宽度）。文档的整体大小与 <html> 元素，即 document.documentElement 的大小相同。要获得文档的宽度和高度，可以使用 document.documentElement 的 offsetWidth 和 offsetHeight。要获得文档的滚动位移可以通过 window.scrollX 和 window.scrollY 获得。这两个属性都是只读的，因此不能通过设置它们的值来滚动文档。滚动文档应该使用 window.scrollTo ()。

对元素来说，问题稍微复杂一点。每个 Element 对象都定义了下列三组属性：

| offsetWidth  | clientWidth  | scrollWidth  |
| ------------ | ------------ | ------------ |
| offsetHeight | clientHeight | scrollHeight |
| offsetLeft   | clientLeft   | scrollLeft   |
| offsetTop    | clientTop    | scrollTop    |
| offsetParent |              |              |

元素的 offsetWidth 和 offsetHeight 属性返回它们在屏幕上的 CSS 像素大小，这个大小包含元素边框和内边距，但不包含外边距。元素的 offsetLeft 和 offsetTop 属性返回元素的 x 和 y 坐标。对很多元素来说，这两个值都是文档坐标。但对定位元素的后代或者另一些元素（如表格单元）来说，这两个值是相对于祖先元素而非文档的坐标。而`offsetParent`属性保存着前述坐标值相对于哪个元素。这一组属性都是只读的。

元素的`clientWidth`和`clientHeight`属性与`offsetWidth`和`offsetHeight`属性类似，只是它们不包含元素边框，只包含内容区及内边距。`clientLeft`和`clientTop`属性没有多大用处，它们是元素内边距外沿到边框外沿的水平和垂直距离。一般来说，这两个值就等于左边框和上边框的宽度。这一组属性都是只读的。对于行内元素（如`<em>`、`<code>`和`<span>`），这些属性的值全为 0。

元素的`scrollWidth`和`scrollHeight`属性是元素内容区大小加上元素内边距，再加上溢出内容的大小。在内容适合内容区而没有溢出时，这两个属性等同于`clientWidth`和`clientHeight`。但在有溢出时，这两个属性还包含溢出内容，因此它们的值大于`clientWidth`和`clientHeight`。`scrollLeft`和`scrollTop`是元素内容在元素视口中的滚动位移。与本节介绍的其他属性不同，`scrollLeft`和`scrollTop`是可写属性，因此可以通过设置它们的值滚动元素中的内容（在多数浏览器中，`Element`对象也跟`Window`对象一样有`scrollTo()`和`scrollBy()`方法，但并非所有浏览器都支持）。

# 15.6 Web 组件

HTML 是一种文档标记语言，为此也定义了丰富的标签。过去 30 年，HTML 已经改变成 Web 应用程序用户界面的语言，但`<input>`和`<button>`等简单的 HTML 标签并不能满足现代 UI 设计的需要。Web 开发者可以凑合着使用它们，但必须以 CSS 和 JavaScript 来增强这些 HTML 标签的外观和行为。下面来看一个典型的用户界面组件，如图 15-3 所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%88%E7%AC%AC7%E7%89%88%EF%BC%89/%E7%AC%AC15%E7%AB%A0%EF%BC%9A%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E7%9A%84%20JavaScript/%E6%90%9C%E7%B4%A2%E6%A1%86%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2%E7%BB%84%E4%BB%B6.png)

使用 HTML 的`<input>`元素可以从用户接收一行输入，但它本身没有任何途径来呈现图标，比如在左侧表示放大，在右侧表示取消。为了在网页中实现类似这样的现代用户界面元素，至少需要使用 4 个 HTML 标签：一个`<input>`标签用于接收和显示用户的输入，两个`<img>`标签（或者两个`<span>`标签显示 Unicode 字形）和一个作为容器的`<div>`元素包含前面 3 个元素。另外，必须使用 CSS 隐藏`<input>`元素的边框，比如为声音定义一个边框。还需要使用 JavaScript 让所有这些 HTML 元素协同工作。比如当用户点击小图标时，需要一个事件处理程序清除`<input>`元素中的用户输入。

这是个小的工作量，但每次要在 Web 应用中显示搜索框时都要这么做。今天的多数Web 应用都不是用 “原始的” HTML 写的。相反，很多 Web 开发者使用 React、Angular 等框架，这些框架支持创建复杂但控制精细的可复用的用户界面组件。Web 组件是 Web 原生生态的替代这些框架的这个性。主要的区别比较的是一个 Web 标准，这些 Web 标准允许 JavaScript 使用新标签扩展 HTML，扩展后的标签就像自表单元素一样，可复用的 UI 组件。

接下来几小节将展示如何在你自己的网页中使用其他开发者创建的一致的、可重用的构成 Web 组件的这三个技术，最后通过一个示例将这三个技术整合在一起，实现图 15-3 所展示的搜索框组件。

## 15.6.1 使用 Web 组件

Web 组件是在 JavaScript 中定义的，因此在 HTML 中使用 Web 组件，需要包含定义该组件的 JavaScript 文件。Web 组件是自定义标签的技术，经常以 JavaScript 模块的形式写成，因此需要在 HTML 中像下面这样包含该组件：

```html
<script type="module" src="components/search-box.js"></script>
```

Web 组件可以像常规 HTML 标签一样具有属性。你使用组件的文档应该告诉你它支持哪些属性。Web 组件不能使用内联的样式定义，比如你不能给`<search-box>`标签添加`style`属性。HTML 文件必须包含包含标签名称包含连字符的标签。

与常规 HTML 元素类似，有的 Web 组件带子组件，而有的 Web 组件不需要（也不支持）子组件。还有的 Web 组件可选地接收模板作为子组件，这些子组件会用做该组件的 “插槽”（slot）中。在图 15-3 所示并在例 15-3 中实现的`search-box`组件，就会使用 “插槽” 传递要显示的两个图标。如果要在`<search-box>`中使用不同的图标，可以这样使用 HTML：

```html
<search-box>
  <img slot="icon" src="images/search-icon.png" alt="search">
  <img slot="clear" src="images/clear-icon.png" alt="clear">
</search-box>
```

这个`slot`属性是对 HTML 的一个扩展，用于指定把哪个子元素放到哪個槽。而插槽的名字 “left” 和 “right” 是由这个 Web 组件定义的。如果你使用的组件支持插槽，其文档中应该说明。

前面提到过 Web 组件经常以 JavaScript 模块来实现，因此可以通过 `<script type="module">` 标签加载到 HTML 文件中。你可能还记得，本章开头介绍过模块就像添加了 `deferred` 标签一样，会在文档内容解析之后加载。这意味着浏览器通常会在运行包含 `<search-box>` 定义的代码之前，就要解析和渲染 `<search-box>` 标签。这在使用 Web 组件时是正常的。浏览器中的 HTML 解析器很灵活，对自己不理解的输入非常宽容。当 Web 组件还没有定义就遇到其标签时，浏览器会向 DOM 树中添加一个通用的 `HTMLElement`，即便它们不知道要对它做什么。之后，当自定义元素有定义之后，这个通用元素会被 “升级”，从而具备预期的外观和行为。

如果 Web 组件包含子元素，那么在组件有定义之前它们可能会被不适当地显示出来。可以使用下面的 CSS 将 Web 组件隐藏到它们有定义为止：

```css
/* 
* 让 <search-box> 组件在有定义前不可见
* 同时尝试设定其最终布局和大小，以便近旁
* 内容在它有定义时不会移动
*/
search-box:not(:defined) {
  opacity: 0;
  display: inline-block;
  width: 300px;
  height: 50px;
}
```

与常规 HTML 元素一样，Web 组件可以在 JavaScript 中使用。如果在网页中包含 `<search-box>` 标签，就可以通过 `querySelector()` 和适当的 CSS 选择符获得对它的引用，就像对任何其他 HTML 标签一样。一般来说，只有在定义这个组件的模块运行之后这样做才有意义。因此在查询 Web 组件时要注意不要过早地做这件事。Web 组件实现通常都会（但并非必须）为它们支持的每个 HTML 属性都定义一个 JavaScript 属性。另外，与 HTML 元素相似，它们可能定义有用的方法。同样，你所使用 Web 组件的文档应该指出可以在 JavaScript 中使用什么属性和方法。

知道了如何使用 Web 组件，接下来三节将介绍用于实现 Web 组件的三个浏览器特性。

>DocumentFragment 节点
>
>在介绍 Web 组件 API 之前，需要简单回顾一下 DOM API，解释一下 `DocumentFragment` 是什么。DOM API 将文档组织成一个 `Node` 对象树，其中 `Node` 可以是 `DocumentFragment`、`Element`、`Text` 节点，或者 `Comment` 节点。但这些节点类型都不能用来表示一个文档片段，或者一组没有父节点的同辈节点。这时候就要用到 `DocumentFragment` 了。`DocumentFragment` 也是一种 `Node` 类型，可以临时充当一组同辈节点的父节点，方便将这些同辈节点作为一个单元来使用。可以使用 `document.createDocumentFragment()` 来创建 `DocumentFragment` 节点。创建 `DocumentFragment` 节点后，就可以像使用 `Element` 一样，通过 `append()` 为它添加内容。`DocumentFragment` 与 `Element` 的区别在于它没有父节点。但更重要的是，当你向文档中插入 `DocumentFragment` 节点时，`DocumentFragment` 本身并不会被插入，实际上插入的是它的子节点。

## 15.6.2 HTML 模板

HTML 的 `<template>` 标签跟 Web 组件的关系虽然没那么密切，但通过它确实可以对网页中频繁使用的组件进行优化。`<template>` 标签及其子元素永远不会被浏览器渲染，只能在使用 JavaScript 的网页中使用。这个标签背后的思想是，当网页包含多个重复的基本 HTML 结构时（比如表格行或 Web 组件的内部实现），就可以使用 `<template>` 定义一次该结构，然后通过 JavaScript 按照需要任意重复使用该结构。

在 JavaScript 中，`<template>` 标签对应的是一个 `HTMLTemplateElement` 对象。这个对象只定义了一个 `content` 属性，而这个属性的值是包含 `<template>` 所有子节点的 `DocumentFragment`。可以克隆这个 `DocumentFragment`，然后把克隆的副本插入文档中需要的地方。这个片段自身不会被插入，只有其子节点会。假设你的文档中包含一个 `<table>` 和 `<template id="row">` 标签，而后者作为模板定义了表格中行的结构，那可以像下面这样使用模板：

```javascript
let tableBody = document.querySelector("tbody");
let template = document.querySelector("#row");
let clone = template.content.cloneNode(true); // 深度克隆
// ……先使用 DOM 把内容插入完整的<td>元素……
// 然后把克隆且已初始化的表格行插入表格体
tableBody.append(clone);
```

这个模板元素并非只有出现在 HTML 文档中才可以使用。也可以在 JavaScript 代码中创建一个模板，通过 `innerHTML` 创建其儿子节点，然后再按照需要克隆任意多个副本。这样还不必每次都解析 `innerHTML`。而且这也是 Web 组件中使用 HTML 模板的方式，示例 15-3 演示了这个技术。

## 15.6.3 自定义元素

实现 Web 的第二个浏览器特性是 “自定义元素”，即可以把一个 HTML 标签与一个 JavaScript 类关联起来，然后文档中出现的这个标签就会在 DOM 树中转换为相应类的实例。创建自定义元素需要使用 `customElements.define()` 方法，这个方法以一个Web 组件的标签名作为第一个参数（记住这个标签名必须包含一个连字符），以一个 HTMLElement 的子类作为其第二个参数。文档中具有该标签名的任何元素都会被 “升级” 为这个类的一个新实例。如果浏览器将来再解析 HTML，都会自动为遇到的这个标签创建一个这个类的实例。

传给 customElements.define () 的类应该扩展 HTMLElement，且不是一个更具体的类型（如 HTMLButtonElement⁴）。第 9 章曾介绍过，当一个 JavaScript 类扩展另一个类时，构造函数必须先调用 super () 然后才能使用 this 关键字。因此如果自定义元素类有构造器，应该先调用 super ()（没有参数），然后再干别的。

浏览器会自动调用自定义元素类的特定 “生命周期方法”。当自定义元素被插入文档时，会调用 connectedCallback () 方法。很多自定义元素通过这个方法来执行初始化。还有一个 disconnectedCallback () 方法，会在（如果）自定义元素从文档中被移除时调用，但用得不多。

如果自定义元素类定义了静态的 observedAttributes 属性，其值为一个属性名的数组，且如果任何这些命名属性在这个自定义元素的一个实例上被设置（或修改），浏览器就会调用 attributeChangedCallback () 方法，传入属性名、旧值和新值。这个回调可以根据属性值的变化采取必要的步骤以更新组件。

自定义元素类也可以按照需要定义其他属性和方法。通常，它们都会定义设置方法和获取方法，让元素的属性可以暴露为 JavaScript 属性。

下面举一个自定义元素的例子。假设我们想在一个常规文本段落中显示圆圈。我希望可以像下面这样写 HTML，以提出图 15-4 所示的数学故事问题：

```html
<p>
    The document has one marble: <inline-circle></inline-circle>.
    The HTML parser instantiates two more marbles:
    <inline-circle diameter="1em" color="blue"></inline-circle>
    <inline-circle diameter="1.5em" color="gold"></inline-circle>
    How many marbles does the document contain now?
</p>
```

示例 15-2 中的代码实现了这个`<inline-circle>`自定义元素：

示例 15-2：`<inline-circle>` 自定义元素

```javascript
customElements.define('inline-circle', class InlineCircle extends HTMLElement {
  // 浏览器会在一个<inline-circle>元素被插入文档时
  // 调用这个方法。还有一个disconnectedCallback()
  // 方法，但这个例子中没有用到。
  connectedCallback() {
    // 设置创建圆圈所需的样式
    this.style.display = "inline-block";
    this.style.borderRadius = "50%";
    this.style.border = "solid black 1px";
    this.style.transform = "translateY(10%)";
    // 字体大小定义大小，默认基于当前
    // 字体大小，否则是默认大小
    if (!this.style.width) {
      this.style.width = "0.8em";
      this.style.height = "0.8em";
    }
  }

  // 这个静态的observedAttributes属性用于指定我们
  // 想在哪个属性变化时收到通知(这里使用了
  // 技巧，是因为只能对方法使用static关键字)
  static get observedAttributes() { return ["diameter", "color"]; }

  // 这个回调会在上面列出的属性变化时被调用，
  // 从自定义元素被解析开始，包括三态变化
  attributeChangedCallback(name, oldValue, newValue) {
    switch(name) {
      case "diameter":
        // 如果diameter属性改变了，更新大小样式
        this.style.width = newValue;
        this.style.height = newValue;
        break;
      case "color":
        // 如果color属性改变了，更新颜色样式
        this.style.backgroundColor = newValue;
        break;
    }
  }

  // 定义与元素的标签属性对应的JavaScript属性
  // 这些获取和设置方法只是获取和设置底层属性
  // 如果设置了JavaScript的属性，则修改底层的
  // 属性会触发调用attributeChangedCallback()
  // 而更新元素的样式
  get diameter() { return this.getAttribute("diameter", diameter); }
  set diameter(diameter) { this.setAttribute("diameter", diameter); }
  get color() { return this.getAttribute("color"); }
  set color(color) { this.setAttribute("color", color); }
});
```

## 15.6.4 影子 DOM

示例 15-2 定义的自定义元素并没有恰当地封装。比如，设置其 diameter 或 color 属性会导致其 style 属性被修改，而对于一个真正的 HTML 元素，这并不是我们希望看到的行为。要把一个自定义元素转换为真正的 Web 组件，还需要使用一个强大的封装机制：影子 DOM（shadow DOM）。

影子 DOM 允许把一个 “影子根节点”（shadow root）附加给一个自定义元素（也可以附加给<div>、、<body>、<article>、<main>、<nav>、<header>、<footer>、<section>、<p>、<blockquote>、<aside>或 <h1>到 <h6>元素），而后者被称为 “影子宿主”（shadow host）。影子宿主元素与所有 HTML 元素一样，随时可以作为包含后代元素和文本节点的正常 DOM 树的根。影子根节点则是另一个更私密的后代元素树的根，这些元素从影子根节点上生长出来，可以把它们当成一个迷你文档。

“影子 DOM” 中的 “影子” 指的是作为影子根节点后代的元素 “藏在影子里”。也就是说，这个子树并不属于常规 DOM 树，不会出现在它们宿主元素的 children 数组中，而且对 querySelector () 等常规 DOM 遍历方法也不可见。相对而言，影子宿主的常规、普通 DOM 子树有时候也被称为 “阳光 DOM”（light DOM）。

要理解影子 DOM 的用途，可以想象一下 HTML 的 <audio> 和 <video> 元素。这两个元素都会显示一个并不简单的用户界面，用于控制媒体播放，但播放和暂停按钮以及其他 UI 元素都不属于 DOM 树，不能通过 JavaScript 操控。既然浏览器是设计用来显示 HTML 的，那浏览器厂商只有使用 HTML 来显示这样的内部 UI 才是最自然的。事实上，多数浏览器很早就实现了这样的机制，只不过影子 DOM 让它成为 Web 平台的标准而已。

### 影子 DOM 封装

影子 DOM 的关键特性是它所提供的封装。影子根节点的后代对常规 DOM 树而言是隐藏且独立的，几乎就像它们是在一个独立的文档中一样。影子 DOM 提供了三种非常重要的封装。

- 前面已经提到过，影子 DOM 中的元素对 querySelectorAll () 等常规 DOM 方法是不可见的。在创建影子根节点并将其附加于影子宿主时，可以指定模式是 “开放”（open）还是 “关闭”（closed）。关闭的影子根节点将被完全封闭，不可访问。不过，影子根节点更多地是以 “开放” 模式创建的，这意味着影子宿主会有一个 shadowRoot 属性，如果需要，JavaScript 可以通过这个属性来访问影子根节点的元素。
- 在影子根节点之下定义的样式对该子树是私有的，永远不会影响外部的阳光 DOM 元素（影子根节点可以为其宿主元素定义默认样式，但这些样式可以被阳光 DOM 样式覆盖）。类似地，应用给影子宿主元素的阳光 DOM 样式也不会影响影子根节点。影子 DOM 中的元素会从阳光 DOM 继承字体大小和背景颜色等，而影子 DOM 中的样式可以与选择使用阳光 DOM 中定义的 CSS 变量。不过在大多数情况下，阳光 DOM 的样式与影子 DOM 的样式是完全独立的。因此 Web 组件的作者和 Web 组件的用户不用担心他们的样式会冲突或抵触。可以像这样限定 CSS 的范围或许是影子 DOM 最重要的特性。
- 影子 DOM 中发生的某些事件（如 “load”）会被封闭在影子 DOM 中。另外一些事件，像 focus、mouse 和键盘事件则会向上冒泡，穿透影子 DOM。当一个发源于影子 DOM 内的事件跨过了边界开始向阳光 DOM 传播时，其 target 属性会变成影子宿主元素，就好像事件直接起源于该元素一样。

### 影子 DOM 插槽和阳光 DOM 子元素

作为影子宿主的 HTML 元素有两个后代子树。一个是 children [] 数组，即宿主元素常规的阳光 DOM 后代；另一个则是影子根节点及其后代。有人可能会问：位于同一宿主元素中的两个完全不同的内容树是怎么显示的呢？下面是它们的工作原理：

- 影子根节点的后代始终显示在影子宿主内。
- 如果这些后代中包含一个 `<slot>` 元素，那么宿主元素的常规阳光 DOM 子元素会像它们本来就是该 `<slot>` 元素的子元素一样显示，替代该插槽中的任何影子 DOM 元素。
- 如果影子 DOM 不包含 `<slot>`，那么宿主的阳光 DOM 内容永远不会显示。如果影子 DOM 有一个 `<slot>`，但影子宿主没有阳光 DOM 子元素，那么该插槽的影子 DOM 内容作为默认内容显示。
- 当阳光 DOM 内容显示在影子 DOM 插槽中时，我们说那些元素 “已分配”（distributed），此时关键要理解：那些元素实际上并未变成影子 DOM 的一部分。使用 querySelector () 依旧可以查询它们，它们仍然作为宿主元素的子元素或后代出现在阳光 DOM 中。
- 如果影子 DOM 定义了多个 `<slot>`，且通过 name 属性为它们命名，那么影子宿主的阳光 DOM 后代可以通过 slot="slotname" 属性指定自己想出现在哪个插槽中。15.6.1 节展示过一个这种用法的例子，该例子演示了如何自定义由 `<search-box>` 组件显示的图标。

### 影子 DOM API

就其强大的能力而言，影子 DOM 并未提供太多 JavaScript API。要把一个阳光 DOM 元素转换为影子宿主，只要调用其 attachShadow () 方法，传入 {mode:"open"} 这个唯一的参数即可。这个方法返回一个影子根节点对象，同时也将该对象设置为这个宿主的`shadowRoot`属性的值。这个影子根节点对象是一个`DocumentFragment`，可以使用 DOM 方法为它添加内容，也可以直接将其`innerHTML`属性设置为一个 HTML 字符串。

如果你的 Web 组件想知道影子 DOM（slot）中的阳光 DOM 内容什么时候变化，那它可以直接在该`<slot>`元素上注册一个 “`slotchange`” 事件。

## 15.6.5 示例：`<search-box>` Web 组件

图 15-3 直观地展示了一个`<search-box>` Web 组件。示例 15-3 演示了定义 Web 组件的三种技术。这个示例用自定义元素实现了`<search-box>`组件，并使用`<template>`标签来提高效率，使用影子根节点做到了封装。

这个示例展示了如何直接使用低级 Web 组件 API。实践中，很多 Web 组件都是使用某个高级的库（比如`lite-element`）创建的。之所以使用库，一个原因是可重用且可定制的组件其实很难写好，很多细节都必须处理到位。示例 15-3 演示了如何实现 Web 组件并添加了一些基本的键盘焦点处理逻辑，但没有考虑无障碍，也没有使用恰当的 ARIA 属性，好让这个组件便于在屏幕阅读器和其他辅助技术中使用。

示例 15-3：实现 Web 组件

```javascript
/**
 * 这个类定义了一个自定义的HTML <search-box> 元素，用于显示一个
 * <input> 文本输入字段加两个图标或表情符号（emoji）。默认情况下，它
 * 在文本字段的左侧显示一个放大镜表情符号（表示搜索），在文本字段的右
 * 侧显示一个X表情符号（表示取消）。它会隐藏输入字段的边框，显示自己
 * 环绕一周的边框，让两个表情符号看起来位于输入字段的内部。类似地，当
 * 内部输入字段获得焦点时，焦点环也会显示在<search-box> 的周围
 *
 * 要覆盖默认的图标，可以让<search-box> 包含<span> 或<img> 子元素，
 * 并分别指定slots="left" 和slot="right" 属性
 *
 * <search-box> 支持正常的HTML的disabled和hidden属性，以及size
 * 和placeholder属性，它们对这个元素具有对<input> 元素一样的作用
 *
 * 内部的<input> 元素的输入事件会向上冒泡，事件目标会被设置为外部的
 * <search-box> 元素
 *
 * 当用户单击左侧的文字（放大镜）时，这个元素会发送“search”事件，
 * 事件对象的detail属性会设置为当前输入的字符串。另外，当内部文本
 * 字段发生“change”事件（文本发生变化且用户按下回车键或Tab键）时，
 * 也会触发这个“search”事件
 *
 * 当用户单击右侧表情符号（X）时，这个元素会发送“clear”事件。如果这个
 * 事件的处理程序没有调用preventDefault()，则这个元素会在事件触发
 * 完成时清除用户的输入
 *
 * 注意，HTML和JavaScript都没有onsearch和onclear属性。“search”
 * 和“clear”事件的处理程序只能通过addEventListener()来注册
 */
class SearchBox extends HTMLElement {
  constructor() {
    super(); // 调用超类的构造器；必须先调用

    // 创建一个影子DOM并将其附加到这个元素，
    // 设置为this.shadowRoot的值
    this.attachShadow({mode: "open"});

    // 克隆模板，模板定义了这个自定义组件的后代和样式，
    // 然后把内容添加到影子根节点
    this.shadowRoot.append(SearchBox.template.content.cloneNode(true));

    // 取得对影子DOM中重要元素的引用
    this.input = this.shadowRoot.querySelector("#input");
    let leftSlot = this.shadowRoot.querySelector('slot[name="left"]');
    let rightSlot = this.shadowRoot.querySelector('slot[name="right"]');

    // 当内部输入字段获得或失去焦点时，设置或移除
    // focused属性，以便样式表在整个组件上显示
    // 或隐藏人造的焦点环。注意，“blur”和“focus”
    // 事件会冒泡，就像起源自<search-box>一样
    this.input.onfocus = () => { this.setAttribute("focused", ""); };
    this.input.onblur = () => { this.removeAttribute("focused"); };

    // 如果用户点击了放大镜，则触发“search”事件。同样，
    // 在输入字段发生“change”事件时也触发这个事件
    // 注意：click事件不会冒泡到DOM外面
    leftSlot.onclick = (event) => {
      event.stopPropagation(); // 阻止事件冒泡冒泡
      if (this.disabled) return; // 如果被禁用则什么也不做
      this.dispatchEvent(new CustomEvent("search", {
        detail: this.input.value
      }));
    };

    // 如果用户单击了X，则触发“clear”事件。如果事件的
    // 处理程序没有调用preventDefault()，则清除输入
    rightSlot.onclick = (event) => {
      event.stopPropagation(); // 不让事件冒泡向上冒泡
      if (this.disabled) return; // 如果被禁用则什么也不做
      let e = new CustomEvent("clear", { cancelable: true });
      this.dispatchEvent(e);
      if (!e.defaultPrevented) { // 如果事件没有被取消
        this.input.value = ""; // 则清除输入字段
      }
    };

    // 在有些属性被设置或改变时，我们需要设置内部<input>
    // 元素对应的属性。个生命周期方法下面代码的静态属性
    // observedAttributes相互配合，实现回调
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "disabled") {
        this.input.disabled = newValue !== null;
      } else if (name === "placeholder") {
        this.input.placeholder = newValue;
      } else if (name === "size") {
        this.input.size = newValue;
      } else if (name === "value") {
        this.input.value = newValue;
      }
    }

    // 最后，为我们支持的HTML属性定义相应的获取方法和设置方法
    // 获取方法简单地返回属性的值（或存在与否），而设置方法也只
    // 是设置属性的值（或存在与否）。当某个设置方法修改了一个属性
    // 时，浏览器会自动调用上面的attributeChangedCallback回调
    get placeholder() { return this.getAttribute("placeholder"); }
    get size() { return this.getAttribute("size"); }
    get value() { return this.input.value; }
    get disabled() { return this.hasAttribute("disabled"); }
    get hidden() { return this.hasAttribute("hidden"); }

    set placeholder(value) { this.setAttribute("placeholder", value); }
    set size(value) { this.setAttribute("size", value); }
    set value(text) { this.setAttribute("value", text); }
    set disabled(value) {
      if (value) this.setAttribute("disabled", "");
      else this.removeAttribute("disabled");
    }
    set hidden(value) {
      if (value) this.setAttribute("hidden", "");
      else this.removeAttribute("hidden");
    }
  }

  // 这个静态属性对attributeChangedCallback方法是必需的
  // 只有在这个数组中列出的属性名才会触发对该方法的调用
  static get observedAttributes() { return ["disabled", "placeholder", "size", "value"]; }

  // 创建一个<template>元素，用于保存样式表和元素树，
  // 可以在每个SearchBox元素的实例中使用它
  static template = document.createElement("template");

  // 通过解析HTML字符串初始化模板。不过要注意，当实例化一个
  // SearchBox时，我们可以克隆这个模板中的节点，不需要再次
  // 解析HTML
  static {
    SearchBox.template.innerHTML = `
    <style>
      /* 这里的:host选择符引用的是阳光DOM中<search-box>元素
       * 这些样式是默认的，<search-box>的使用者可以通过阳光DOM中
       * 的样式来覆盖这些样式
       */
      :host {
        display: inline-block; /* 默认显示为行内块 */
        border: solid black 1px; /* 在<input>和<slots>周围添加圆角边框 */
        border-radius: 5px;
        padding: 4px 6px;       /* 边框内部留出适当间隙 */
      }
      :host([hidden]) {        /* 注意小括号：当宿主隐藏时…… */
        display: none;         /* ……通过属性设置为不显示 */
      }
      :host([disabled]) {      /* 当宿主有disabled属性时…… */
        opacity: 0.5;         /* ……将其变灰 */
      }
      :host([focused]) {       /* 当宿主有focused属性时…… */
        box-shadow: 0 0 2px 2px #04e; /* 显示人造的焦点环。*/
      }

      /* 剩下的样式表只应用给影子DOM中的元素。*/
      input {
        border-width: 0;      /* 隐藏内部输入字段的边框。*/
        outline: none;        /* 也隐藏焦点环*/
        font: inherit;        /* <input>元素默认不会继承字段*/
        color: inherit;       /* 背景颜色也需要明确继承 */
        background: inherit;
      }
      slot {
        cursor: default;      /* 光标移到按钮上显示箭头 */
        user-select: none;    /* 不让用户选择表情符号文本 */
      }
    </style>
    <div>
      <slot name="left">🔍</slot> <!-- U+1F50D是放大镜 -->
      <input type="text" id="input" /> <!-- 实际的输入元素 -->
      <slot name="right">❌</slot> <!-- U+274C是叉号 -->
    </div>
    `;
  }

  // 最后，我们调用customElement.define()将SearchBox元素
  // 注册为<search-box>标签的实现。自定义元素的标签名中必须
  // 包含一个连字符
}

customElements.define("search-box", SearchBox);
```

# 15.7 可伸缩矢量图形

SVG（Scalable Vector Graphics，可伸缩矢量图形）是一种图片格式。名字中的 “矢量” 代表着它与 GIF、JPEG、PNG 等指定像素值矩阵的光栅（raster）图片格式有着根本的不同。SVG “图片” 是一种对绘制期望图形的精确的、分辨率无关（因而 “可伸缩”）的描述。SVG 图片是在文本文件中通过（与 HTML 类似的）XML 标记语言描述的。

在浏览器中有几种方式使用 SVG：

- 可以在常规的 HTML `<img>` 标签中使用 `.svg` 图片文件，就像使用 `.png` 或 `.jpeg` 图片一样。
- 因为基于 XML 的 SVG 格式与 HTML 很类似，所以可以直接把 SVG 标签嵌入在 HTML 文档中。此时，浏览器的 HTML 解析器允许省略 XML 命名空间，并将 SVG 标签当或 HTML 标签一样处理。
- 可以使用 DOM API 动态创建 SVG 元素，按需生成图片。

接下来几小节将演示 SVG 的第二种和第三种用法。不过，要注意 SVG 本身的语法规则很多，还是比较复杂的。除了简单的图形绘制语法，SVG 还支持任意曲线、文本和动画。SVG 图形甚至可以与 JavaScript 脚本和 CSS 样式表组合，以添加行为和表现信息。完整介绍 SVG 确实超出了本书范围。本节的目标仅限于展示如何在 HTML 文档中使用 SVG，以及通过 JavaScript 来操控它。

## 15.7.1 在 HTML 中使用 SVG

SVG 图片当然可以使用 HTML 的 `<img>` 标签来显示，但也可以直接在 HTML 嵌入 SVG，而且在嵌入 SVG 后，甚至可以使用 CSS 样式表来指定字体、颜色和线宽。比如，下面就是在 HTML 中使用 SVG 显示一个模拟时钟表盘的例子：

```html
<!DOCTYPE html>
<html>
<head>
<title>Analog Clock</title>
<style>
/* 这些CSS样式会应用给下面定义的SVG元素 */
#clock {
  stroke: black;             /* 通用于整个时钟的样式：*/
  stroke-linecap: round;     /* 圆形端点 */
  fill: #f6f;                /* 黑色线条 */
}                            /* 放在灰白色背景上 */
#clock .face { stroke-width: 3; }  /* 表盘的轮廓 */
#clock .ticks { stroke-width: 2; }  /* 标记每小时刻度线 */
#clock .hands { stroke-width: 2; }  /* 标记每小时刻度 */
#clock .numbers { stroke-width: 3; } /* 怎么绘制时针 */
  font-family: sans-serif; font-size: 15; font-weight: bold;
  text-anchor: middle; stroke: none; fill: black;
}
</style>
</head>
<body>
<svg id="clock" viewBox="0 0 100 100" width="250" height="250">
  <!-- 这里的width和height属性定义图形在屏幕上的大小 -->
  <!-- viewBox属性用于定义图形内部的坐标系 -->
  <circle class="face" cx="50" cy="50" r="45"/> <!-- the clock face -->
  <g class="ticks"> <!-- 12小时的刻度 -->
    <line x1="50" y1="5.000" x2="50.00" y2="10.00"/>
    <line x1="72.50" y1="11.03" x2="70.00" y2="15.36"/>
    <line x1="88.97" y1="27.50" x2="84.64" y2="30.00"/>
    <line x1="95.00" y1="50.00" x2="90.00" y2="50.00"/>
    <line x1="88.97" y1="72.50" x2="84.64" y2="70.00"/>
    <line x1="72.50" y1="88.97" x2="70.00" y2="84.64"/>
    <line x1="50.00" y1="95.00" x2="50.00" y2="90.00"/>
    <line x1="27.50" y1="88.97" x2="30.00" y2="84.64"/>
    <line x1="11.03" y1="72.50" x2="15.36" y2="70.00"/>
    <line x1="5.000" y1="50.00" x2="10.00" y2="50.00"/>
    <line x1="11.03" y1="27.50" x2="15.36" y2="30.00"/>
    <line x1="27.50" y1="11.03" x2="30.00" y2="15.36"/>
  </g>
  <g class="numbers"> <!-- 用数字标识基本方向 -->
    <text x="50" y="18">12</text><text x="85" y="53">3</text>
    <text x="50" y="88">6</text><text x="15" y="53">9</text>
  </g>
  <g class="hands"> <!-- 绘制一个指向上方的表针 -->
    <line class="hourhand" x1="50" y1="50" x2="50" y2="25"/>
    <line class="minutehand" x1="50" y1="50" x2="50" y2="20"/>
  </g>
</svg>
<script src="clock.js"></script>
</body>
</html>
```

可以看到，`<svg>` 标签的后代并非标准的 HTML 标签。不过，`<circle>`、`<line>` 和 `<text>` 标签的含义都显而易见，这个 SVG 图形也很容易理解。当然，SVG 还有很多其他标签，要学习的话需要大家自己去找相关的资料。另外，你可能也注意到样式表有点奇怪了。`fill`、`stroke-width` 和 `text-anchor` 并不是标准的 CSS 样式属性。在这里，CSS 本质上是被用于设置文档中出现的 SVG 标签的属性。还要注意，CSS 简写的 `font` 属性对 SVG 标签不起作用，因此必须要分别设置 `font-family`、`font-size` 和 `font-weight` 属性。

## 15.7.2 编程操作 SVG

直接在 HTML 文件中嵌入 SVG（而不是使用静态`<img>`标签）的一个原因，就是这样可以使用 DOM API 来操作 SVG 图片。假设你想使用 SVG 在网页中显示一个图标。可以把 SVG 嵌入一个`<template>`标签中（参见 15.6.2 节），然后在需要向 UI 中插入图标副本时就克隆这个模板的内容。如果想让图标响应用户活动（比如在鼠标指针悬停在图标上时改变颜色），那通常可以使用 CSS 来实现。

操作直接嵌入在 HTML 中的 SVG 图形也是可能的。上一节中的那个表盘的示例显示的是一个静态时钟，时针和分针都指向正上方，表明时间为中午或半夜。不过有读者可能也注意到了，那个示例的 HTML 文件中包含一个`<script>`标签。这个标签引入的脚本会周期性地运行一个函数，该函数会检查时间并旋转时针和分针对准相应的度数，从而让时钟真正反映当前时间，如图 15-5 所示。





操作时钟的代码很好理解。它会根据当前时间来确定时针和分针的适当角度，然后使用`querySelector()`找到显示这两个表针的 SVG 元素，设置它们的`transform`属性，围绕表盘的中心旋转相应的角度。这个函数使用`setTimeout()`来确保表针每 10 秒转动一次：

```javascript
(function updateClock() { // 更新SVG时钟，显示当前时间
  let now = new Date();    // 当前时间
  let sec = now.getSeconds();
  let min = now.getMinutes() + sec/60;    // 分数形式的分钟
  let hour = (now.getHours() % 12) + min/60; // 分数形式的小时
  let mangle = min * 6;   // 每分钟6度
  let hourangle = hour * 30; // 每小时30度

  // 取得显示表针的SVG元素
  let mhand = document.querySelector("#clock .minutehand");
  let hhand = document.querySelector("#clock .hourhand");

  // 设置SVG属性，围绕表盘移动表针
  mhand.setAttribute("transform", `rotate(${mangle},50,50)`);
  hhand.setAttribute("transform", `rotate(${hourangle},50,50)`);

  // 10秒钟后再次运行这个函数
  setTimeout(updateClock, 10000);
})(); // 注意在这里立即调用函数
```

## 15.7.3 通过 JavaScript 创建 SVG 图片

除了使用脚本简单地操作嵌入在 HTML 文档中的 SVG 图片，还可以通过 JavaScript 来创建 SVG 图片，这在可视化动态加载的数据时很有用。示例 15-4 展示了如何使用 JavaScript 创建 SVG 饼图，结果类似图 15-6 所示。

尽管可以把 SVG 标签包含在 HTML 文档中，严格来讲它们仍然是 XML 标签，不是 HTML 标签。如果想通过 JavaScript DOM API 创建 SVG 元素，那就不能使用 15.3.5 节介绍的`createElement()`函数，而必须使用`createElementNS()`，这个函数的第一个参数是 XML 命名空间文字串。对 SVG 而言，命名空间是文字串`"http://www.w3.org/2000/svg"`。





除了使用`createElementNS()`，示例 15-4 中绘制饼图的代码都比较容易理解。只有把要绘制的数据转换为扇形的角度时涉及一点数学，其余代码基本上都是创建 SVG 元素然后设置它们属性的 DOM 代码。

这个示例中最难理解的部分就是绘制每个扇形。用于显示每个弧形的元素是`<path>`。这个 SVG 元素可以描述由任意直线和曲线组成的形状。对形状的描述通过`<path>`元素的`d`属性来指定。这个属性的值使用字母编码和数值的简略语法，指定了坐标、角度和其他值。比如，字母 M 表示 “move to”（移动到），后面紧跟着 x 和 y 坐标。字母 L 表示 “line to”（画到线），即从当前坐标画一条直线到后面紧跟的坐标点。这个示例也使用了字母 A 来绘制弧形（arc），后面紧跟的 7 个数值描述了这个圆弧，如果想了解更多相关细节，可以上网查询相关语法。

示例15-4：使用 JavaScript 和 SVG 绘制饼图

```javascript
/*
 * 创建一个<svg>元素并在其中绘制一个饼图
 * 这个函数接收一个对象参数，包含下列属性：
 *   width, height: SVG图形的大小，以像素为单位
 *   cx, cy, r: 饼图的圆心和半径
 *   tx, ty: 图例的左上角坐标
 *   data: 对象，其属性名是数据标签，属性值是对应的值
 * 这个函数返回一个<svg>元素。调用者必须把它插入文档
 * 才可以看到饼图
 */
function pieChart(options) {
  let {width, height, cx, cy, r, tx, ty, data} = options;

  // 这是SVG元素的XML命名空间
  let svg = "http://www.w3.org/2000/svg";

  // 创建<svg>元素，指定像素大小及用户坐标
  let chart = document.createElementNS(svg, "svg");
  chart.setAttribute("width", width);
  chart.setAttribute("height", height);
  chart.setAttribute("viewBox", `0 0 ${width} ${height}`);

  // 定义图例的文本样式。如果不在这里设置这些值
  // 也可以使用CSS来设置
  chart.setAttribute("font-family", "sans-serif");
  chart.setAttribute("font-size", "18");

  // 取得数值形式的标签和值，并计算所有值的总和
  // 从而知道这张饼到底有多大
  let labels = Object.keys(data);
  let values = Object.values(data);
  let total = values.reduce((x,y) => x+y);

  // 计算每个弧形的角度。弧形i的起始角度为angles[i]
  // 结束角度为angles[i+1]。这里角度以弧度表示
  let angles = [0];
  values.forEach(x => angles.push(angles[angles.length-1] + x/total * 2 * Math.PI));

  // 现在遍历饼图的所有扇形
  values.forEach((value, i) => {
    // 计算扇形圆弧相接的两点
    // 下面的公式可以保证角度θ为
    // 12点方向，正角度顺时针增长
    let x1 = cx + r * Math.sin(angles[i]);
    let y1 = cy - r * Math.cos(angles[i]);
    let x2 = cx + r * Math.sin(angles[i+1]);
    let y2 = cy - r * Math.cos(angles[i+1]);

    // 这是一个表示角度大于半圆的标志
    // 它对于SVG弧形绘制是必需的
    let big = (angles[i+1] - angles[i] > Math.PI) ? 1 : 0;

    // 描述如何绘制饼图中一个扇形的字符串。
    let path = `M${cx},${cy}` +       // 移动到圆心
      `L${x1},${y1}` +               // 画一条直线到(x1,y1)
      `A${r},${r} 0 ${big} 1 ${x2},${y2}` + // 画一条半径为r的圆弧……
      `Z`;                           // 在(cx,cy)点关闭路径

    // 计算这个扇形的CSS颜色。这个公式只适合计算15扇形
    // 15种颜色，因此不要在一个饼图中包含超过15扇形
    let color = `hsl(${(i*40)%360},${90-3*i}%,${50+2*i}%)`;

    // 使用<path>元素描述每个扇形，注意createElementNS()
    let slice = document.createElementNS(svg, "path");

    // 现在设置<path>元素的属性
    slice.setAttribute("d", path);        // 设置当前扇形的路径
    slice.setAttribute("fill", color);    // 设置扇形的颜色
    slice.setAttribute("stroke", "black");// 扇形轮廓为黑色
    slice.setAttribute("stroke-width", "1");// 宽度为1 CSS像素

    chart.appendChild(slice);             // 把扇形添加到饼图

    // 现在为对应的键画一个匹配的小方块
    let icon = document.createElementNS(svg, "rect");
    icon.setAttribute("x", tx);           // 定位方块
    icon.setAttribute("y", ty + 30*i);
    icon.setAttribute("width", 20);       // 设置大小
    icon.setAttribute("height", 20);
    icon.setAttribute("fill", color);     // 与扇形相同的填充色
    icon.setAttribute("stroke", "black"); // 相同的描边颜色
    icon.setAttribute("stroke-width", "1");

    chart.appendChild(icon);              // 把图标添加到饼图

    // 在小方块右侧添加一个标签
    let label = document.createElementNS(svg, "text");
    label.setAttribute("x", tx + 30);     // 定位文本
    label.setAttribute("y", ty + 30*i + 16);
    label.appendChild(document.createTextNode(`${labels[i]} ${value}`)); // 把文本添加到标签

    chart.appendChild(label);             // 把标签添加到饼图
  });

  return chart;
}
```

要生成图 15-6 所示的饼图，可以像下面这样调用示例 15-4 定义的`pieChart()`函数：

```javascript
document.querySelector("#chart").append(pieChart({
  width: 640, height: 400,
  cx: 200, cy: 200, r: 180, // 饼图的中心和半径
  tx: 400, ty: 10,          // 图例的位置
  data: {
    "JavaScript": 71.5,
    "Java": 45.4,
    "Bash/Shell": 40.4,
    "Python": 37.9,
    "C#": 35.3,
    "PHP": 31.4,
    "C++": 24.6,
    "C": 22.1,
    "TypeScript": 18.3,
    "Ruby": 10.3,
    "Swift": 8.3,
    "Objective-C": 7.3,
    "Go": 7.2,
  	'C#': 35.3,
  	'PHP': 31.4,
  	'C++': 24.6,
  	'C': 22.3,
  	'TypeScript': 18.3,
  	'Ruby': 18.3,
  	'Swift': 8.3,
  	'Objective-C': 7.3,
  	'Go': 7.2,
  }
}));
```

# 15.8 `<canvas>` 与图形

在 HTML 文档中，`<canvas>` 元素本身并不可见，它只是创建了一个绘图表面并向客户端 JavaScript 暴露了强大的绘图 API。`<canvas>` API 与 SVG 的主要区别在于使用画布（canvas）绘图要调用方法，而使用 SVG 创建图形则需要构建 XML 元素树。这两种绘图手段同样强大，而且可以相互模拟。但从表面上来看，这两种手段迥然不同，又有各自的优缺点。比如，修改 SVG 图形很简单，可能只需从描述中删除元素即可。而要从同样的 `<canvas>` 图形中删除元素通常需要先擦掉图形再重新绘制。由于画布绘图 API 是基于 JavaScript 的，而且相对比较简洁（不像 SVG 语法那么复杂），因此本书会更详细地加以介绍。

>画布中的 3D 图形
>
>在调用 `getContext()` 时传入 `"webgl"` 也可以获取一个 3D 图形上下文，并使用 WebGL API 来绘制 3D 图形。WebGL API 是一套庞大、复杂、低级的 JavaScript API，开发者通过它可以访问 GPU、写自定义的着色器，以及执行其他非常强大的图形操作。但本书没有介绍 WebGL，因为实际开发中多数都会使用构建于 WebGL 之上的工具库，而不是直接使用 WebGL API。

大多数画布绘图 API 都没有定义在 `<canvas>` 元素上，而是定义在通过画布的 `getContext()` 方法获得的 “绘图上下文” 上。调用 `getContext()` 时传入 `"2d"` 可以得到一个 `CanvasRenderingContext2D` 对象，使用它能在画布上绘制二维图形。

作为 Canvas API 的一个简单示例，以下 HTML 文档使用了 `<canvas>` 元素和一些 JavaScript 展示了两个简单的形状：

```html
<p>This is a red square: <canvas id="square" width=10 height=10></canvas>.</p>
<p>This is a blue circle: <canvas id="circle" width=10 height=10></canvas>.</p>
<script>
  let canvas = document.querySelector("#square"); // 取得第一个画布元素
  let context = canvas.getContext("2d");
  context.fillStyle = "#ff0000";
  context.fillRect(0,0,10,10);

  canvas = document.querySelector("#circle");
  context = canvas.getContext("2d");
  context.beginPath();
  context.arc(5, 5, 5, 0, 2*Math.PI, true);
  context.fillStyle = "#00ff";
  context.fill();
</script>
```

我们知道，SVG 将复杂图形描述为可以绘制和填充的直线 “路径” 或曲线。而 Canvas API 也使用了路径的概念，但它没有使用字母和数字的字符串来描述路径，而是通过一系列方法调用来定义路径。比如前面例子中的 `beginPath()` 和 `arc()` 调用。定义了路径之后，后面的方法调用（如 `fill()`）就会操作该路径。上下文对象的各种属性（如 `fillStyle`）用于指定如何执行操作。

接下来几小节将演示 2D Canvas API 的方法和属性，其中多数示例中的代码都会操作一个变量 `c`。这个变量保存的是画布的 `CanvasRenderingContext2D` 对象。不过示例中经常会省略初始化该变量的代码。为了让这些示例跑起来，读者需要自行在 HTML 中添加 `<canvas>` 元素并指定相应的 `width` 和 `height` 属性，然后再添加类似下面的代码以初始化变量 `c`：

```javascript
let canvas = document.querySelector("my_canvas_id");
let c = canvas.getContext("2d");
```

## 15.8.1 路径与多边形

要在画布上画线或者填充由这些线包围的区域，首先需要定义一个路径。路径是一个或多个子路径的序列。而子路径则是两个或多个通过线段（或曲线段）连接起来的点的序列。开始新路径要调用 `beginPath()` 方法，而开始定义子路径要调用 `moveTo()` 方法。在通过 `moveTo()` 建立起子路径的起点后，可以调用 `lineTo()` 将该点连接到一个新的点。以下代码定义了一个包含两个线段的路径：

```javascript
c.beginPath();    // 开始一个新路径
c.moveTo(100,100); // 开始一个子路径，起点为(100,100)
c.lineTo(200, 200); // 用线段连接点(100,100)和(200,200)
c.lineTo(100, 200); // 用线段连接点(200,200)和(100,200)
```

这几行代码定义了一个路径，但并没有在画布上绘制任何东西。要绘制（或 “描画”）路径中的两条线段，必须调用 `stroke()` 方法，而要填充这些线段定义的区域，则要调用 `fill()` 方法：

```javascript
c.fill();    // 填充三角形区域
c.stroke();  // 描画三角形的两条边
```

以上代码（加上其他设置线宽和填充色的代码）可以产生如图 15-7 所示的图形。







我们注意到，图 15-7 定义的子路径是 “开放的”。整个路径只包含两条线段，而且终点并未连接到起点。这意味着图中的三角形区域并不是闭合的区域。`fill()` 方法在填充开放路径时，就好像有一条直线连接了子路径的终点与起点一样。这也是为什么以上代码填充的是三角形区域，而描画的只有三角形的两条边。

如果想描画这个三角形的所有边，必须调用 `closePath()` 把子路径的终点连接到起点（也可以调用 `lineTo(100,100)`，但这样做的结果是得到三条共享起点和终点的线段，路径并没有真正闭合。在用笔线画图时，还是使用 `closePath()` 的视觉效果更好）。

关于 `stroke()` 和 `fill()` 还有另外两个地方需要注意。首先，两个方法都作用于当前路径的所有子路径。假设我们在前面的代码中又添加了另一条子路径：

```javascript
c.moveTo(300,100); // 在(300,100)开始一条新子路径
c.lineTo(300,200); // 画一条垂线到点(300,200)
```

如果此时调用 `stroke()`，则会描画三角形的两条边和一条不相连的垂线。

关于 `stroke()` 和 `fill()` 要注意的第二点是这两个方法都会修改当前路径。换句话说，调用 `fill()` 之后再调用 `stroke()` 路径仍然还在那里。在操作完一条路径后，如果想开始另一条路径，必须调用 `beginPath()`。如果没有调用，则只会在已有路径上面添加子路径，最终可能是在重复绘制原来的路径。

示例 15-5 定义了一个函数，可以用来绘制普通多边形，其中演示了 `moveTo()`、`lineTo()` 和 `closePath()` 定义路径，以及 `fill()` 和 `stroke()` 绘制这些路径。这个示例可以绘制出如图 15-8 所示的图形。

示例 15-5：使用 `moveTo()`、`lineTo()` 和 `closePath()` 绘制普通多边形

```javascript
// 定义 n 边的普通多边形，以(x,y)为中心，r 为半径
// 多边形顶点到中心间隔相同的距离
// 第一个顶点放在( x + r, y )，或者放在指定的角度上
// 顺时针旋转，除非最后一个参数为 true
function polygon(c, n, x, y, r, angle=0, counterclockwise=false) {
  c.moveTo( x + r*Math.sin(angle), // 从第一个顶点开始一条新子路径
            y - r*Math.cos(angle)); // 使用三角函数计算位置
  let delta = 2*Math.PI / n;       // 对每个角的大小
  for(let i = 1; i < n; i++) {     // 绘制下面每个顶点
    angle += counterclockwise?-delta:delta; // 调整角度
    c.lineTo(x + r*Math.sin(angle), // 添加到下一个顶点的线
             y - r*Math.cos(angle));
  }
  c.closePath();                   // 把最后一个顶点连接到第一个顶点
}

// 假设只有一个画布，获得其上下文以便画图
let c = document.querySelector('canvas').getContext("2d");

// 开始一段新路径并添加多边形子路径
c.beginPath();
polygon(c, 3, 50, 70, 50);         // 三角形
polygon(c, 4, 150, 80, 50, Math.PI/4); // 正方形
polygon(c, 5, 250, 80, 50);         // 五边形
polygon(c, 6, 350, 80, 50, Math.PI/6); // 六边形
polygon(c, 4, 355, 52, 20, Math.PI/4, true); // 六边形中再画一个小正方形

// 设置一些属性控制图形的外观
c.fillStyle = "#ccc";    // 内部浅灰色
c.strokeStyle = "#008";  // 轮廓深蓝色
c.lineWidth = 5;         // 宽度 5 像素

// 现在通过以下调用来绘制所有多边形（每个都在自己的子路径中）
c.fill();                // 填充形状
c.stroke();              // 描画轮廓
```

注意，这个示例绘制了一个包含正方形的六边形，这个正方形和六边形是由独立的子路径组成的，但它们重叠在一起了。每当这时候（或一条子路径与自身交叉时），画布都需要确定哪个区域在路径内部，哪个区域在路径外部。为此，画布使用一种被称为 “非零环绕规则”（nonzero winding rule）的测试来确定这件事。在上面的示例中，之所以正方形内部没有被填充，是因为正方形和六边形是以相反方向来绘制的。换句话说，六边形的顶点是通过顺时针方向移动的线段连接的，而正方形的顶点是逆时针方向连接的。假如正方形也是顺时针方向绘制的，则调用 `fill()` 也会填充正方形的内部区域。

## 15.8.2 画布大小与坐标

在 HTML 中通过 `<canvas>` 的 `width` 和 `height` 属性，或者在 JavaScript 中通过画布对象的 `width` 和 `height` 属性可以指定画布的大小。画布坐标系的默认原点在画布左上角的 (0,0) 点。x 坐标向右增大，y 坐标向下增大。画布中的点可以使用浮点值来指定。

要修改画布大小必须完全重置画布。无论设置画布对象的 `width` 属性还是 `height` 属性（即使设置为当前值），都会清除画布，擦掉当前路径，重置所有图形属性（包括当前变换和剪切区域）至其最初状态。

在 HTML 中指定 `<canvas>` 的 `width` 和 `height` 属性确定画布的实际像素数。每个像素在内存里会分配 4 个字节，因此如果 `width` 和 `height` 都是 100，则画布在内存中会用 40 000 个字节来表示 10 000 个像素。

此外，HTML 的 `width` 和 `height` 属性也指定了画布在屏幕上（以 CSS 像素）显示的默认大小。如果 `window.devicePixelRatio` 是 2，则 100×100 CSS 像素实际上对应 40 000 个硬件像素。当画布内容绘制到屏幕上时，内存中的 10 000 个像素需要放大为屏幕上的 40 000 个物理像素，这意味着你看到的图形会变模糊。

为优化图片质量，不要在 HTML 中使用 `width` 和 `height` 属性设置画布的屏幕大小，而要使用 CSS 的样式属性 `width` 和 `height` 来设置画布在屏幕上的预期大小。然后在通过 JavaScript 开始绘制前，再将画布对象的 `width` 和 `height` 属性设置为 CSS 像素数乘以 `window.devicePixelRatio`。仍以前面 100×100 CSS 像素大小的画布为例，这样会导致画布显示为 100×100 CSS 像素，但内存中会分配 200×200 像素（即使是这样，用户如果放大画布也可能会导致图形模糊或变成马赛克。相对而言，SVG 图形在这种情况下则会保持边缘锐利，无论屏幕显示多大或是否缩放）。

## 15.8.3 图形属性

示例 15-5 在画布上下文对象上设置了属性 `fillStyle`、`strokeStyle` 和 `lineWidth`，这些属性都是图形属性，`fill()` 和 `stroke()` 会使用前两个来确定颜色，第三个决定 `stroke()` 作为画线时的宽度。注意它们并没有作为参数传给 `fill()` 和 `stroke()` 方法，而是在画线时的图形状态存在。如果你定义了一个方法要绘制某种形状，但并未设置这些属性，那么这个方法的调用方可以在调用之前通过设置 `strokeStyle` 和 `fillStyle` 属性自定义形状的颜色。这种图形状态与绘制命令分离的思想是 Canvas API 的基础，类似于 CSS 样式表与 HTML 文档分离的理念。

上下文对象上的一些属性（和方法）都会影响画布的图形状态，下面我们分别介绍。‘

### 线条样式

`lineWidth` 属性指定 `stroke()` 绘制的线条有多宽，默认值为 1。这里要理解，线宽是在调用 `stroke()` 的时候由 `lineWidth` 属性确定的，而非在调用 `lineTo()` 或其他路径构建方法时确定的。要真正理解 `lineWidth` 属性，关键是要从视觉上把路径想象成无穷细的一维线条。而 `stroke()` 方法在画直线和曲线时会让它们在路径上面居中，两侧各画一半的 `lineWidth`。如果你画的是一条封闭路径，只想让线条出现在路径外侧，应该先把路径的轮廓让出来，然后再使用不透明的颜色填充，以盖住位于路径内侧的部分线条。如果你只想画出封闭路径的内侧出现线条，可以先调用 `save()` 和 `clip()` 方法，然后再调用 `stroke()` 和 `restore()`（稍后介绍 `save()`、`restore()` 和 `clip()` 方法）。

在绘制超过两像素宽的线条时，`lineCap` 和 `lineJoin` 属性会显著影响路径两端或者两条路径交点的样式。图 15-9 展示了 `lineCap` 和 `lineJoin` 属性的值以及它们对应的图形外观。



`lineCap` 的默认值是平头（`butt`），`lineJoin` 的默认值是斜接（`miter`）。不过如果两条线相交的角度很小，斜接会导致相交角变得非常长，看起来不舒服。如果某个相交角斜接后长度超过线宽一半乘以 `miterLimit` 属性，则这个相交角将改为斜切（`bevel`）而非斜接（`miter`）相交。`miterLimit` 的默认值为 10。

`stroke()` 方法既可以画虚线、点线，也可以画实线。而画布的图形状态中也有一组数字可以用作 “虚线模式”，即通过数字描述画多少像素、忽略多少像素。与其他线条绘制属性不同，虚线模式要通过 `setLineDash()` 和 `getLineDash()` 方法而不是一个属性来设置和获取。要指定点线模式，可以像下面这样使用 `setLineDash()`：

```javascript
c.setLineDash([10, 3, 3, 3]); // 10px 虚线、3px 空隙、3px 虚线、3px 空隙
```

最后，`lineDashOffset` 属性指定虚线模式从哪里开始绘制，默认值为 0。上面示例中设置的虚线模式在绘制到封闭路径时会以 18 像素的虚线开始。但是，如果这里把 lineDashOffset 设置为 21，则该路径将以点开始，后跟空格和虚线。

### 颜色、模式与渐变

`fillStyle` 和 `strokeStyle` 属性指定如何填充和描绘路径。属性名中的 “style” 通常指颜色，但这些属性也可以用来指定渐变色甚至图片，用以填充或描绘路径（注意，画一条线与填充这条线两端很窄的范围基本上相同，填充和描绘本质上是相同的操作）。

如果想以实色（或半透明色）填充或描绘，只要把这些属性设置为有效的 CSS 颜色字符串即可。

如果想以渐变色填充（或描绘），需要将 `fillStyle`(或 `strokeStyle`) 设置为 `CanvasGradient` 对象，这个对象需要调用上下文的 `createLinearGradient()` 或 `createRadialGradient()` 方法返回。`createLinearGradient()` 方法的参数是定义一条直线的两个点的坐标（不一定水平或垂直），颜色将在这条直线的方向上渐变。`createRadialGradient()` 的参数需要指定两个圆心和半径（这两个圆不一定是同心圆，但通常第一个圆会完全落在第二个圆内部）。小圆内部区域或大圆外部区域将被实色填充，这两个区域之间的部分则会以渐变色填充。

创建了表示要填充的画布区域的 `CanvasGradient` 对象后，必须调用这个对象的 `addColorStop()` 方法定义渐变色。这个方法的第一个参数是一个介于 0.0 和 1.0 之间的数值，第二个参数是一个 CSS 颜色说明。为定义一个简单的渐变色，至少必须调用这个方法两次，但有可能还不止两次。位于 0.0 处的颜色是渐变的起点，位于 1.0 处的颜色是渐变的终点。如果要指定更多颜色，这些颜色应该出现在渐变中特定的小数位置。在指定的这些点之间，颜色会平滑地过渡。下面是几个示例：

```javascript
// 画布对角方向的线性渐变（假设画布没有变形）
let bgfade = c.createLinearGradient(0,0, canvas.width, canvas.height);
bgfade.addColorStop(0.0, "#88F"); // 左上角开始于浅蓝色
bgfade.addColorStop(1.0, "#FFF"); // 渐变到右下角的白色

// 两个同心圆之间的渐变。中间完全透明渐变为半透明的灰色，再渐变为完全透明
let donut = c.createRadialGradient(300,300,100, 300,300,300);
donut.addColorStop(0.0, "transparent"); // 透明
donut.addColorStop(0.7, "rgba(100,100,100,.9)"); // 半透明灰
donut.addColorStop(1.0, "rgba(0,0,0,0)"); // 又透明了
```

理解渐变最重要的一点是它们是跟位置紧密相关的。每次创建渐变，都需要为它指定界限。如果想填充这些界限之外的区域，使用的将是定义该渐变两端的某个实色。

除了实色和渐变色，填充和描绘时也可以使用图片。为此，需要将 `fillStyle` 或 `strokeStyle` 设置为上下文的 `createPattern()` 方法返回的 `CanvasPattern` 对象。这个方法的第一个参数应该是 `<img>` 或 `<canvas>` 元素，其中包含填充或描绘要使用的图片（注意，在这样使用的时候图片和画布并不需要插入文档中）。`createPattern()` 的第二个参数是字符串 “repeat”“repeat-x”“repeat-y” 或 “no-repeat”，用于指定背景图片是否（以及在哪个方向上）重复。

### 文本样式

`font` 属性指定 `fillText()` 和 `strokeText()` 方法（参见下一节）在绘制文本时使用的字体。这个属性的值应该是一个字符串，语法与 CSS 的 `font` 属性相同。

`textAlign` 属性指定文本的水平对齐方式，相对于传给 `fillText()` 或 `strokeText()` 的 X 坐标。合法的值包括 start、left、center、right 和 end。默认值为 start，在从左到右的文本中效果与 left 相同。

`textBaseline` 属性指定文本相对于 Y 坐标如何垂直对齐。默认值是 `alphabetic`，适合拉丁字母或类似文字。对于汉语或日语，应该使用 `ideographic`。对于（印度很多语言中使用的）梵文及类似文字，可以使用 `hanging`。其他比如 top、middle 和 bottom 值纯粹是几何意义上的基线，基于字体的 “em 方块”。

### 阴影

上下文对象有 4 个属性控制阴影的绘制。适当地设置这些属性，可以为绘制的任何线条、区域、文本或图片添加阴影，让它们就像悬浮在画布上方一般。

`shadowColor` 属性指定阴影颜色。默认值是完全透明的黑色，因此除非将这个属性设置为半透明或不透明，否则不会出现阴影。这个属性只能设置为颜色字符串，阴影不支持模式和渐变。使用半透明阴影色可以产生最真实的阴影效果，因为透过阴影可以看到背景。

`shadowOffsetX` 和 `shadowOffsetY` 属性指定阴影的 X 轴和 Y 轴偏移量。这两个属性的默认值都是 0，即阴影将位于绘制内容的正下方，因而不可见，如果给这两个属性正值，阴影会出现在内容下方和右侧。就像屏幕外面左上角有光源照射到画布一样。偏移量越大阴影也越大，绘制内容看起来距离画布表面也 “更高”。这些值不受坐标变换（参见 15.8.5 节）影响，即使形状旋转或缩放了，阴影方向和 “高度” 也会保持不变。

`shadowBlur` 属性指定阴影边缘的模糊程度。默认值 0 会产生锐利、丝毫不模糊的阴影。这个值越大，模糊越厉害，上限由实现定义。

### 半透明与合成效果

如果想用半透明色描绘或填充路径，可以使用类似 “`rgba(...)`” 这样支持透明值的 CSS 颜色语法设置 `strokeStyle` 或 `fillStyle`。RGBA 中的 A 代表 Alpha，是一个介于 0（完全透明）和 1（完全不透明）之间的值。Canvas API 还提供了另一种使用透明色的方式。如果不想分别指定每个颜色的 Alpha 通道，或者想给不透明的图片或模型添加透明效果，可以设置 `globalAlpha` 属性。这样绘制的每个像素的透明度值都会乘上 `globalAlpha`。默认值是 1，完全不透明。如果把 `globalAlpha` 设置为 0，那么绘制的一切都会变成完全透明。如果把它设置为 0.5，那么原先不透明的像素都会变成 50% 不透明，原先 50% 不透明的像素会变成 25% 不透明。

在描绘线条、填充区域、绘制文本或复制图像时，我们通常希望新像素绘制到画布中已存在像素上。如果绘制的是不透明像素，它们会直接替换相应位置上的已有像素。如果绘制的是半透明像素，那么新（“来源”）像素将与老（“目标”）像素组合，从而让老像素会透过新像素可见，可见度取决于新像素的透明度。

这种组合新的（可能半透明）来源像素与已有（可能半透明）目标像素的过程叫作合成（`composition`）。前面描述的合成过程是 Canvas API 组合像素的默认方式。通过设置 `globalCompositeOperation` 属性可以指定合成像素的其他方式。默认值是 `source-over`，即来源像素被绘制在目标像素 “上方”（`over`），如果来源像素半透明则组合它们。如果把这个属性设置为 `destination-over`，则画布在合成像素时就好像新的来源像素被绘制在已有目标像素下方一样。如果目标像素是半透明或透明的，则部分或全部来源像素的颜色将在最终结果中可见。再有，如果合成模式为 `source-atop`，那么画布将根据目标像素的透明度组合来源像素，结果就是在画布原来完全透明的部分上什么也不会绘制。除此之外，`globalCompositeOperation` 还有其他一些合法的值，但多数只在特殊场合下有用，这里就不介绍了。

### 保存和恢复图形状态

由于 Canvas API 在上下文对象上定义图形属性，有人可能想多次调用 `getContext()` 以获得多个上下文对象。这样一来，或许可以在每个上下文上定义不同的属性。换句话说，每个上下文就像拥有不同的笔刷一样，将以不同的颜色绘制或以不同的宽度画线。遗憾的是，这种做法对画布而言是行不通的。每个 `<canvas>` 元素只有一个上下文对象，每次调用 `getContext()` 返回的都是同一个 `CanvasRenderingContext2D` 对象。

尽管 Canvas API 一次只允许定义一组图形属性，但它也允许保存当前的图形状态，以便修改其中的属性，之后再恢复。`save()` 方法把当前的图形状态推到一个保存的状态栈中。`restore()` 方法从该栈中弹出状态，恢复最近一次保存的状态。本节介绍的所有属性都存在于保存的状态中，其中也包括当前的变换及剪切区域（稍后我们将介绍这两个概念）。重要的是，当前定义的路径和当前的点并不属于图形状态，不能保存和恢复。

## 15.8.4 画布绘制操作

前面介绍了一些基本的画布方法，包括 `beginPath()`、`moveTo()`、`lineTo()`、`closePath()`、`fill()` 和 `stroke()`，可以用来定义、填充、绘制线条和多边形。除此之外，Canvas API 还提供其他绘制方法。

### 矩形

`CanvasRenderingContext2D` 定义了 4 个绘制矩形的方法。这些方法都接收 2 个参数，用于指定矩形的一个角和矩形的宽度和高度。正常情况下，都是指定矩形左上角，然后传入正值作为宽度和高度。不过也可以指定其他角，可以传入负值。

`fillRect()` 将以当前 `fillStyle` 填充指定的矩形。`strokeRect()` 使用当前 `strokeStyle` 和其他线条属性描绘指定矩形的轮廓。`clearRect()` 与 `fillRect()` 类似，但它会忽略当前填充样式，直接以（所有空画布默认的）透明黑色像素填充矩形。这三个方法都不影响当前路径或该路径中的当前点。

最后一个矩形方法是 `rect()`，它影响当前路径。这个方法会将自己拥有的一个矩形子路径添加到当前路径。与其他路径定义方法类似，这个方法本身什么也不会填充或描绘。

### 曲线

路径由一系列子路径构成，子路径又由一系列相互连接的点构成。在 15.8.1 节中定义路径时，点和点之间都是通过直线段连接的，但实践中并非只需要直线。`CanvasRenderingContext2D` 对象定义了一些方法，用于将一个新点添加到路径，然后用一条曲线来连接当前点与新点。

#### arc()

​	这个方法向路径中添加一个圆形或圆形的一部分（圆弧）。要绘制的弧形通过 6 个参数指定：圆心的 x 和 y 坐标、圆的半径、圆弧的起始和终止角度，以及圆	弧在两个角度间的绘制方式（顺时针还是逆时针）。如果路径中有一个当前点，则这个方法用一条直线连接当前点与圆弧的起点（在绘制楔形成扇环形时有	用），然后用圆形的一部分连接圆弧的起点和终点，最后让圆弧的终点成为新的当前点。如果调用这个方法时没有当前点，则只向路径中添加这段圆弧。

#### ellipse()

​	这个方法向路径中添加一个椭圆形或椭圆形的一部分。这个方法与 `arc()` 非常类似，只是会向路径中添加一个椭圆弧。另外，这个方法接收两个半径：x 轴	半径和 y 轴半径。而且，因为椭圆不是径向对称的，所以这个方法也接收另外一个参数用于指定弧度，即椭圆围绕其圆心顺时针旋转度数。

#### arcTo()

​	这个方法会像 `arc()` 一样绘制一条直线和一条圆弧，但它使用不同的参数来指定要绘制的圆弧。`arcTo()` 的参数指定点 P1 和 P2，以及一个半径。添加到路	径的圆弧具有指定的弧度。起点是以（想象中）当前点到 P1 点连线为切线的切点，终点是以（想象中）P1 点到 P2 点连线为切线的切点。这个看似不同寻常	的指定圆弧的方法实际上对绘制有圆角的形状非常有用。如果半径为 0，这个方法将只从当前点到 P1 绘制一条直线。然而对于非 0 值半径，它会从当前点朝 	P1 点方向画一条直线，然后围绕一个圆形弯曲这条直线，直至这条线指向 P2 点。

#### bezierCurveTo()

​	这个方法会向子路径中添加一个新点 P，并通过一条三次贝塞尔曲线连接当前点与这个新点。曲线形状通过两个 “控制点” C1 和 C2 来指定。在曲线的起点	（当前点），曲线朝向 C1 点方向。在曲线终点（P 点），曲线自 C2 点的方向到达。在这些点之间，曲线平滑变化。点 P 最终变成子路径新的当前点。

#### quadraticCurveTo()

​	这个方法与 `bezierCurveTo()` 类似，但使用二次贝塞尔曲线而非三次贝塞尔曲线，且只有一个控制点。

这个方法与 `bezierCurveTo()` 类似，但使用二次贝塞尔曲线而非三次贝塞尔曲线，且只有一个控制点。



示例 15-6 展示了用于创建图 15-10 的代码。这些方法演示了 Canvas API 中一些最复杂的部分，关于这些方法及其参数的详细介绍，请大家自行上网查找相关资料。

示例 15-6：向路径中添加曲线

```javascript
// 将角度转换为弧度的辅助函数
function rads(x) { return Math.PI*x/180; }

// 取得文档画布元素的上下文对象
let c = document.querySelector("canvas").getContext("2d");

// 定义一些图形属性以绘制曲线
c.fillStyle = "#aaa";   // 填充灰色
c.lineWidth = 2;        // 2像素宽的黑（默认）线

// 画一个圆形
// 没有当前点，因此只绘制圆形，
// 没有从当前点到圆形起点的直线
c.beginPath();
c.arc(75,100,50,        // 圆心位于(75,100)，半径50
      0,rads(360),false); // 顺时针从0到360度
c.fill();               // 填充这个圆形
c.stroke();             // 描绘出其轮廓

// 接着以相同方式画一个椭圆形
c.beginPath();          // 开启一段新路径，不跟圆形连接
c.ellipse(200, 100, 50, 35, rads(15), 0, rads(360), false);
                        // 圆心、半径和旋转度数
                        // 起始角度、终止角度、方向
// 画一个扇形。角度按顺时针从x轴正向度量
c.beginPath();          // 会从当前点向弧形起点添加一条线
c.moveTo(325, 100);     // 从圆形的圆心开始
c.arc(325, 100, 50, 
      rads(-60), rads(0), // 从-60度开始，转到0度
      true);            // 逆时针
c.closePath();          // 再向圆心添加一条线
c.fill();

// 类似的扇形，稍微有点偏移，方向相反
c.moveTo(340, 92);
c.beginPath();
c.arc(340, 92, 42, rads(-60), rads(0), false);
c.closePath();
c.fill();

// 使用arcTo()来画圆角。这里绘制一个方形
// 其左上角点位于(440,58)，各圆角半径不同
c.moveTo(450, 50);      // 从顶点中间开始
c.arcTo(500,50,500,150,30); // 添加部分顶边和右上角
c.arcTo(500,150,400,150,20); // 添加右边和右下角
c.arcTo(400,150,400,50,10);  // 添加底边和左下角
c.arcTo(400,50,500,50,0);    // 添加左边和左上角
c.closePath();          // 关闭路径添加剩下的顶边
                        // 圆心和半径

// 二次贝塞尔曲线：一个控制点
c.moveTo(523, 123);     // 从这里开始
c.quadraticCurveTo(550, 75, 625, 125); // 绘制曲线到(625,125)
c.fillRect(550-3, 75-3, 6, 6);        // 标记控制点(550,75)
c.fill();

// 三次贝塞尔曲线
c.moveTo(625, 180);     // 起点为(625, 180)
c.bezierCurveTo(645,70,785,30,725,180); // 画曲线到(725, 180)
c.fillRect(645-3, 70-3, 6, 6);        // 标记控制点
c.fillRect(785-3, 30-3, 6, 6);
c.fillRect(725-3, 180-3, 6, 6);

// 最后，填充曲线并描绘其轮廓
c.fill();
c.stroke();
```

### 文本

要在画布中绘制文本，一般都使用 `fillText()` 方法，该方法使用 `fillStyle` 属性指定的颜色（或渐变、模式）绘制文本。对于大型文本的特效，可以使用 `strokeText()` 绘制个字形的轮廓。这两个方法都以要绘制的文本作为第一个参数，以文本的 x 和 y 坐标作为第二和第三个参数。它们都不影响当前路径或当前点。

`fillText()` 和 `strokeText()` 还接收可选的第四个参数。如果指定，这个参数用于限制文本可以显示的最大宽度。如果在使用 `font` 属性绘制文本时，文本宽度超过了指定的值，为适应这个宽度，画布将缩小文本或者使用更窄或更小的字体。

如果想在绘制文本前度量其大小，可以将文本传给 `measureText()` 方法。这个方法返回一个 `TextMetrics` 对象，该对象指定了以当前 `font` 属性绘制文本时的度量指标。在本书写作时，`TextMetrics` 对象中包含的唯一 “度量指标” 是宽度。可以像下面这样查询文本绘制到屏幕时的宽度：

```javascript
let width = c.measureText(text).width;
```

知道这个宽度有时候很有用，比如要在画布上居中一段文本。

### 图片

除了矢量图形（路径、线条等），Canvas API 也支持位图图片。`drawImage()` 方法会将一张源图片（或源图片中某个矩形区域）的像素复制到画布上，并根据需要缩放和旋转图像的像素。

`drawImage()` 可以接收 3 个、5 个或 9 个参数。无论哪种情况，第一个参数都是要复制其像素的源图片。这个图片参数通常是一个 `<img>` 元素，但也可以是另一个 `<canvas>` 元素，甚至是一个 `<video>` 元素（可以复制其中一帧）。如果指定了一个还在加载数据的 `<img>` 或 `<video>` 元素，调用 `drawImage()` 什么也不会做。

在 3 个参数版的 `drawImage()` 中，第二和第三个参数指定 `x` 和 `y` 坐标，图片的左上角将绘制在这个点。在这个版本的方法中，整个源图片都会复制到画布上。其中 `x` 和 `y` 坐标相对于当前坐标系来解释，图片会按照需要缩放或旋转，取决于画布当前应用的变换。

5 个参数版的 `drawImage()` 在前面介绍的 `x` 和 `y` 参数之后，又增加了高度和宽度参数 `width` 和 `height`。这 4 个参数定义了画布中的目标区域。源图片的左上角将绘制在 `(x,y)` 点，右下角将绘制在 `(x+width,y+height)`。同样，整个源图片都会被复制。在这个版本的方法中，图片会被缩放以适应目标矩形。

9 个参数版的 `drawImage()` 方法同时指定了源矩形和目标矩形，且只复制位于源矩形中的像素。参数 2 到 5 指定源矩形，以 CSS 像素度量。如果源图片是另一个画布，源矩形使用该画布的默认坐标系，忽略已经指定的变量。参数 6 到 9 指定要将源矩形中的像素绘制到其中的目标矩形，使用当前画布的坐标系，而非默认坐标系。

除了把图片绘制到画布上，还可以使用 `toDataURL()` 方法将画布内容提取为一张图片。与这里介绍的其他方法不同，`toDataURL()` 是画布元素本身的方法，不是上下文对象的方法。通常在调用 `toDataURL()` 时不传参数，返回的值是 PNG 格式的画布内容，使用 data: URL 编码。返回的这个 URL 可以直接给到 `<img>` 元素。比如，可以像下面这样生成画布的一个静态快照：

```javascript
let img = document.createElement("img"); // 创建一个<img>元素
img.src = canvas.toDataURL();            // 设置其src属性
document.body.appendChild(img);          // 将其添加到文档中
```

## 15.8.5 坐标系变换

正如我们前面介绍的，画布默认的坐标系是将原点放在左上角，`x` 坐标向右递增，`y` 坐标向下递增。在这个默认的坐标系中，一个点的坐标直接映射为一个 CSS 像素（相应地再映射到一个或多个设备像素）。某些画布操作和属性（如提取原始像素值和设置阴影偏移）始终使用这个默认坐标系。不过除了默认坐标系，每个画布的图形状态中都有一个 “当前变换矩阵”。这个矩阵定义了画布的当前坐标系。在多数画布操作中，当你指定一个点的坐标时，它表示的是当前坐标系中的一个点，而不是默认坐标系中的一个点。当前变换矩阵用于将你指定的坐标转换为默认坐标系中等价的坐标。

使用 `setTransform()` 方法可以直接设置画布的变换矩阵，但通常还是使用一系列平移、旋转和缩放操作来变换坐标系更简单。图 15-11 展示了这些操作以及它们在画布坐标系中的效果。产生这个图的程序连续 7 次绘制了同一个坐标轴。每次绘制时唯一变化的只有当前的变换矩阵。注意变换既影响文本也影响被绘制的线条。





`translate()` 方法简单地向左、右、上、下移动坐标系原点。`rotate()` 方法按照指定的角度旋转坐标轴（Canvas API 始终以弧度指定角度。要把度数转换为弧度，先用 180 除以度数再乘以 `Math.PI`）。`scale()` 方法沿 `x` 轴或 `y` 轴拉伸或压缩距离。

给 scale () 方法传入一个负缩放因子会围绕原点翻转坐标轴，就好像镜子里的倒影一样。图 15-11 中左下角展示的就是这个效果，其中 translate () 用于将原点移动到画布左下角，然后 scale () 再翻转 y 轴使其变成向上递增。翻转后的这个坐标系我们在几何课上都学过，对于在图表上标绘数据点比较有用。不过要注意，这样会导致文本很难分辨。

### 理解变换数学

我发现从几何角度理解变换是最简单的，可以把 translate ()、rotate () 和 scale () 想象成像图 15-11 中那样变换坐标轴。当然也可以从代数角度来理解变换，那么它就是把变换后坐标系中的点 (x,y) 映射回之前坐标系中同一个点 (x',y') 的方程式。

方法调用 c.translate (dx,dy) 可以使用如下方程式来描述：

```plaintext
x' = x + dx; // 新坐标系中的 X 坐标θ是坐标系中的 dx
y' = y + dy;
```

缩放操作也有类似的简单方程式。调用 c.scale (sx,sy) 可以描述成这样：

```plaintext
x' = sx * x;
y' = sy * y;
```

旋转要复杂一点。调用 c.rotate (a) 可以通过以下三角函数来描述：

```plaintext
x' = x * cos(a) - y * sin(a);
y' = y * cos(a) + x * sin(a);
```

注意变换的顺序很重要。假设我们从画布的默认坐标系开始，先平移它，再缩放它。为了把当前坐标系中的点 (x,y) 映射回默认坐标系中的点 (x'', y'')，必须先应用缩放的方程式，把该点映射为平移但未缩放的坐标系中的一个中间点 (x', y')，然后再使用平移方程式把这个中间点映射到 (x'', y'')。结果如下：

```plaintext
x'' = sx*x + dx;
y'' = sy*y + dy;
```

如果在调用 translate () 之前调用 scale ()，得到的方程会有所不同：

```plaintext
x'' = sx*(x + dx);
y'' = sy*(y + dy);
```

从代数角度来理解，关键是要记住，要还原一系列变换操作，必须从最后（近）一个变换开始，逐个还原到第一个变换。而从变换坐标轴的几何角度来理解，则需要从第一个变换开始，到最后一个结束。

画布支持的变换被称为**仿射变换（affine transform）**。仿射变换可能修改点与点之间的距离和线与线之间的角度，但平行线在仿射变换之后依旧保持平行。比如，不可能通过仿射变换完成鱼眼镜头变形。任何仿射变换都可以通过以下方程中的 6 个参数 a 到 f 来描述：

```plaintext
x' = ax + cy + e
y' = bx + dy + f
```

可以通过调用 transform () 并传入这 6 个参数，对当前坐标系应用任意变换。图 15-11 展示的两种变换（特定点的剪切和旋转）可以像下面这样通过 transform () 方法实现：

```javascript
// 剪切（shear）变换：
// x' = x + kx*y;
// y' = ky*x + y;
function shear(c, kx, ky) { c.transform(1, ky, kx, 1, 0, 0); }

// 围绕点(x,y)逆时针旋转 theta 弧度
// 同样也可以由平移、旋转、平移操作完成
function rotateAbout(c, theta, x, y) {
  let ct = Math.cos(theta);
  let st = Math.sin(theta);
  c.transform(ct, -st, st, ct, -x*ct-y*st+x, x*st-y*ct+y);
}
```

setTransform () 方法与 transform () 接收的参数一样，但它不变换当前坐标系，而是忽略当前坐标系，变换默认坐标系，并将结果作为新的当前坐标系。setTransform () 常用于临时将画布重置为其默认坐标系：

```javascript
c.save();              // 保存当前坐标系
c.setTransform(1,0,0,1,0,0); // 恢复到默认坐标系
// 现在变量 x 的值就是θ
c.restore();           // 恢复保存的坐标系
```

### 变换举例

示例 15-7 通过递归使用 translate ()、rotate () 和 scale () 方法绘制科赫（Koch）雪花分形演示了坐标系变换的强大能力。这个示例的输出如图 15-12 所示，其中包含 0、1、2、3、4 级递归得到的科赫雪花。



生成这些图案的代码十分优雅，但由于用到了递归坐标系变换，所以不太好理解。即便一时理解不了所有细节，也要注意代码中只包含对 lineTo () 方法的一次调用。图 15-12 中的任何一条线段都是通过类似如下的代码绘制的：

```javascript
c.lineTo(len, 0);
```

变量 len 的值在程序执行期间保持不变，因此每条线段的位置、方向和长度都由平移、旋转和缩放操作决定。

示例 15-7：通过变换绘制科赫雪花

```javascript
let deg = Math.PI/180; // 用于将角度转换为弧度

// 在上下文 c 上绘制 n 级科赫雪花分形
// 左下角位于点 (x,y)，边长为 len
function snowflake(c, n, x, y, len) {
  c.save();           // 保存当前变换
  c.translate(x,y);   // 平移原点到起点
  c.moveTo(0,0);      // 在新原点开始一条新子路径
  leg(n);             // 绘制雪花的第一条边
  c.rotate(-120*deg); // 逆时针旋转 120 度
  leg(n);             // 绘制第二条边
  c.rotate(-120*deg); // 再旋转一次
  leg(n);             // 绘制第三条边
  c.closePath();      // 关闭子路径
  c.restore();        // 恢复原始变换
}

// 绘制 n 级科赫雪花的一条边
// 这个函数把自己绘制的这条边的终点作为当前点
// 并变换坐标系，以便当前点位于坐标 (0,0) 点
// 这样绘制一条边之后，就可以调用 rotate()
function leg(n) {
  c.save();           // 保存当前变换
  if (n === 0) {      // 非递归的情形：
    c.lineTo(len, 0); // 只画一条水平线
  }
  else {              // 递归的情形：给 4 条边，类似于这样 /\
    c.scale(1/3,1/3); // 子边是当前边的 1/3
    leg(n-1);         // 递归绘制第一条子边
    c.rotate(60*deg); // 顺时针旋转 60 度
    leg(n-1);         // 绘制第二条子边
    c.rotate(-120*deg);// 反向旋转 120 度
    leg(n-1);         // 绘制第三条子边
    c.rotate(60*deg); // 再转回原始方向
    leg(n-1);         // 最后一条子边
  }
  c.restore();        // 恢复变换
  c.translate(len, 0); // 平移让边的终点变成 (0,0)
}
}

let c = document.querySelector('canvas').getContext('2d');
snowflake(c, 0, 25, 125, 125); // 0 级雪花是一个三角形
snowflake(c, 1, 175, 125, 125); // 1 级看起来是一个六角星
snowflake(c, 2, 325, 125, 125); // 继续……
snowflake(c, 3, 475, 125, 125);
snowflake(c, 4, 625, 125, 125); // 4 级雪花看起来已经非常像雪花了
c.stroke();                     // 描绘出这个复杂图形的路径
```

## 15.8.6 剪切

定义了路径之后，我们通常会调用 stroke () 或 fill ()（或两者）。但也可以调用 clip () 方法定义一个剪切区域。定义了剪切区域后，这个区域外部将不会被绘制。图 15-13 展示了一个使用剪切区域生成的复杂图形。位于中间垂直的竖条和位于底部的文本在被描绘时都没有应用剪切区域，然后在对它们定义了三角形剪切区域后又进行了填充。

图 15-13 是使用示例 15-5 定义的 polygon () 方法和如下代码生成的：

```javascript
// 定义一些绘制属性
c.font = 'bold 60pt sans-serif'; // 大字体
c.lineWidth = 2;                 // 细线条
c.strokeStyle = '#000';          // 黑描边

// 描绘一个矩形和一些文本
c.strokeRect(175, 25, 50, 325);  // 在中间画一个垂直竖条
c.strokeText("<canvas>", 15, 350);// 注意是 strokeText(), 不是 fillText()

// 定义一个复杂的路径，其内部在外面
polygon(c,3,200,225,200);        // 大三角形
polygon(c,3,200,225,100,0,true); // 内部反向绘制的小三角形

// 把这个路径定义为剪切区域
c.clip();

// 用 5 像素的线描绘这条路径，看全长位于剪切区域中
c.lineWidth = 10;                // 10 像素中有一半将被剪切掉
c.stroke();

// 填充矩形和文本位于剪切区域内部的部分
c.fillStyle = "rgba(255,0,0,0.2)"; // Light gray
c.fillRect(175, 25, 50, 325);      // Fill the vertical stripe
c.fillStyle = "#888";              // Darker gray
c.fillText("<canvas>", 15, 350);   // 填充文本
```

要注意，在调用 `clip()` 时，当前路径本身会被剪切为当前的剪切区域，然后这个被剪切的路径变成了新的剪切区域。这意味着 `clip()` 方法只能缩小剪切区域，不能放大。没有方法重置剪切区域，因此在调用 `clip()` 之前，一般都要调用 `save()` 以便将来恢复未被剪切的区域。

## 15.8.7 像素操作

`getImageData()` 方法返回一个 `ImageData` 对象，表示画布中某矩形区域中包含的原始像素（包括 R、G、B 和 A 组件）。可以使用 `createImageData()` 创建空的 `ImageData` 对象。`ImageData` 对象中的像素是可写的，因此可以随意修改，然后再通过 `putImageData()` 把其中的像素复制到画布上。

这些像素操作方法提供了对画布非常低级的存取操作。传给 `getImageData()` 的矩形位于默认坐标系中，其大小以 CSS 像素来度量，不会受当前变换的影响。在调用 `putImageData()` 时，你指定的位置同样以默认坐标系来度量。而且，`putImageData()` 忽略所有图形属性。它不进行任何合成操作，不会给像素乘上 `globalAlpha`，也不会绘制阴影。

像素操作方法经常用于处理图片。示例 15-8 展示了如何创建图 15-14 所示的简单的运动模糊或 “涂抹” 效果。

以下代码演示了 `getImageData()` 和 `putImageData()`，并展示了如何遍历和修改 `ImageData` 对象中的像素值。

```javascript
// 向右涂抹矩形的像素，产生一种运动模糊的效果
// 就像物体从右向左移动一样
// n 必须是 2 或更大的值。值越大产生涂抹效果越明显
// 矩形在默认坐标系中定义
function smear(c, n, x, y, w, h) {
    // 取得要涂抹其中像素的矩形所对应的 ImageData 对象
    let pixels = c.getImageData(x, y, w, h);
    
    // 这里的涂抹是就地完成的，只需要原 ImageData
    // 某些图像处理算法需要其他 ImageData 存储变换后的像素值
    
    // 如果需要输出缓冲，也可以像下面这样以相同大小创建一个新
    // ImageData 对象：
    // let output_pixels = c.createImageData(pixels);
    
    // 取得 ImageData 对象中像素网格的大小
    let width = pixels.width, height = pixels.height;
    
    // 这是保存原始像素数据的字节数组，从左到右，从上到下
    // 每个像素占用 4 个连续的字节，分别是 R、G、B 和 A
    let data = pixels.data;
    
    // 每行第一个像素后面的像素都会被涂抹，也就是用 n 分之一
    // 自己的值加上 n 分之 n-1 前一个像素的值，来替换当前的像素值
    let n1 = n-1;
    
    for(let row = 0; row < height; row++) { // 每一行
        let i = row*width*4; // 每行第一个像素的位置
        for(let col = 1; col < width; col++, i += 4) { // 每一列
            data[i] = (data[i] + data[i-4]*n1)/n; // 红色值
            data[i+1] = (data[i+1] + data[i-3]*n1)/n; // 绿色值
            data[i+2] = (data[i+2] + data[i-2]*n1)/n; // 蓝色值
            data[i+3] = (data[i+3] + data[i-1]*n1)/n; // Alpha
        }
    }
    
    // 再把涂抹后的图像复制回画布上相同的位置
    c.putImageData(pixels, x, y);
}
```

# 15.9 Audio API

HTML 的 `<audio>` 和 `<video>` 标签可以让我们在网页中轻松包含音频和视频。这两个元素有着重要的 API 和并不简单的用户界面。可以通过 `play()` 和 `pause()` 方法控制媒体播放。可以设置 `volume` 和 `playbackRate` 属性控制音量和播放速度。而设置 `currentTime` 属性可以跳到媒体中特定的时间点。

不过，本节不会展示介绍 `<audio>` 和 `<video>` 标签。接下来我们只演示两种通过脚本控制网页音效的方式。

## 15.9.1 Audio () 构造函数

要在网页中包含音效，不一定要在 HTML 文档中包含 `<audio>` 标签。可以使用常规 DOM 方法 `document.createElement()` 或者直接使用 `Audio()` 构造函数动态创建 `<audio>` 元素。并且，要播放媒体也不一定要把创建的元素添加到文档中，只要调用它的 `play()` 方法即可：

```javascript
// 提前加载音效文件，准备好播放
let soundeffect = new Audio("soundeffect.mp3");

// 用户单击鼠标时播放音效
document.addEventListener("click", () => {
  soundeffect.cloneNode().play(); // 加载并播放声音
});
```

























