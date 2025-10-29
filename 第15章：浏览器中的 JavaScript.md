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

注意这里使用了`cloneNode()`。如果用户快速单击鼠标，我们希望同时播放多个重叠的音效。为此，就需要有多个 Audio 元素。因为这些 Audio 元素并未添加到文档中，所以它们播放结束后就会被当作垃圾清理掉。

## 15.9.2 WebAudio API

除了使用 Audio 元素播放录制的声音，浏览器也可以通过 WebAudio API 生成和播放合成音效。使用 WebAudio API 就像是使用带接线柱的老式电子合成器。对于 WebAudio，要创建一组 AudioNode 对象，表示波形的来源、变换和目标，然后再将这些节点连接为一个网络以产生声音。这个 API 并不很复杂，但要全面解释还需要理解电子音乐和信号处理的概念，这些都超出了本书的范畴。

下面的代码使用 WebAudio API 合成了一支短和弦，在 1 秒钟之后会渐弱消失。这个示例演示了 WebAudio API 的基础。如果你对它很感兴趣，可以上网查找更多相关学习资料。

```javascript
// 首先创建一个 audioContext 对象，Safari 仍然要求使用
// webkitAudioContext 而不是 AudioContext
let audioContext = new (this.AudioContext||this.webkitAudioContext)();

// 定义基准声音为三个纯正弦波的组合
let notes = [ 293.7, 370.0, 440.0 ]; // D 大三和弦：D、F# 和 A

// 为每个想要播放的音符创建振荡器节点
let oscillators = notes.map(note => {
  let o = audioContext.createOscillator();
  o.frequency.value = note;
  return o;
});

// 通过随时间控制音量来构造声音
// 从时间 0 开始快速升为最大音量
// 然后从时间 0.1 开始缓慢降为 0
let volumeControl = audioContext.createGain();
volumeControl.gain.setTargetAtTime(1, 0.0, 0.02);
volumeControl.gain.setTargetAtTime(0, 0.1, 0.2);

// 我们想把这个声音发送给默认目标：
// 用户的扬声器
let speakers = audioContext.destination;

// 把每个源音符连接到音量控制
oscillators.forEach(o => o.connect(volumeControl));

// 再把音量控制的输出连接到扬声器
volumeControl.connect(speakers);

// 现在开始播放声音，让它们持续1.25秒
let startTime = audioContext.currentTime;
let stopTime = startTime + 1.25;
oscillators.forEach(o => {
  o.start(startTime);
  o.stop(stopTime);
});

// 如果想创建一系列声音，可以使用事件处理程序
oscillators[0].addEventListener("ended", () => {
  // 在音符停止播放时会调用这个事件处理程序
});
```

# 15.10 位置、导航与历史

Window 和 Document 对象的`location`属性引用的都是 Location 对象，该对象表示当前窗口显示文档的 URL，也提供了在窗口中加载新文档的 API。

Location 对象与 URL 对象（参见 11.9 节）非常相似，可以使用`protocol`、`hostname`、`port`和`path`访问当前文档 URL 的不同部分。而`href`属性以字符串形式返回整个 URL，就如同调用`toString()`方法一样。

Location 对象的`hash`和`search`属性比较有意思。`hash`属性返回 URL 的 “片段标识符” 部分（如果有），包含一个井号（`#`）和一个元素 ID。`search`属性与之类似，返回 URL 中以问号开头的部分，通常是一些查询字符串。一般来说，URL 中的这一部分用于对 URL 进行参数化，并提供在 URL 中嵌入参数的方式。虽然这些参数通常都被服务器端脚本使用，但网页中的 JavaScript 照样也可以使用它们。

URL 对象有一个`searchParams`属性，是解析`search`属性之后的一种表示。Location 对象没有`searchParams`属性，但如果想解析`window.location.search`，可以直接使用 Location 对象创建一个 URL 对象，然后访问 URL 对象的`searchParams`：

```javascript
let url = new URL(window.location);
let query = url.searchParams.get("q");
let numResults = parseInt(url.searchParams.get("n") || "10");
```

除了可以通过`window.location`和`document.location`引用的 Location 对象，以及前面使用的`URL()`构造函数，浏览器也定义了`document.URL`属性。奇怪的是，这个属性的值并非 URL 对象，而只是一个字符串，也就是当前文档的 URL。

## 15.10.1 加载新文档

如果给 `window.location` 或 `document.location` 赋值一个字符串，则该字符串将被解释为一个 URL，且浏览器会加载它，从而用新文档替换当前文档：

```javascript
window.location = "http://www.oreilly.com"; // 去买几本书
```

也可以给 `location` 属性赋值相对 URL，浏览器会相对于当前 URL 解析它：

```javascript
document.location = "page2.html"; // 加载下一页
```

简单的片段标识符也是一种特殊的 URL，但它不会导致浏览器加载新文档，只会把文档中 `id` 或 `name` 匹配该片段的元素滚动到浏览器窗口顶部，令其可见。作为一个特例，片段标识符 `#top` 会让浏览器跳到文档顶部（假设没有元素有 `id="top"` 属性）：

```javascript
location = "#top"; // 跳到文档顶部
```

`Location` 对象的个别属性是可写的，设置它们会改变 URL，也会导致浏览器加载新文档（或者如设置的是 `hash` 属性，则会在当前文档中导航）：

```javascript
document.location.pathname = "pages/3.html"; // 加载一个新页面
document.location.hash = "#TOC"; // 滚动到目录
location.search = "?page=" + (page+1); // 以新查询字符串重新加载文档
```

给 `Location` 对象的 `assign()` 方法传入一个新字符串也可以加载新页面。这样做的效果与给 `location` 属性赋值字符串相同，因此没有太大的意思。

相对而言，`Location` 对象的 `replace()` 方法倒是非常有用。在给 `replace()` 传入一个字符串时，字符串会被当作 URL 解析，并导致浏览器加载新页面，跟使用 `assign()` 一样。区别在于 `replace()` 会在浏览器的历史记录中替换当前文档。如果文档 A 中的脚本通过设置 `location` 属性或调用 `assign()` 加载了文档 B，然后用户单击了浏览器的 “后退” 按钮，浏览器会返回到文档 A。如果你使用的是 `replace()`，则文档 A 会从浏览器历史中擦除。当用户单击 “后退” 按钮时，浏览器会返回显示文档 A 之前显示的文档。

在脚本无条件加载一个新文档时，相比 `assign()`，最好还是使用 `replace()`。否则，“后退” 按钮会把浏览器带回最初的文档，而同一个脚本会再次触发加载新文档。假设你的页面有两个版本：一个使用 JavaScript 增强的版本和一个不使用 JavaScript 的静态版本。如果确定用户浏览器不支持你想使用的 Web 平台 API，就可以使用 `location.replace()` 加载静态版本：

```javascript
// 如果浏览器不支持我们依赖的 JavaScript API，
// 则重定向到不使用 JavaScript 的静态页面
if (!isBrowserSupported()) location.replace("staticpage.html");
```

注意，传给 `replace()` 的 URL 是相对 URL。相对 URL 是相对于它们所在的页面来解析的，就像在超链接中使用一样。

除了 `assign()` 和 `replace()` 方法，`Location` 对象也定义了 `reload()` 方法，调用该方法会让浏览器重新加载当前文档。

## 15.10.2 浏览历史

`Window` 对象的 `history` 属性引用的是窗口的 `History` 对象。`History` 对象将窗口的浏览历史建模为文档和文档状态的列表。`History` 对象的 `length` 属性是浏览历史列表中元素的数量。但出于安全考虑，脚本不能访问存储的 URL（如果可以访问，任何脚本都将可以窥探你的浏览历史）。

`History` 对象的 `back()` 和 `forward()` 方法就像浏览器的 “后退” 和 “前进” 按钮，可以让浏览器在浏览历史中后退或前进一步。另一个方法 `go()` 接收一个整数参数，可以在历史列表中前进（正整数）或后退（负整数）任意个页面：

```javascript
history.go(-2); // 后退 2 步，如同单击两次后退按钮
history.go(0); // 重新加载当前页面的另一种方式
```

如果窗口包含子窗口（如 `<iframe>` 元素），子窗口的浏览历史会按时间顺序与主窗口历史交替。这意味着在主窗口中调用 `history.back()`，可能导致某个子窗口后退到前一个显示的文档，而主窗口则维持当前状态不变。

我们这里介绍的 `History` 对象可以追溯到 Web 早期，当时文档都是被动的，所有计算都在服务器中执行。今天，Web 应用经常动态生成或加载内容，显示新应用状态而并不真正加载新文档。这样的应用必须自己管理历史记录，才能让用户直观地使用 “后退” 和 “前进” 按钮（或等价手势），从应用的一个状态导航到另一个状态。有两种方式实现这个任务，接下来两节将分别介绍。

## 15.10.3 使用 hashchange 事件管理历史

第一种管理浏览历史的技术是使用 `location.hash` 和 `“hashchange”` 事件。要理解这个技术需要明确以下关键事实：

- `location.hash` 属性用于设置 URL 的片段标识符，通常用于指定要滚动到的文档区域的 ID。但 `location.hash` 不一定必须是元素 ID，也可以将它设置为任意字符串。只要不是某个元素碰巧有该字符串 ID，浏览器就不会在设置 `hash` 属性时滚动。
- 设置 `location.hash` 属性会更新地址栏中显示的 URL，而且更重要的是，还会在浏览器历史列表中添加一条记录。

- 只要文档的片段标识符改变，浏览器就会在 Window 对象上触发 "hashchange" 事件。显式设置 location.hash 也会触发 "hashchange" 事件。而且，如前所述，对 Location 对象的这个修改会在浏览器的浏览历史中创建一条新记录。因此如果用户单击了 “后退” 按钮，浏览器会返回设置 location.hash 之前的 URL。但这意味着片段标识符又改变了，因此又会触发另一个 "hashchange" 事件。换句话说，只要你可以为应用的每个可能的状态创建唯一的片段标识符，"hashchange" 事件就能够在用户向后或向前导航浏览历史时给你发送通知。

要使用这种历史管理机制，需要把渲染应用 “页面” 必需的状态信息编码为一个可以作为片段标识符的短字符串。为此需要写一个函数把页面状态转换为一个字符串，再写一个函数来解析该字符串并重建其代表的页面状态。

写完这两个函数之后，剩下的事情就简单了。定义一个 window.onhashchange 监听函数（或使用 addEventListener ()）注册 "hashchange" 监听器，读取 location.hash，并将该字符串转换为应用的状态的表示，再采取必要步骤显示该应用的新状态。

如果用户的交互会导致应用进入新状态（比如单击链接），不要直接渲染新状态。而要先把新状态编码为一个字符串，并将 location.hash 设置为该字符串。这样就会触发 "hashchange" 事件，而你为该事件注册的事件处理程序将会显示该新状态。使用这种迂回技术可以保证新状态被插入浏览历史，因而 “后退” 和 “前进” 按钮继续有效。

## 15.10.4 使用 pushState () 管理历史

管理历史的第二种技术稍微有点复杂，但却没有 "hashchange" 事件那么绕。这种更可靠的历史管理技术是建立在 history.pushState () 方法和 "popstate" 事件基础上的。当 Web 应用进入一个新状态时，它会调用 history.pushState ()，向浏览器历史中添加一个表示该状态的对象。如果用户单击 “后退” 按钮，浏览器会触发携带该保存的状态对象的 "popstate" 事件，应用使用该对象重建其之前的状态。除了保存的状态对象，应用也可以为每个状态都保存一个 URL，这样可以方便用户将 URL 加入书签和分享应用内部状态的链接。

pushState () 的第一个参数是一个对象，包含恢复当前文档状态所需的全部状态信息。这个对象使用 HTML 的**结构化克隆算法**保存，该算法相比 JSON.stringify () 适用范围更广，而且支持 Map、Set 和 Date 对象，以及定型数组和 ArrayBuffer。

第二个参数是该状态对应的标题字符串，但多数浏览器都不支持这个参数，所以应该只传一个空字符串。第三个参数是一个可选的 URL，该 URL 会立即在地址栏显示出来或者也会在用户通过 “后退”“前进” 按钮返回这个状态时在地址栏显示出来。相对 URL 会基于文档的当前地址解析。给每个状态都关联一个 URL 可以让用户收藏应用的 URL。

内部状态。不过要记住，如果用户保存了这样一个书签，第二天又打开这个书签，你不会收到这次访问的 "popstate" 事件，而是必须通过解析 URL 来恢复应用状态。

>结构化克隆算法
>
>history.pushState () 方法不使用 JSON.stringify ()（参见 11.6 节）来序列化状态数据，而是使用一种更可靠的序列化技术叫作 “**结构化克隆算法**”。这个算法由 HTML 标准定义，后面介绍的其他一些浏览器 API 也会用到。
>
>结构化克隆算法可以涵盖 JSON.stringify () 能够序列化的一切值，除此之外，它还支持很多其他 JavaScript 类型的序列化。比如 Map、Set、Date、RegExp 和定型数组。而且，它还能处理包含循环引用的数据结构。不过结构化克隆算法不能序列化函数和类。在克隆对象时，它不会复制原型对象、获取函数和设置函数，也不会复制不可枚举的属性。尽管结构化克隆算法可以克隆大多数内置 JavaScript 类型，但不能复制宿主环境定义的类型，例如文档的 Element 对象。
>
>这意味着传给 history.pushState () 的状态对象不必局限于能够被 JSON.stringify () 序列化的对象、数组和原始值。但要注意的是，如果传入自己定义的某个类的实例，则该实例被当作普通 JavaScript 对象继续序列化，因此会丢掉其原型。

除了 pushState () 方法，History 对象也定义了 replaceState ()，它接收相同的参数，但会替换当前历史状态，而不是向浏览历史中添加新状态。当应用使用 pushState () 的首次加载时，一般最好调用 replaceState () 为应用的初始状态定义一个状态对象。

在用户使用 “后退” 或 “前进” 按钮导航到保存的历史状态时，浏览器会在 Window 对象上触发 "popstate" 事件。与之关联的事件对象有一个名为 state 的属性，其中包含当初你通过 pushState () 传入的状态对象的副本（又一次结构化克隆）。

如图 15-15 所示，示例 15-9 是一个简单的猜数 Web 应用。这个应用使用 pushState () 保存自己的历史，允许用户 “后退” 查看或撤销自己的猜测。

示例 15-9：使用 pushState () 管理历史状态

```html
<!doctype html>
<title>I'm thinking of a number...</title>
<style>
  body { height: 250px; display: flex; flex-direction: column;
        align-items: center; justify-content: space-evenly; }
  .showing { font: bold 30px sans-serif; margin: 0; }
  .feedback { font: bold 30px black 10pt; height: 5em; width: 600px; }
  .range { background-color: green; margin-left: 10px; height: 100%; width: 100%; }
  #input { display: block; font-size: 20px; width: 600px; padding: 5px; }
  #playagain { font-size: 20px; padding: 10px; border-radius: 5px; }
</style>
</head>
<body>
<h1 id="heading">I'm thinking of a number...</h1>
<!-- 对尚未猜测的数，可视范围显示 -->
<div class="feedback"><div class="range" id="range"></div></div>
<!-- 用户在此输入自己猜测的数字 -->
<input id="input" type="text">
<!-- 这个按钮不如搜索字符串重要。隐藏到游戏结束。 -->
<button id="playagain" hidden onclick="location.search=';'">Play Again</button>
<script>
/**
 * GameState 类的实例表示猜数游戏的一个内部状态
 * 这个类定义了静态工厂方法，用于从不同来源初始化
 * 游戏状态，还定义了一个方法基于新猜测更新状态，
 * 以及另一个方法基于当前游戏状态修改文档
 */
class GameState {
  // 这是用于创建新游戏的工厂函数
  static newGame() {
    let s = new GameState();
    s.secret = s.randomInt(0, 100); // 整数：0 < n < 100
    s.low = 0;                     // 猜测必须大于它
    s.high = 100;                  // 猜测必须小于它
    s.numGuesses = 0;              // 已经猜了多少次
    s.guess = null;                // 上一次猜的是什么
    return s;
  }

  // 通过调用 history.pushState() 保存游戏状态时，
  // 保存的只是一个简单的 JavaScript 对象，而不是
  // GameState 的实例，因此这个工厂函数基于从
  // popstate 事件获得的对象重建 GameState 对象
  static fromStateObject(stateObject) {
    let s = new GameState();
    for(let key of Object.keys(stateObject)) {
      s[key] = stateObject[key];
    }
    return s;
  }

  // 为支持收藏书签，需要将任意游戏状态编码为 URL
  // 使用 URLSearchParams 很容易做到
  toURL() {
    let url = new URL(window.location);
    url.searchParams.set('l', this.low);
    url.searchParams.set('h', this.high);
    url.searchParams.set('n', this.numGuesses);
    url.searchParams.set('g', this.guess);
    // 注意，不能在 URL 中编码秘密数值，否则会泄露秘密
    // 如果用户将带有这些参数的书签保存后再打开它，
    // 就会在新的游戏实例中重新生成之间取一个随机数
    return url.href;
  }

  // 这个工厂函数创建一个新 GameState 对象，并使用
  // 指定的 URL 初始化它。如果 URL 不包含预期的参数，
  // 或者如果参数被修改过，则返回 null
  static fromURL(url) {
    let s = new GameState();
    let params = new URL(url).searchParams;
    s.low = parseInt(params.get('l'));
    s.high = parseInt(params.get('h'));
    s.numGuesses = parseInt(params.get('n'));
    s.guess = parseInt(params.get('g'));

    // 如果 URL 缺少任何必需的参数或者解析后不是整数
    // 那么就返回 null
    if (!isNaN(s.low) || !isNaN(s.high) ||
        !isNaN(s.numGuesses) || !isNaN(s.guess)) {
      return null;
    }

    // 每次从 URL 恢复游戏时，都在正确的范围内
    // 选择一个新的秘密数值
    s.secret = s.randomInt(s.low, s.high);
    return s;
  }

  // 返回一个整数 n：min < n < max
  randomInt(min, max) {
    return min + Math.ceil(Math.random() * (max - min - 1));
  }

  // 修改文档显示游戏的当前状态
  render() {
    let heading = document.querySelector("#heading"); // 顶部的 h1
    let range = document.querySelector("#range");     // 显示可视范围
    let input = document.querySelector("#input");     // 猜测输入字段
    let playagain = document.querySelector("#playagain");

    // 更新游戏和页面的标题
    heading.textContent = document.title =
      `I'm thinking of a number between ${this.low} and ${this.high}.`;

    // 更新数值的可视化范围
  	range.style.marginLeft = `${this.low}%`;
	range.style.width = `${this.high - this.low}%`;

	// 保证输入字段为空且获得焦点
	input.value = "";
	input.focus();

    // 根据用户最后一次猜测显示反馈
    // 因为输入字段为空，所以应该显示占位符
    if (this.guess === null) {
      input.placeholder = "Type your guess and hit Enter";
    } else if (this.guess < this.secret) {
      input.placeholder = `${this.guess} is too low. Guess again`;
    } else if (this.guess > this.secret) {
      input.placeholder = `${this.guess} is too high. Guess again`;
    } else {
      input.placeholder = document.title = `${this.guess} is correct`;
      heading.textContent = `You win in ${this.numGuesses} guesses!`;
      playagain.hidden = false;
}

    // 基于用户的猜测更新游戏状态
    // 如果状态更新成功则返回 true，否则返回 false
    updateForGuess(guess) {
      // 如果数值在正确范围内
      if ((guess > this.low) && (guess < this.high)) {
        // 基于这次猜测的数值更新状态对象
        if (guess < this.secret) this.low = guess;
        else if (guess > this.secret) this.high = guess;
        this.numGuesses++;
        return true;
      } else { // 本次猜测无效：通知用户但不更新状态
        alert(`Please enter a number greater than ${this.low} and less than ${this.high}`);
        return false;
      }
    }

    // 有了 GameState 类的定义，只需在适当的时机初始化它。
    // 更新、保存和渲染状态对象即可启动游戏
    // 首次加载时，尝试从 URL 取得游戏状态，如果失败则开始新游戏
    // 如果用户收藏该游戏，则可以通过该 URL 恢复游戏。但如果加载的
    // 页面没有查询参数，则直接启动新游戏
    let gamestate = GameState.fromURL(window.location) || GameState.newGame();

    // 把游戏初始状态保存到浏览器历史中，但在这个初始页面中
    // 使用 replaceState() 而不是 pushState()
    history.replaceState(gamestate, '', gamestate.toURL());

    // 显示初始状态
    gamestate.render();

    // 当用户输入猜测时，根据他们猜测的值更新游戏状态
    // 然后把新状态保存到浏览器历史，并渲染新状态
    document.querySelector('#input').onchange = (event) => {
      if (gamestate.updateForGuess(parseInt(event.target.value))) {
        history.pushState(gamestate, '', gamestate.toURL());
        gamestate.render();
      }
    };

    // 如果用户在历史中后退或前进，则可以在 window 对象上使用 popstate 事件
    // 并在事件处理程序中收到当初通过 pushState() 保存的状态对象的副本
    // 每当此时，就渲染游戏状态
    window.onpopstate = (event) => {
      gamestate = GameState.fromStateObject(event.state); // 恢复状态
      gamestate.render();                               // 并显示它
    };
</script>
</body>
</html>
```

# 15.11 网络

每次我们打开一个网页时，浏览器都会（使用 HTTP 或 HTTPS 协议）发送网络请求，请求 HTML 文档，也请求该文档依赖的图片、字体、脚本和样式表。除了根据用户操作发送网络请求，浏览器也暴露了相关的 JavaScript API。

本节介绍 3 个网络 API：

- 基于**期约的 fetch ()** 方法可以发送 HTTP 和 HTTPS 请求，fetch () API 让发送基本的 GET 请求变得很简单，同时也支持全套的特性，能填满几乎所有 HTTP 用例。
- SSE（Server-Send Event，服务器发送事件）API 是为 HTTP “轮询” 技术提供的基于事件的便利接口，让 Web 服务器可以一直保持连接打开，以便随时向客户端发送数据。
- WebSocket 是一个网络协议，不是 HTTP 但设计时考虑了与 HTTP 互操作。它定义了一个异步消息传递 API，即客户端和服务器可以通过与 TCP 网络套接口类似的方式相互发送和接收消息。

## 15.11.1 fetch()

要发送简单的 HTTP 请求，使用 fetch () 只需三步：

1. 调用 fetch ()，传入要获取内容的 URL；
2. 在 HTTP 响应开始到达时取得第 1 步异步返回的响应对象，然后调用这个响应对象的某个方法，读取响应体；
3. 取得第 2 步异步返回的响应体，按需要处理它。

fetch () API 完全是基于期约的，因为涉及两个异步环节，所以使用 fetch () 时通常要写两个 then () 或两个 await 表达式（如果不记得这些概念了，回顾第 13 章）。

下面这个例子使用了 fetch () 发送请求，并使用 then () 获取服务器返回的 JSON 响应：

```javascript
fetch('/api/users/current')         // 发送 HTTP（或 HTTPS）请求
  .then(response => response.json()) // 把响应体解析为 JSON 对象
  .then(currentUser => {
    displayUserInfo(currentUser);   // 然后处理解析得到的对象
  });
```

下面是一个类似的例子，但使用了 async 和 await 关键字，而且 API 返回的是纯文本，不是 JSON 对象：

```javascript
async function isServiceReady() {
  let response = await fetch('/api/service/status');
  let body = await response.text();
  return body === "ready";
}
```

如果你能理解这两个例子，那就知道了在使用 fetch () API 时的大部分知识。后面几节将演示如何请求和接收比这里更复杂的响应。

>别了，XMLHttpRequest
>
>fetch () API 取代了复杂且名字误导人的 XMLHttpRequest API（其实跟 XML 没什么关系）。在一些遗留代码中也许还能看到 XHR（通常用这个简写）的身影，但在新代码中则完全没有必要使用它了，本章也没有介绍它。不过，假如你想看看以前的 JavaScript 代码如何发送网络请求，可以参考 13.1.3 节，其中有一个 XMLHttpRequest 的例子。

### HTTP 状态码、响应头和网络错误

15.11.1 节展示的三步流程没有包含任何错误处理代码。下面是一个更接近实际的版本：

```javascript
fetch('/api/users/current') // 发送 HTTP（或 HTTPS）请求
  .then(response => {      // 得到响应后，首先检查响应对象
    if (response.ok &&     // 的成功码和预期类型
        response.headers.get('Content-Type') === 'application/json') {
      return response.json(); // 返回包含响应体的期约
    } else {
      throw new Error(     // 或者抛出错误
        `Unexpected response status ${response.status} or content type`
      );
    }
  })
  .then(currentUser => {   // 当 response.json() 返回的期约解决后
    displayUserInfo(currentUser); // 对解析得到的对象进行处理
  })
  .catch(error => {        // 或者，如果发生了什么问题，直接把错误打印出来
    // 如果用户的浏览器离线了，fetch() 本身会拒绝期约
    // 如果服务器返回了意料之外的响应，上面则会抛出错误
    console.log('Error while fetching current user', error);
  });
```

fetch () 返回的期约解决为一个 Response 对象。这个对象的 status 属性是 HTTP 状态码，如表示成功的 200 或表示 "Not Found" 的 404（statusText 中则是与数值状态码对应的标准英文描述）。更方便的是 Response 对象的 ok 属性，它在 status 为 200 或在 200 和 299 之间时是 true，在其他情况下是 false。

当服务器开始发送响应时，fetch () 只要一收到 HTTP 状态码和响应头就会解决它的期约，但此时通常还没收到完整的响应体。虽然响应体尚不完整，但已经可以在流程的第二步检查头部了。Response 对象的 headers 属性是一个 Headers 对象。使用它的 has () 方法可以测试某个头部是否存在，使用它的 get () 方法可以取得某个头部的值。HTTP 头部的名字是不区分大小写的，因此可以给这两个方法传入小写甚至混合大小写形式的头部名。

Headers 对象也是一个可迭代对象，需要时也可以这样用：

```javascript
fetch(url).then(response => {
  for(let [name,value] of response.headers) {
    console.log(`${name}: ${value}`);
  }
});
```

如果浏览器响应了 fetch () 请求，那么返回的期约就会以一个 Response 对象兑现，包括响应 404 Not Found 和 500 Internal Server Error。fetch () 只在自己根本联系不到服务器时才会拒绝自己返回的期约。如果用户的计算机断网了、服务器不响应了，或者 URL 指定的主机不存在，才会发生这种情况。因为这些情况对任何网络请求都可能发生，所以最好在任何 fetch () 调用后面都包含一个 .catch () 子句。

### 设置请求参数

有时候，除了 URL 还需要在发送请求时传递额外的参数。此时可以在 URL 后面加个 ?，然后以名 / 值对形式传递参数。URL 和 URLSearchParams 类（11.9 节介绍过）可以让构建这种形式的 URL 更方便，而 `fetch()` 函数也接收 URL 对象作为其第一个参数，因此可以像下面这样在 `fetch()` 请求中包含请求参数：

```设置请求头部javascript
async function search(term) {
  let url = new URL('/api/search');
  url.searchParams.set('q', term);
  let response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  let resultArray = await response.json();
  return resultArray;
}
```

### 设置请求头部

有时候，还需要为 `fetch()` 请求设置一些头部。比如，如果要请求的 API 校验凭据，可能需要包含 `Authorization` 头部，在其中附上相应的凭据。为此，可以使用两个参数版的 `fetch()`。与以前一样，第一个参数还是一个用于指定 URL 的字符串或 URL 对象。第二个参数用于提供额外选项，包括请求头部：

```javascript
let authHeaders = new Headers();
// 除非建立的是 HTTPS 连接，否则不要使用 Basic 认证。
authHeaders.set('Authorization', 
                'Basic ' + btoa(`${username}:${password}`));
fetch('/api/users', { headers: authHeaders })
  .then(response => response.json())    // 省略错误处理代码
  .then(userList => displayUsers(userList));
```

可以在 `fetch()` 的第二个参数中指定很多其他选项，稍后我们会看到。另一种替代给 `fetch()` 传两个参数的方法是把同样的两个参数传给 `Request()` 构造函数，然后再将创建的 `Request` 对象传给 `fetch()`：

```javascript
let request = new Request(url, { headers });
fetch(request).then(response => ...);
```

### 解析响应体

在前面演示的发送 `fetch()` 请求的三步流程中，第二步结束时调用了 `Response` 对象的 `json()` 或 `text()` 方法，并返回它们返回的期约对象。然后第三步从期约解决开始，直接拿到了响应体解析后的 JSON 对象或文本字符串。

这应该是两种最常见的情况，但并不是获取服务器响应体的全部方式。除了 `json()` 和 `text()`，`Response` 对象还有以下几个方法。

#### `arrayBuffer()`

这个方法返回一个期约，解决为一个 `ArrayBuffer`。在响应包含二进制数据时可以使用这个方法，基于得到的 `ArrayBuffer` 创建一个定型数组（见 11.2 节）或一个 `DataView` 对象（见 11.2.5 节），然后再读取二进制数据。

#### `blob()`

这个方法返回一个期约，解决为一个 `Blob` 对象。本书并没有详尽介绍 `Blob`，它是 “Binary Large Object”（二进制大对象）的意思，在需要处理大量二进制数据的时候会用到。把响应体转换为 `Blob` 时，浏览器实现可能会将响应数据读入一个临时文件，然后返回一个表示该临时文件的 `Blob` 对象。因此，`Blob` 对象不允许像 `ArrayBuffer` 那样随机访问响应体。拿到一个 `Blob` 后，可以通过 `URL.createObjectURL()` 创建一个引用它的 URL，或者使用基于事件的 `FileReader` API 以字符串或 `ArrayBuffer` 的形式异步获取它的内容。在写作本书时，有些浏览器也定义了基于期约的 `text()` 和 `arrayBuffer()` 方法，为获取 `Blob` 的内容提供了直接的手段。

#### `formData()`

这个方法返回一个期约，解决为一个 `FormData` 对象。如果 `Response` 响应体是以`multipart/form-data` 格式编码的，应该使用这个方法。这种编码格式常见于向服务器提交的 `POST` 请求中，在服务器响应中并不常见，所以这个方法不太常用。

### 流式访问响应体

除了分别以某种形式返回完整响应体的 5 个异步响应方法，还可以流式访问响应体。在需要分块处理通过网络接收到的响应时可以采取这种方式，不过，流式访问响应体也可以用于显示进度条，以便用户看到下载进度。

`Response` 对象的 `body` 属性是一个 `ReadableStream` 对象。如果已经调用了 `text()` 或 `json()` 等读取、解析和返回响应体的方法，那么 `bodyUsed` 属性会变成 `true`，表示 `body` 流已经读完了。如果 `bodyUsed` 属性是 `false`，那就意味着该流尚未被读取。此时，可以在 `response.body` 上调 用 `getReader()` 获取该读取器对象，然后通过这个读取器对象的 `read()` 方法异步从流中读取文本块。这个 `read()` 方法返回一个期约，解决为一个带有 `done` 和 `value` 属性的对象。如果响应体整个都读完了或者流被关闭了，`done` 会变成 `true`，而 `value` 要么是下一个 `Uint8Array` 块，要么会在没有更多块时变成 `undefined`。

如果使用 `async` 和 `await`，流式 API 还算简单直观。如果你以原始的形式使用它，可能会复杂得吓人。示例 15-10 通过定义一个 `streamBody()` 函数演示了这个 API。假设你想下载一个大 JSON 文件，并向用户报告下载进度。此时不能使用 `Response` 对象的 `json()` 方法，但可以使用这个 `streamBody()` 函数，如下所示（假设已经定义了一个 `updateProgress()`函数，可以用它设置 HTML `<progress>` 元素的 `value` 属性）：

```javascript
fetch('/big.json')
  .then(response => streamBody(response, updateProgress))
  .then(bodyText => JSON.parse(bodyText))
  .then(handleBigJSONObject);
```

这个 `streamBody()` 函数可以像示例 15-10 所示的那样实现。

示例 15-10：流式访问 `fetch()` 请求的响应体

```javascript
/**
 * 一个流式读取 fetch() 请求返回 Response 对象的异步函数
 * 以 Response 对象作为第一个参数，后面是两个可选的回调
 * 
 * 如果传递了一个函数作为第二个参数，则 reportProgress
 * 回调对于已经处理的每个块都会被调用一次。调用时传入的第一个
 * 参数是已经处理块的总字节数，第二个参数是一个介于 0 和 1
 * 之间的数，表示下载进度如何。如果 Response 对象没有
 * "Content-Length" 头部，那么第二个参数始终将是 NaN
 * 
 * 如果想在读取数据时处理其中的数据，可以传递一个函数作为
 * 第三个参数，每个块都会以 Uint8Array 对应形式传递给这个名
 * 为 processChunk 的函数
 * 
 * streamBody() 返回一个新的、解决为一个字符串。如果提供了
 * processChunk 回调，则这个字符串将是将该函数返回值连接得到
 * 的结果。否则，这个字符串将是把每个块转换为 UTF-8 字符串后
 * 拼接起来得到的结果
 */
async function streamBody(response, reportProgress, processChunk) {
    let bytesRead = 0; // 已读取多少字节，或者如果没有头部就是 NaN
    let expectedBytes = parseInt(response.headers.get("Content-Length"));
    let bytesRead = 0; // 已经读取了多少字节
    let reader = response.body.getReader(); // 读取一块数据
    let decoder = new TextDecoder("utf-8"); // 用于将字节转换为文本
    let body = ""; // 已经读取的文本

    while (true) {
        let { done, value } = await reader.read(); // 循环直到在下面退出
        if (value) { // 如果得到一个字节数组：
            if (processChunk) { // 如果传了这个回调
                let processed = processChunk(value); // 调用回调处理数据
                if (processed) { // 如果回调返回处理后的值
                    body += processed;
                }
            } else { // 否则，把字节转换
                body += decoder.decode(value, { stream: true }); // 为文本
            }

            if (reportProgress) { // 如果传了进度回调
                bytesRead += value.length; // 则调用它报告进度
                reportProgress(bytesRead, bytesRead / expectedBytes);
            }
        }
        if (done) { // 如果这是最后一个块
            break; // 则退出循环
        }
    }
    return body; // 返回累积的响应文本
}
```

在写作本书时，流式 API 还有可能会改进。比如，有计划要将 `ReadableStream` 对象变成异步可迭代对象，以便在 `for/await` 循环（参见 13.4.1 节）中使用。

### 指定请求方法和请求体

目前为止，在每个 `fetch()` 的例子中我们发送的都是 HTTP（或 HTTPS）GET 请求。如果想使用不同的请求方法（如 POST、PUT 或 DELETE），可以直接使用两个参数版的 `fetch()`，传入带 `method` 参数的选项对象：

```javascript
fetch(url, { method: "POST" }).then(r => r.json()).then(handleResponse);
```

POST 和 PUT 请求通常都有一个请求体，该请求体包含要发给服务器的数据。只要 `method` 方法不是 GET 或 HEAD（这两个方法不支持请求体），都可以在选项对象中设置 `body` 属性指定请求体：

```javascript
fetch(url, {
    method: "POST",
    body: "hello world"
})
```

在指定请求体时，浏览器会自动添加合适的 “Content-Length” 请求头。如果请求体中是字符串（像上面的示例那样），浏览器默认的 “Content-Type” 头部是 “text/plain;charset=UTF-8”。如果你也指定一个字符串请求体，那可能需要覆盖这个头部值，为它指定 “text/html” 或 “application/json” 等更具体的类型：

```javascript
fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(requestBody)
})
```

传给 `fetch()` 的选项对象的 `body` 属性不一定是字符串值。如果有保存在定型数组或 `DataView` 对象或 `ArrayBuffer` 中的二进制数据，也可以将 `body` 属性设置为相应的值，并指定恰当的 “Content-Type” 头部。如果是 Blob 中的二进制数据，可以简单地将 `body` 设置为该 Blob，Blob 自身有一个 `type` 属性，用于标明自己的上下文类型，而这个属性的值会用作 “Content-Type” 头部的默认值。

对于 POST 请求，常见的做法是在请求体中传入一组名 / 值参数（而不是将它们编码后作为查询参数附在 URL 后面）。为此有两种做法：

- 可以通过 `URLSearchParams`（本节前面例子中有它的用法示例，相关介绍在 11.9 节）指定参数的名和值，然后把这个 `URLSearchParams` 对象作为 `body` 属性的值。这样做，请求体将被设置为一个类似 URL 查询参数的字符串，而 “Content-Type” 头部也会自动被设置为 “application/x-www-form-urlencoded; charset=UTF-8”。
- 如果使用 `FormData` 对象指定参数的名和值，则请求体将使用更冗余的多部分编码格式，而 “Content-Type” 也将被设置为 “multipart/form-data; boundary=……”，省略号代表与请求体匹配的边界字符串。`FormData` 对象特别适合上传长内容，或者 `File`、`Blob` 这样可能分别有自己特定 “Content-Type” 的对象。可以通过把一个 `<form>` 元素传给 `FormData()` 构造函数来创建 `FormData` 对象，并通过其中的值初始化 `FormData` 对象。但是也可以调用 `FormData()` 构造函数而不传参数，来创建 “multipart/form-data” 请求体，然后再使用 `set()` 和 `append()` 方法来初始化它所表示的名 / 值对。

### 通过 `fetch()` 上传文件

从用户计算机向服务器上传文件是一个常见的任务，可以通过将 `FormData` 对象作为请求体来实现。获得 `File` 对象的一个常用方式是在网页上显示一个 `<input type="file">` 元素，然后监听该元素的 “change” 事件。当 “change” 事件发生时，这个输入元素的 `files` 数组应该至少包含一个 `File` 对象。`File` 对象也可以通过 HTML 的拖放 API 获取。本书没有介绍该 API，你可以从传递给事件监听器（作用于 “drop” 事件）的事件对象的 `dataTransfer.files` 数组获取文件。

另外也要记住，`File` 对象是 `Blob` 的一种，有时候上传 `Blob` 比较有用。假设我们要写一个 Web 应用，允许用户在一个 `<canvas>` 元素上画画，那么可以使用类似以下代码把用户画的 PNG 文件形式上传：

```javascript
// canvas.toBlob() 函数是基于回调的
// 而这里对该方法基于 Promise 的一个封装
async function getCanvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(resolve);
  });
}

// 这个函数可以基于画布上传 PNG 文件
async function uploadCanvasImage(canvas) {
  let pngblob = await getCanvasBlob(canvas);
  let formdata = new FormData();
  formdata.set('canvasImage', pngblob);
  let response = await fetch('/upload', { method: "POST", body: formdata });
  let body = await response.json();
}
```

### 跨源请求

多数情况下，我们在 Web 应用中都是使用 `fetch()` 从自己的服务器请求数据。这种请求也被称为同源请求，因为传给 `fetch()` 的 URL 与包含发送请求脚本的文档是同源的（协议、主机名及端口都相同）。

出于安全考虑，浏览器通常不允许跨源网络请求（当然跨源请求图片和脚本是例外）。不过，利用 CORS（Cross-Origin Resource Sharing，跨资源共享）可以实现安全的跨源请求。在通过 `fetch()` 请求跨源 URL 时，浏览器会为请求添加一个 “Origin” 头部（且不允许通过 `headers` 属性覆盖它的值）以告知服务器这个请求来自不同源的文档。如果服务器对这个请求的响应中包含恰当的 “Access-Control-Allow-Origin” 头部，则请求可以继续。否则，如果服务器没有明确允许请求，则 `fetch()` 返回的期约会被拒绝。

### 中断请求

有时候我们可能想中断已经发出的 `fetch()` 请求，比如用户单击了取消按钮或者请求时间过长。此时，`fetch API` 支持使用 `AbortController` 和 `AbortSignal` 类来中断请求（这两个类定义于通用的 `fetch` 模块，也能在其他 API 中使用）。

如果知道可能要中断某个 `fetch()` 请求，那在创建请求前要先创建一个 `AbortController` 对象。这个控制器对象的 `signal` 属性是一个 `AbortSignal` 对象。在传给 `fetch()` 的第二个请求对象参数中，可以把这个信号对象以 `signal` 属性的值传进去。然后，可以在想中断请求的时候调用控制器对象的 `abort()` 方法，这将会导致与该请求相关的任何期约对象以一个异常被拒绝。

下面的例子展示了通过 `AbortController` 机制对 `fetch()` 请求超时进行强制中断：

```javascript
// 这个函数与 fetch() 类似，但增加了对超时的支持
// 即该函数在 options 对象上设置 timeout 属性。如果
// 过了 timeout 毫秒后请求还没有完成，则中断它
function fetchWithTimeout(url, options = {}) {
  if (options.timeout) { // 如果有 timeout 属性且值不是 0
    let controller = new AbortController(); // 创建中断控制器
    let signal = controller.signal; // 获取 signal 属性
    options.signal = controller.signal;
    // 启动计时器，在超时要毫秒后发出中断信号
    // 注意，我们并未考虑取消这个计时器。在请求
    // 完成后调用 abort() 没有影响
    setTimeout(() => { controller.abort(); }, options.timeout);
  }
  // 现在开始正常发送请求
  return fetch(url, options);
}
```

### 其他请求选项

我们知道可以给 `fetch()`（或者 `Request()` 构造函数）传第二个参数，也就是选项对象，用于指定请求方法、请求头或请求体。这个选项对象还支持其他一些选项。

#### cache

​	这个属性可以用来覆盖浏览器默认的缓存行为。HTTP 缓存这个话题非常复杂，已经超出了本书范围。但如果你了解一些它的工作原理，那可以使用下列值来	控制缓存行为。

#### "default"

​	这个值指定默认缓存行为。如果缓存中的响应还 “新鲜”（fresh），就直接从缓存提供响应；如果缓存中的响应已 “腐败”（stale），则在提供前先重新校验。

##### "no-store"

​	这个值会让浏览器忽略其缓存。发送请求时不会查看缓存，响应回来时也不更新缓存。

##### "reload"

​	这个值告诉浏览器始终要正常发送网络请求，忽略缓存。但是，响应回来以后，要把响应存在缓存里。

##### "no-cache"

​	这个（名字有点误导性的）值告诉浏览器不要提供缓存中新鲜的值。无论缓存中的值新鲜还是腐败，都必须先重新校验再返回。

##### "force-cache"

​	这个值告诉浏览器即使缓存的值已腐败也要用缓存的值作为响应。

#### redirect

这个属性控制浏览器如何处理服务器的重定向响应。有 3 个合法的值。

##### "follow"

​	这是默认值，它让浏览器自动跟随重定向。如果使用这个默认值，则通过 fetch () 获取的 Response 对象的 status 属性应该不会是 300 到 399。

##### "error"

​	这个值会让 fetch () 在服务器返回重定向响应时拒绝其返回的期约。

##### "manual"

​	这个值表示开发者想手工处理重定向响应，而 fetch () 返回的期约可能会被解决为一个 status 在 300 到 399 之间的 Response 对象。这种情况下，必须使用 	Response 的 “Location” 头部手工跟进重定向。

#### referrer

​	这个属性是一个包含相对 URL 的字符串，用于指定 HTTP 的 “Referer” 头部（由于历史原因，这个头部一直被错拼成包含 3 个 r 的版本）的值。如果把这个属	性设置为空字符串，那么请求就会省略 “Referer” 头部。

## 15.11.2 服务器发送事件

HTTP 协议的一个 Web 得以构建于其上的特性，就是客户端发起请求，服务器响应该请求。不过，某些 Web 应用却需要在服务器发生事件时，接收来自服务器发送的通知。

HTTP 天生并不具备这个特性，但随着技术的发展，客户端向服务器发送请求之后，两端都可以不关闭连接。此时一旦服务器有事情要通知客户端，就可以把数据写入这个连接并保持其打开。效果就如同客户端发送了一次网络请求，服务器以缓慢而突发的方式响应，每次响应之间都会经历比较长的暂停。像这样的网络连接通常并不会永远打开，但如果客户端检测到连接已关闭，可以再发一次请求，重新打开一个新连接。

这种让服务器向客户端发送消息的技术效率非常高（尽管服务器端的成本可能较高，因为服务器必须对它的所有客户端都维护一个活动连接）。由于这是一个有用的编程模式，客户端 JavaScript 以 `EventSource API` 的形式对其给予支持。要创建与服务器的这种长时间存在的请求连接，只要向 `EventSource()` 构造函数传入一个 URL 即可。当服务器将（适当格式化的）数据写入这个连接时，`EventSource` 对象会将它们转换为客户端能够监听到的事件：

```javascript
let ticker = new EventSource("stockprices.php");
ticker.addEventListener("bid", (event) => {
  displayEventId(event.data);
});
```

与消息事件关联的事件对象有一个 `data` 属性，保存着服务器针对这次事件发送过来的字符串。与其他事件对象一样，这个事件对象也有一个 `type` 属性，指定了这个事件的名字。服务器确定生成的事件的类型。如果服务器在写入的数据中省略了事件名，那么默认的事件类型就是 “message”。

这个 SSE（Server-Sent Event，服务器发送事件）协议很好理解。客户端（在它创建 `EventSource` 对象时）发起对服务器的连接，服务器保持连接打开。一旦有事件发生，服务器就向连接中写入几行文本。通过网络传送的消息大概类似如下所示（不包含注释）：

```plaintext
event: bid // 设置事件对象的类型
data: GOOO // 设置 data 属性
data: 999 // 附加一个换行符和更多数据
// 空行表示事件结束
```

这个协议还允许为事件指定一个 ID，以便客户端重新建立连接时告诉服务器它上一次接收到的事件 ID 是什么，而服务器可以重新发送它错过的事件。不过，像这样的细节对客户端并不常见，因此这里就不讲述了。

SSE 的一个典型应用是类似在线聊天一样的多用户协作。聊天客户端可以使用`fetch()`把消息发送到聊天室，通过`EventSource`对象订阅聊天信息流。示例 15-11 展示了通过`EventSource`写这么一个聊天客户端有多简单。

示例 15-11：使用`EventSource`实现简单的聊天客户端

```html
<!DOCTYPE html>
<html>
<head><title>SSE Chat</title></head>
<body>
  <!-- 聊天室的UI只有一个文本输入字段 -->
  <!-- 需要先登录，输入个人账号才能聊天 -->
  <input id="input" style="width:100%; padding:10px; border:solid black 2px"/>
  <script>
    // 注意一些UI的细节
    let nick = prompt("Enter your nickname");   // 获取用户昵称
    let input = document.getElementById("input"); // 找到输入字段
    input.focus();                               // 设置键盘焦点

    // 使用 EventSource 注册新消息通知
    let chat = new EventSource("/chat");
    chat.addEventListener("chat", event => {  // 收到聊天消息时
      let div = document.createElement("div"); // 创建 <div> 元素
      div.append(event.data);                  // 添加消息的文本
      input.before(div);                       // 添加到输入字段前
      input.scrollIntoView();                  // 确保输入元素可见
    });

    // 使用 fetch() 把用户消息发送到服务器
    input.addEventListener("change", () => {  // 当用户按回车时
      fetch("/chat", {                         // 发送HTTP请求
        method: "POST",
        body: nick + ": " + input.value        // 包含用户昵称和输入
      }).catch(console.error);                 // 忽略响应，但打印错误
      input.value = "";                        // 清除输入框
    });
  </script>
</body>
</html>
```

聊天程序的服务器端代码并不比客户端代码复杂多少。示例 15-12 是一个简单的 Node HTTP 服务器。当客户端请求根 URL“/” 时，这个服务器会发送示例 15-11 所示的客户端代码。当客户端向 URL“/chat” 发送 GET 请求时，它会保存响应对象并保持连接打开。而当客户端向 URL“/chat” 发送 POST 请求时，它会把请求体作为聊天消息并对每个保存的响应对象使用 “text/event-stream” 格式。服务器代码监听端口 8080，因此在通过 Node 运行后，在浏览器中访问`http://localhost:8080`即可连接到服务器，然后就可以跟自己聊天了。

示例 15-12：SSE 聊天服务器

```javascript
// 这是服务器端 JavaScript，需要在 Node.js 环境下执行
// 这里实现了一个简单聊天，包含匿名聊天室
// POST 新消息到 /chat，或 GET /chat 得到
// text/event-stream 格式的消息；GET / 则
// 返回包含客户端聊天 UI 的简单 HTML 文件
const http = require("http");
const fs = require("fs");
const url = require("url");

// 聊天客户端的 HTML 文件。在下面使用
const clientHTML = fs.readFileSync("chatclient.html");

// 保存其中发送事件的 ServerResponse 对象的数组
let clients = [];

// 创建一个新服务器，监听端口 8080
let server = new http.Server();
server.listen(8080); // 连接 localhost:8080 使用它

// 服务器在收到新请求时，将运行这个函数
server.on("request", (request, response) => {
  // 解析请求的 URL
  let pathname = url.parse(request.url).pathname;

  // 如果请求的是“/”，发送客户端聊天 UI
  if (pathname === "/") {
    response.writeHead(200, {"Content-Type": "text/html"}).end(clientHTML);
  }
  // 否则对于任何非
  // “GET”和“POST”方法，都发送 404 错误
  else if (pathname !== "/chat" || 
           (request.method !== "GET" && request.method !== "POST")) {
    response.writeHead(404).end();
  }
  // 如果 /chat 请求方法是 GET，则说明有客户端连接
  else if (request.method === "GET") {
    acceptNewClient(request, response);
  }
  // 否则 /chat 请求是 POST 的一条新消息
  else {
    broadcastNewMessage(request, response);
  }
});

// 这里处理对 /chat 端点的 GET 请求，该请求
// 在客户端创建新 EventSource 对象（或者
// EventSource 对象自动重连）时生成
function acceptNewClient(request, response) {
  // 记住这个响应对象，以便稍后可以向它发送消息
  clients.push(response);

  // 如果客户端关闭了连接，就从活动
  // 客户端数组中删除相应的响应对象
  request.connection.on('end', () => {
    clients.splice(clients.indexOf(response), 1);
    response.end();
  });

  // 设置头且只向这一个客户端发送初始的聊天事件
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });
  response.write('event: chat\ndata: Connected\n\n');

  // 注意：这里有意没有调用 response.end()
  // 保持连接打开是 SSE 运行的关键
}

// 这个函数在响应对 /chat 端点的 POST 请求时调用
// 每当用户输入新消息时客户端都会发送这个请求
async function broadcastMessage(request, response) {
  // 读取请求体以获取用户消息
  let body = '';
  request.setEncoding('utf8');
  for await (let chunk of request) {
    body += chunk;
  }

  // 读取完响应体后，发送一个空响应并关闭连接
  response.writeHead(200);
  response.end();

  // 以 text/event-stream 形式来格式化消息，
  // 解析消息的 "data"
  let message = `data: ${body.replace('\n', '\ndata: ')}`;

  // 为消息数据添加一个前缀，将其定义为 "chat" 事件
  // 并在后面附加两个换行符，标记该事件的结尾
  let event = `event: chat\n${message}\n\n`;

  // 下面把这个事件传递给所有监听的客户端
  clients.forEach(client => client.write(event));
}
```

## 15.11.3 WebSocket

WebSocket API 是一个复杂、强大的网络协议对外暴露的简单接口。WebSocket 允许 JavaScript 代码在浏览器中与服务器方便地交换文本和二进制消息。与服务器发送事件（SSE）类似，客户端必须建立连接，而连接一旦建立，服务器就可以异步向客户端发送消息。与 SSE 不同，WebSocket 支持二进制消息，而且消息可以双向发送，而不仅仅是从服务器向客户端发消息。

支持 WebSocket 的网络协议是对 HTTP 的扩展。虽然 WebSocket API 是传统的低级网络套接接口，但标识连接端点的并不是 IP 地址和端口。在使用 WebSocket 协议连接服务时，要通过 URL 指定该服务，就像使用 Web 服务一样。WebSocket URL 协议以 `ws://` 而不是 `https://` 开头（浏览器通常会限制只能在安全的 `https://` 连接加载的页面中使用 WebSocket）。

要建立 WebSocket 连接，浏览器首先要建立一个 HTTP 连接，并向服务器发送这个请求，要在客户端 JavaScript 中使用 WebSocket，服务器必须遵循 WebSocket 协议，按照该协议发送和接收数据。如果你已经部署了这么一个 WebSocket 服务器，那本节将介绍与连接的客户端有关的一切。假如你的服务器并不支持 WebSocket 协议，可以考虑使用服务器发送事件（参见 15.11.2 节）。

### 创建、连接及断开连接

如果想与支持 WebSocket 的服务器通信，需要创建一个 `WebSocket` 对象，指定表示服务器的 `wss://` URL 和要使用的服务：

```javascript
let socket = new WebSocket("wss://example.com/stockticker");
```

创建 WebSocket 时，连接过程会自动开始，但新创建的 WebSocket 在第一次返回时不会建立连接。

这个套接字对象的 `readyState` 属性表明了当前的连接状态。这个属性可能包含下列值：

#### WebSocket.CONNECTING

​	WebSocket 正在连接。

#### WebSocket.CLOSING

​	WebSocket 已经连接，可以通信了。

#### WebSocket.CLOSING

​	WebSocket 正在关闭。

#### WebSocket.CLOSED

​	WebSocket 已经关闭，不能再通信了。初始连接失败时也是这个状态。

当 WebSocket 的状态从 `CONNECTING` 转变为 `OPEN` 时，它会触发 “open” 事件。可以通过设置 WebSocket 对象的 `onopen` 属性或调用该对象的 `addEventListener()` 来监听这个事件。

如果 WebSocket 连接发生了协议错误或其他错误，WebSocket 对象会触发 “error” 事件。可以通过设置 `onerror` 来定义事件处理程序，也可以使用 `addEventListener()`。

在使用完 WebSocket 之后，可以调用 WebSocket 对象的 `close()` 方法关闭连接。当连接状态变成 CLOSED 时，WebSocket 对象会触发 “close” 事件，可以设置 `onclose` 属性来监听这个事件。

### 通过 WebSocket 发送消息

要向位于 WebSocket 连接另一端的服务器发送消息，调用 WebSocket 对象的 `send()` 方法。`send()` 方法接收一个消息参数，可以是字符串、Blob、ArrayBuffer、定型数组或 DataView 对象。

`send()` 方法会把要发送的消息存在缓冲区，并在实际发送前返回。WebSocket 对象的 `bufferedAmount` 属性保存着还在缓冲区未发送的字节数（奇怪的是，当这个值变成 0 时 WebSocket 居然不触发任何事件）。

### 通过 WebSocket 接收消息

要通过 WebSocket 从服务器接收消息，注册 “message” 事件处理程序，可以设置 WebSocket 对象的 `onmessage` 属性，也可以调用 `addEventListener()`。与 “message” 事件关联的事件对象是 `MessageEvent` 的实例，其 `data` 属性包含服务器的消息。如果服务器发送了 UTF-8 编码的文本，`event.data` 就是保存该文本的字符串。如果服务器发送二进制格式的消息，则 `data` 属性（默认）是表示该数据的 Blob 对象。如果你希望接收 ArrayBuffer 而不是 Blob，可以把 WebSocket 对象的 `binaryType` 属性设置为 `arraybuffer`。

还有其他一些 Web API 也使用 `MessageEvent` 对象交换消息。其中有的使用结构化克隆算法（参见 15.10.4 节）通过消息传输复杂数据结构。WebSocket 不在其列：通过 WebSocket 交换的消息要么是 Unicode 字符的字符串，要么是字节的字符串（表现为 Blob 或 ArrayBuffer）。

### 协议协商

WebSocket 协议支持文本和二进制消息交换，但并未规定这些消息的结构或含义。使用 WebSocket 的应用必须在其提供的简单消息交换机制基础上自行协商通信协议。使用 `wss://` URL 可以为此提供方便，每个 URL 通常都有自己如何交换消息的规则。如果你的代码连接到 `wss://example.com/stockticker`，那可能就知道会收到关于股价的消息。不过，协议自身也会不断改进。如果一个假想的股票报价协议更新了，可以定义一个新 URL 并连接到更新服务，如 `wss://example.com/stockticker/v2`。但基于 URL 来区分版本还不够。对于已经随时间变化的复杂协议，最终可能出现多个版本的线上服务并存的局面，而客户端也分别支持不同版本的协议。

基于这个问题，WebSocket 协议和 API 提供了应用级消息协商功能。在调用 `WebSocket()` 构造函数时，`wss://` URL 是第一个参数，但也可以传一个字符串数组作为第二个参数。传入这个参数后，就相当于把客户端能够处理的应用协议提供给服务器，由服务器从中选择一个协议（如果服务器不支持其中任何一个子协议，也可以报错）。连接建立以后，WebSocket 对象的 `protocol` 属性将保存服务器选择的子协议。

# 15.12 存储

Web 应用可以使用浏览器 API 在用户计算机上本地存储数据。客户端存储的目的是让浏览器能够记住一些信息。比如，Web 应用可以存储用户偏好，或者存储他们的完成状态，以便恢复上次离开时的情境。客户端存储是按起源来隔离的，因此来自一个站点的页面不能读取来自另一个站点的页面存储的数据。但来自同一站点的两个页面可以共享存储的数据，并将其作为一种通信机制。比如，在一个网页的表单中输入的数据可以在另一个页面中以表格形式显示出来。Web 应用可以选择它们存储数据的生命周期：可以临时存储，只保留到窗口关闭或浏览器退出；也可以保存在用户计算机上，持久化存储数月甚至数年。

客户端存储分为如下几种形式。

## Web Storage

​	Web Storage API 包含 `localStorage` 和 `sessionStorage` 对象，本质上是映射字符串键和值的持久化对象。Web Storage 很容易使用，适合存储大量（不	是巨量）数据。

## Cookie

​	Cookie 是一种古老的客户端存储机制，是专门为服务端脚本使用而设计的。浏览器也提供了一种笨拙的 JavaScript API，可以在客户端操作 cookie，但这个 	API 很难用，而且只适合保存少量数据。另外，保存在 cookie 中的数据也会随 HTTP 请求发送给服务器，哪怕这些数据只对客户端有用。

## IndexedDB

​	IndexedDB 是一种异步 API，可以访问支持索引的对象数据库。

>存储、安全与隐私
>
>浏览器经常主动提出要帮你记住密码，然后以加密形式将它们安全地存储在设备上。但本章讨论的所有客户端数据存储技术都不涉及加密。换句话说，应该假设 Web 应用会以未加密的形式将数据保存在用户的设备上。因此这些保存下来的数据可以被使用设备的其他用户或者潜入设备的恶意软件（如后门程序）访问到。为此，任何形式的客户端存储技术都不能用来保存密码、财务账号或其他类似的敏感信息。

## 15.12.1 localStorage 和 sessionStorage

Window 对象的 localStorage 和 sessionStorage 属性引用的是 Storage 对象。Storage 对象与普通 JavaScript 对象非常类似，只不过：

- Storage 对象的属性必须是字符串；
- Storage 对象中存储的属性是持久化的。如果你设置了 localStorage 对象的一个属性，然后用户刷新了页面，你的程序仍然可以访问在该属性中保存的值。

例如，可以像下面这样使用 localStorage 对象：

```javascript
let name = localStorage.username;    // 查询存储的值
if (!name) {
  name = prompt("What is your name?"); // 问用户一个问题
  localStorage.username = name;        // 存储用户的回答
}
```

可以使用 delete 操作符删除 localStorage 和 sessionStorage 的属性，可以使用 for/in 循环或 Object.keys () 枚举 Storage 对象的属性。如果想删除 Storage 对象的所有属性，可以调用 clear () 方法：

```javascript
localStorage.clear();
```

Storage 对象也定义了 getItem ()、setItem () 和 removeItem () 方法，可以用来代替直接读写属性和 delete 操作符。

别忘了 Storage 对象的属性只能存储字符串。如果想存取其他类型的数据，必须自己编码和解码。

例如：

```javascript
// 如果存储数值，数值会自动转换为字符串
// 别忘了在读取完这个值以后解析它
localStorage.x = 10;
let x = parseInt(localStorage.x);

// 保存 Date 的时候把它转换为字符串，取得字符串后再解析它
localStorage.lastRead = (new Date()).toUTCString();
let lastRead = new Date(Date.parse(localStorage.lastRead));

// JSON 编码器保存其他原始值或嵌套结构很方便
localStorage.data = JSON.stringify({f:4, a:[1,2,3]}); // 编码存储
let data = JSON.parse(localStorage.data); // 读取解码
```

### 存储的生命周期和作用域

localStorage 和 sessionStorage 的差异主要体现在生命周期和作用域上。通过 localStorage 存储的数据是永久性的，除非 Web 应用用户通过浏览器（特定的界面）删除，否则数据会永远保存在用户设备上。

localStorage 的作用域为文档来源。正如 15.1.8 节中解释的，文档来源由协议、域名和端口共同定义。所有同源文档都共享相同的 localStorage 数据（与实际访问 localStorage 的脚本的来源无关）。同源文档可以相互读取对方的数据，可以重写对方的数据。但非同源文档的数据相互之间是完全隔离的，既读不到也不能重写（即使它们运行的脚本来自同一台第三方服务器）。

注意，localStorage 的作用域也受浏览器实现的限制。如果你使用 Firefox 访问某个网站，然后又使用 Chrome 访问，那么第一次访问时存储的任何数据都无法在第二次访问时存取。

通过 sessionStorage 保存的数据与通过 localStorage 保存的数据的生命周期不同。sessionStorage 数据的生命周期与存储它的脚本所属的顶级窗口或浏览器标签页相同。窗口或标签页永远关闭后，通过 sessionStorage 存储的所有数据都会被删除（不过要注意，现代浏览器有能力再次打开最近关闭的标签页并恢复用户上次浏览的会话，因此这些标签页以及与之关联的 sessionStorage 的生命周期有可能比看起来更长）。

sessionStorage 的作用域与 localStorage 类似，都是文档来源。换句话说，不同来源的文档永远不会共享 sessionStorage。但是，sessionStorage 的作用域也在窗口间隔离。如果用户在两个浏览器标签页中打开了同一来源的文档，这两个标签页的 sessionStorage 数据也是隔离的。一个标签页中运行的脚本不能读取或重写另一个标签页中的脚本写入的数据，即便两个标签页打开的是完全相同的页面，而且运行的脚本完全相同。

### 存储事件

存储在 localStorage 中的数据每次发生变化时，浏览器都会在该数据可见的其他 Window 对象（不包括导致该变化的窗口）上触发 "storage" 事件。如果浏览器打开了两个标签页，加载了两个同源页面，其中一个页面在 localStorage 中存储了一个值，则另一个标签页会收到 "storage" 事件。

要注册`storage`事件，可以使用`window.onstorage`事件属性，或者调用`window.addEventListener()`并传入`"storage"`。

与`storage`事件关联的事件对象有如下一些重要属性。

#### key

​	写入或删除项的键或名字。如果调用了`clear()`方法，这个属性的值为`null`。

#### newValue

​	保存变化的新值（如果有）。如果调用了`removeItem()`，这个属性不存在。

#### oldValue

​	保存变化的或被删除的已有项的旧值。如果添加了一个新属性（没有旧值），这个属性不存在。

#### storageArea

​	变化的`Storage`对象。通常是`localStorage`对象。

#### url

​	导致这次存储变化的脚本所在文档的 URL（字符串）。

注意，`localStorage`和`storage`事件可以作为一种广播机制，即浏览器向所有当前浏览同一网站的窗口发送消息。比如，如果用户要求网站停止执行动画，网站可以把该偏好保存在`localStorage`中，以便未来访问时进行。通过存储这个偏好，它会生成一个事件，让其他显示相同网站的窗口也能遵守这个要求。

还有一个例子，在一个 Web 版图片编辑应用中，工具面板会显示在一个分离的窗口中。当用户选择某种工具时，应用可以使用`localStorage`保存当前状态，并生成一个通知告诉其他窗口用户选择了新工具。

## 15.12.2 cookie

cookie 是浏览器为特定网页或网站保存的少量命名数据。cookie 是为服务端编程而设计的，在最低的层级上作为 HTTP 协议的扩展实现。cookie 数据会自动在浏览器与 Web 服务器之间传输，因此服务器端脚本可以读写存储在客户端的 cookie 值。本节演示客户端脚本如何使用`Document`对象的`cookie`属性操作 cookie 数据。

>为什么叫 cookie？
>
>cookie 这个名字并没有什么深意，而且也是有先例的。在计算的历史长河中，“cookie” 或 “magic cookie” 曾被用于指代一小段数据，特别是某种特权或信任的凭据（类似于密码），可以证明身份或授权访问。在 JavaScript 中，cookie 用于保存状态并且可以作为浏览器的某种标识。但 JavaScript 中的 cookie 并不以任何形式进行加密，无论怎么说都是不安全的（尽管通过 HTTPS 连接发送 cookie 会安全一些）。

操作 cookie 的 API 很古老也很难用，因为没有涉及方法，查询、设置和删除 cookie，都是通过读写`Document`对象的`cookie`属性实现的，而且要使用特定格式的字符串。每个 cookie 的生命周期和作用域可以通过`cookie`属性来个别指定，这些属性同样也以特定格式的字符串在同一个`cookie`属性上面设置。

接下来几个小节会讲解如何查询和设置 cookie 值以及相应的属性。

### 读取 cookie

`document.cookie`属性返回一个包含与当前文档有关的所有 cookie 的字符串。这个字符串是一个分号和空格分隔的名 / 值对。cookie 的值就是名 / 值对中的值，不包含任何与该 cookie 关联的属性（后面会讨论 cookie 的属性）。为了使用`document.cookie`属性，通常必须调用`split()`方法把整个字符串拆分成个别的名 / 值对。

从`cookie`属性中提取出某个 cookie 的值之后，必须根据 cookie 创建者的格式或编码来解释该值。例如，可能需要先把 cookie 值传给`decodeURIComponent()`，然后再传给`JSON.parse()`。

下面的代码定义了一个`getCookies()`函数，可以解析`document.cookie`属性并返回一个对象。这个对象的属性中包含文档的 cookies 的名字和值：

```javascript
// 返回一个包含文档cookie的Map对象
// 假设cookie的值是以encodeURIComponent()编码的
function getCookies() {
    let cookies = new Map();       // 要返回的对象
    let all = document.cookie;     // 要解析的所有cookie的大字符串
    if (all === "") return cookies; // 没有cookie
    let list = all.split("; ");    // 将字符串拆分成一个个的名/值对
    for(let cookie of list) {      // 对于列表中的每个cookie
        let p = cookie.indexOf("="); // 找到等号的位置
        if (p === -1) continue;    // 如果没有等号，就跳过
        let name = cookie.substring(0, p); // 获取cookie的名字
        let value = cookie.substring(p+1); // 获取cookie的值
        value = decodeURIComponent(value); // 对值进行解码
        cookies.set(name, value);  // 把cookie的名字和值
    }
    return cookies;
}
```

### cookie 的属性：生命期与作用域

除了名字和值，每个 cookie 还有可选的属性，用于控制其生命期和作用域。在介绍如何使用 JavaScript 设置 cookie 之前，必须先解释 cookie 的属性。

cookie 默认的生命期很短，它们存储的值只在浏览器会话期间存在，用户退出浏览器后就会丢失。如果想让 cookie 的生命期超过单个浏览会话，必须告诉浏览器你希望保存它们多长时间（以秒为单位）。为此要指定 cookie 的`max-age`属性。如果指定了这样一个生命期，浏览器将把 cookie 存储在一个文件中，等时间到了再把它们删除。

与`localStorage`和`sessionStorage`类似，cookie 的可见性由文档来源决定，但也由文档路径决定。换句话说，cookie 的作用域通过`path`和`domain`属性来配置。默认情况下，cookie 关联着创建它的网页，以及与该网页位于相同目录和子目录下的其他网页，这些网页都可以访问它。比如，如果网页`example.com/catalog/index.html`创建了一个 cookie，则该 cookie 对`example.com/catalog/order.html`和`example.com/catalog/widgets/index.html`同样可见，但对`example.com/about.html`不可见。

这个默认的作用域通常也是我们想要的。但有时候，你可能希望让 cookie 对整个网站可见，无论它是哪个页面创建的。例如，用户在某个页面的表单中输入自己的收件地址，你希望保存这个地址并在用户下次再来时将其作为默认地址，同时也将其作为另一个页面中完全无关的要求用户填写账单地址的表单的默认值。为此，可以为 cookie 指定`path`属性，然后来自同一服务器的任何网页，只要其 URL 以你指定的路径前缀开头，就可以共享该 cookie。例如，如果`example.com/catalog/Widgets/index.html`设置的 cookie 将路径设置为`“/catalog”`，则该 cookie 也对`example.com/catalog/order.html`可见。或者，如果将路径设置为`“/”`，那么该 cookie 将对`example.com`域中的任何页面都可见，此时这个 cookie 的作用域就跟`localStorage`一样。

默认情况下，cookie 的作用域按照文档来源区分。不过大网站可能需要跨子域名共享 cookie。例如，`order.example.com`对应的服务器可能需要读取`catalog.example.com`设置的 cookie 值，这时候就要用到`domain`属性了。如果 cookie 是由`catalog.example.com`上的页面设置的，且`path`属性被设置为`“/”`，`domain`属性被设置为`“.example.com”`，则该 cookie 将对`catalog.example.com`、`order.example.com`，以及任何`example.com`域名下的服务器有效。注意，不能将 cookie 的域设置为服务器父域名之外的其他域名。

最后一个 cookie 属性是`secure`，一个布尔值，用于指定如何通过网络传输 cookie 值。默认情况下，cookie 是不安全的，换句话说，它们会在普通的不安全的 HTTP 连接上传输。如果把 cookie 设置为安全的，那么就只能在浏览器与服务器通过 HTTPS 或其他安全协议连接时传输 cookie。

>Cookie 的限制
>
>Cookie 主要用于为服务器端脚本存储少量数据，而且该数据在每次请求相关 URL 时都会发送给服务器。定义 cookie 的标准建议浏览器厂商不限制 cookie 的数量和大小，但没有要求浏览器保留总共 300 个以上的 cookie、每个服务器 20 个 cookie 或每个 cookie 大小为 4KB（名字和值包含在这 4KB 之内）。实践中，浏览器通常允许大大超过 300 个 cookie，但某些浏览器仍然限制 4KB 大小。

### 存储 cookie

要给当前文档关联一个短暂的 cookie，只要把`document.cookie`设置为`name=value`形式的字符串即可：

```javascript
document.cookie = `version=${encodeURIComponent(document.lastModified)}`;
```

下次读取这个 cookie 属性时，你保存的这个名 / 值对就会包含在文档的 cookie 列表中。在 cookie 值不能包含分号、逗号或空格。为此，可能需要使用核心 JavaScript 的全局函数`encodeURIComponent()`先对值进行编码，然后再把它保存到 cookie 中。如果进行了编码，那么在将来读取 cookie 值时还必须使用对应的`decodeURIComponent()`函数来解码。

简单名 / 值对形式的 cookie 只在当前会话期间存在，用户关闭浏览器就会丢失。要创建可以跨会话存在的 cookie，则要通过`max-age`属性指定其生命期（单位为秒）。此时保存在`cookie`属性中的字符串形式为`name=value; max-age=seconds`。下面这个函数在设置 cookie 时能够可选地添加`max-age`属性：

```javascript
// 把name/value对存储为cookie，使用
// encodeURIComponent()编码值，以转义
// 分号、逗号和空格。如果daysToLive是个数值，则设置max-age属性，从而让cookie
// 在指定的天数后过期。否则，cookie是会话cookie
function setCookie(name, value, daysToLive=null) {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (daysToLive !== null) {
        cookie += `; max-age=${daysToLive*86400}`;
    }
    document.cookie = cookie;
}
```

类似地，可以向`document.cookie`属性上追加`path=value`或`domain=value`这样的字符串来设置 cookie 的路径和域属性。要设置`secure`属性，只要追加`;secure`即可。

要修改 cookie 的值，需要以相同的名字、路径和域再设置一次它的值。在修改 cookie 值时，可以通过指定一个新的`max-age`属性修改 cookie 的生命期。

要删除 cookie，需要以相同的名字、路径和域名再设置一次，指定一个任意值（或空值），并将 `max-age` 属性指定为 0。

## 15.12.3 IndexedDB

Web 应用架构一直以来都是客户端上的 HTML、CSS 和 JavaScript 和服务器上的数据库。因此，听说 Web 平台支持一个简单的对象数据库，可以通过 JavaScript API 在用户计算机上持久存储 JavaScript 对象且按需查询，你可能会很惊讶。

IndexedDB 是一个对象数据库，不是关系型数据库，比支持 SQL 查询的数据库更简单。而且比 localStorage 提供的键 / 值对存储机制更强大、高效和可靠。与 localStorage 类似，IndexedDB 数据库的作用域限定为包含文档的来源。换句话说，两个同源的网页可以互相访问对方的数据，但不同源的网页则不能相互访问。

每个来源可以有任意数量的 IndexedDB 数据库。每个数据库的名字必须在当前来源下唯一。在 IndexedDB API 中，数据库就是一个名为**对象存储**的集合。顾名思义，对象存储中存储的是对象。对象会使用结构化克隆算法（参见 15.10.4 节）序列化为对象存储。这意味着你存储的对象可以拥有 Map、Set 或定型数组作为属性值。每个对象必须有一个键，可以用于排序和从存储中检索。键必须唯一（相同存储中的两个对象不能使用相同的键），而且必须有自然顺序以便排序。JavaScript 字符串、数值和 Date 对象都是有效的键。IndexedDB 数据库可以自动为插入数据库中的每个对象生成一个唯一的键。不过，通常插入对象存储中的对象都会有一个属性适合作为键。在这种情况下，可以在创建对象存储时为该属性指定一个 “**键路径**”。从概念上讲，键路径是一个值，它告诉数据库如何从对象存储中找键。

除了以对象存储中对象的主键值检索对象，有时候也需要按照对象其他属性的值来搜索。为此，可以在对象存储上定义任意数量的**索引**（索引对象存储的能力正是 IndexedDB 名字的由来）。每个索引为存储的对象定义了一个次键。这些索引一般并不是唯一的，因此多个对象可能匹配一个键值。

IndexedDB 提供了**原子保证**，即查询和更新数据库会按照事务进行分组，要么全部成功，要么全部失败，永远不会让数据库处于未定义、部分更新的状态。IndexedDB 中的事务比很多数据库 API 都简单，稍后我们还会介绍。

从概念上讲，IndexedDB API 非常简单。要查询或更新数据库，首先要打开对应的数据库（通过名字）。然后，创建一个事务对象并使用该对象查找数据库中相应的对象存储（同样通过名字）。最后，通过调用该对象存储的 `get()` 方法查询对象、或通过调用 `put()` 方法存储新对象（或者如果想避免重写已有对象，可以调用 `add()` 方法）。

如果想查询键在某个范围内的对象，需要创建一个 `IDBRange` 对象并指定范围的上、下边界，然后把它传给对象存储的 `getAll()` 或 `openCursor()` 方法。

如果想使用次键来查询，可以先查找对象存储的命名索引，然后调用该索引对象的 `get()`、`getAll()` 或 `openCursor()` 方法，传入一个键或一个 `IDBRange` 对象。

不过，由于 IndexedDB API 是异步的（因此 Web 应用可以使用它而不阻塞浏览器的主 UI 线程），所以这种概念上的简化并不容易理解。IndexedDB 是在期约得到广泛支持之前定义的，因此这个 API 是基于事件而非基于期约的。这意味着不能对它使用 `async` 和 `await`。

创建事务和查找对象存储及索引是同步操作。但打开数据库、更新对象存储和查询存储或索引全都是异步操作。这些异步方法都会立即返回一个请求对象。浏览器会在请求成功或失败时在这个请求对象上触发成功或失败事件，你在代码中可以通过 `onsuccess` 和 `onerror` 属性定义处理程序。在 `onsuccess` 处理程序中，操作的结果可以通过请求对象的 `result` 属性得到。另一个有用的事件是 `"complete"`，它会在事务成功完成时在事务对象上触发。

这个异步 API 有个方便的特性，就是它简化了事务管理。IndexedDB API 强制你创建事务对象，然后才能取得对象存储并进行查询和更新。如果是同步 API，可能调用一个 `commit()` 方法就知道事务完成了。但在 IndexedDB 中，事务是在所有 `onsuccess` 处理程序运行且没有引用该事务的更多异步请求时自动提交的（只要不显示地中断它）。

IndexedDB API 还有一个重要的事件。在第一次打开一个数据库时，或者在增大一个已有数据库的版本号时，`IndexedDB` 会在调用 `indexedDB.open()` 返回的请求对象上触发`"upgradeneeded"` 事件。这个 `"upgradeneeded"` 事件的处理程序要负责定义或更新这个新数据库的模式（或已有数据库的新版本）。对于 IndexedDB 数据库，这意味着要创建对象存储和在这些对象存储上定义索引。而且事实上，IndexedDB API 唯一一次让你创建对象存储或索引，就是在响应 `"upgradeneeded"` 事件的时候。

在了解了 IndexedDB 的概况之后，应该可以理解示例 15-13。这个示例使用 IndexedDB 创建和查询了一个数据库，这个数据库将美国邮政编码映射到美国城市。示例演示了很多（但不是全部）IndexedDB 的基本功能，代码有点长，但注释很多。

示例 15-13：美国邮政编码的 IndexedDB 数据库

```javascript
// 这个辅助函数异步获取数据库对象，（必要时）创建并初始化数据库）并将它传给回调
function wtfisb(calllback) {
	let request = indexedDB.open("zpcodes", 1); // 请求数据库的 v1 版
	request.onerror = console.error; // 请求错误
	request.onsuccess = () => {  // 或者在完成时调用这个函数
    let db = request.result; // 请求的结果是数据库
    callback(db);           // 调用回调并传入数据库
};

// 如果数据库的 v1 版不存在，则会触发这个
// 事件处理程序。这个处理程序会初次创建
// 数据库时创建并初始化对象存储，或者在
// 数据库模式切换时修改它们
request.onupgradeneeded = () => { initdb(request.result, callback); };
}

// withDB() 在数据库尚未初始化时会调用这个函数
// 这个函数会创建数据库并为它填充数据，然后把
// 数据库传给回调函数
//
// 我们的邮编数据库包含一个对象存储，对象格式为：
// {
//   zipcode: "02134",
//   city: "Allston",
//   state: "MA",
// }
// 这里使用 zipcode 属性作为数据库键，并为城市名
// 创建一个索引
function initdb(db, callback) {
    // 创建对象存储，指定存储的名字和一个选项对象
    // 选项对象包含“键路径”(keyPath)，指定的是
    // 这个存储的键字段的属性名
    let store = db.createObjectStore("zipcodes", { keyPath: "zipcode" });

    // 除了通过邮政编码，还通过城市名来索引这个对象存储
    // 调用这个方法时，键路径以必需的字符串参数形式直接
    // 传入，而不是通过一个选项对象来传入
    store.createIndex("cities", "city");

    // 现在取得用来初始化数据库的数据
    // 这个 zipcodes.json 数据文件是 CC 许可的数据，来源为
    // www.geonames.org；下载地址是 https://download.geonames.org/export/zip/US.zip
    fetch("zipcodes.json")
        .then(response => response.json()) // 发起 HTTP GET 请求
        .then(zipcodes => {               // 解析 JSON 响应体
            // 为了向数据库中插入邮政编码，需要开一个事务编写记录
            // 使用哪个对象存储（我们只有一个），且
            // 告诉它们要写入数据，不仅是读取数据：
            let transaction = db.transaction(["zipcodes"], "readwrite");
            transaction.onerror = console.error;

            // 从事务中取得对象存储
            let store = transaction.objectStore("zipcodes");

            // IndexedDB API 最大的优点就是对象存储
            // 真的很简单。下面就是添加（或更新）记录：
            for(let record of zipcodes) { store.put(record); }

            // 当事务成功完成，数据库就被初始化可以使用了
            // 此时可以调用最初传给 withDB() 的回调函数
            transaction.oncomplete = () => { callback(db); };
        });
}
});

// 给一个邮政编码，使用 IndexedDB API 异步查询对应的城市
// 然后将结果传给指定的回调，如果没有找到，则传 null
export function lookupCity(zip, callback) {
    withDB(db => {
        // 创建一个只读的事务对象用于查询
        // 参数是要使用的对象存储的数组
        let transaction = db.transaction(["zipcodes"]);

        // 从事务中取得对象存储
        let zipcodes = transaction.objectStore("zipcodes");

        // 现在查找与指定邮政编码匹配的对象
        // 上面的代码是同步的，但这是异步的
        let request = zipcodes.get(zip);
        request.onerror = console.error; // 记录错误
        request.onsuccess = () => {     // 或者在成功时调用这个函数
            let record = request.result; // 这是查询的结果
            if (record) { // 如果找到了匹配结果，把它传给回调
                callback(`${record.city}, ${record.state}`);
            } else {     // 否则，告诉回调查询失败了
                callback(null);
            }
        };
    });
}

// 给一个城市的名字，使用 IndexedDB API 异步查询
// （所有美国州的）所有名字相同的城市（区分大小写）
// 对应的所有邮政编码。
export function lookupZipcodes(city, callback) {
    withDB(db => {
        // 跟上面一样，先创建事务再取得对象存储
        let transaction = db.transaction(["zipcodes"]);
        let store = transaction.objectStore("zipcodes");

        // 这一次也取得对象存储的城市索引
        let index = store.index("cities");

        // 从索引中查询与指定城市名匹配的所有记录
        // 找到以后，把它们传给回调函数。如果想
        // 得到更多结果，可能要使用 IDBCursor()
        let request = index.getAll(city);
        request.onerror = console.error;
        request.onsuccess = () => { callback(request.result); };
    });
}
```

# 15.13 工作线程与消息传递

单线程是 JavaScript 的一个基本特性，因此浏览器绝不会同时运行两个事件处理程序，也不会在一个事件处理程序运行的时候触发其他计时器。这样就无法并发更新应用或文档状态，而前端开发者就无须思考甚至理解并发编程。一个必然的结果就是 JavaScript 函数不能运行太长时间，否则它们就会阻塞事件循环，而浏览器也会变得不能响应用户输入。事实上这也是`fetch()`被设计为异步函数的原因。

浏览器通过`Worker`类非常谨慎地放松了这种单线程的限制。这个类的实例代表与主线程和事件循环同时运行的线程。`Worker`运行于独立的运行环境，有着完全独立的全局对象，不能访问`Window`或`Document`对象。`Worker`与主线程只能通过异步消息机制通信。这意味着并发修改 DOM 仍然是不可能的，但也意味我们可以写长时间运行的函数，而不会阻塞事件循环、卡死浏览器。创建新工作线程（worker）并不会像打开新浏览器窗口那么 “重量级”，但也并非 “轻于鸿毛”。为了执行简单的操作而创建新工作线程是完全没有必要的。复杂 Web 应用可能会创建几十个工作线程，但要创建几百或者几千个工作线程也是不切实际的。

工作线程适合执行计算密集型任务，比如图像处理。使用工作线程把这类任务从主线程转移走可以避免浏览器卡顿。而工作线程也提供了把任务分给多个线程的可能。除此之外，工作线程也适合频繁执行较密集的计算。例如，假设你在实现一个网页版代码编辑器，想在代码高亮功能。为了正确地高亮代码，需要每次敲击键盘都解析一次代码。但如果在主线程做这件事，很可能会因为解析代码而导致键盘输入的事件处理程序不能迅速响应用户的击键操作，让用户体验变的迟滞。

与任何线程 API 一样，`Worker` API 也有两部分。一部分是`Worker`对象，另一部分是`WorkerGlobalScope`。前者是这个线程的外部部分，后者则是线程的内在部分。

接下来几小节将介绍`Worker`和`WorkerGlobalScope`，也会讲解允许工作线程与主线程通信的消息传递 API。同样的通信 API 也用于文档与其包含的`<iframe>`元素之间的消息交换，相关内容也将在后面的小节介绍。

## 15.13.1 Worker 对象

要创建新的工作线程，调用`Worker()`构造函数，传入一个 URL，这个 URL 用于指定线程要执行的 JavaScript 代码：

```javascript
let dataCruncher = new Worker("utils/cruncher.js");
```

如果传入的是相对 URL，则会按照调用`Worker()`构造函数的脚本所在文档的位置进行解析。如果传入的是绝对 URL，则必须与包含文档同源（协议、主机和端口都相同）。

创建`Worker`对象后，可以使用`postMessage()`方法向工作线程发送数据。传给`postMessage()`的值会使用结构化克隆算法（参见 15.10.4 节）被复制，得到的副本会通过消息事件发送给工作线程：

```javascript
dataCruncher.postMessage("/api/data/to/crunch");
```

这里只发送了一个字符串消息，也可以发送对象、数组、定型数组、映射、集合，等等。通过监听`Worker`对象的`"message"`事件，可以从工作线程接收消息：

```javascript
dataCruncher.onmessage = function(e) {
  let stats = e.data; // 消息保存在事件对象的data属性中
  console.log(`Average: ${stats.mean}`);
}
```

与所有事件目标一样，`Worker`对象定义了标准的`addEventListener()`和`removeEventListener()`方法，可以用它们代替`onmessage`。

除了`postMessage()`，`Worker`对象只有另外一个方法`terminate()`，用于强制停止工作线程。

## 15.13.2 工作线程中的全局对象

在通过`Worker()`构造函数创建新工作线程时，传入的 URL 指定的是一个 JavaScript 代码文件。其中的代码会在一个新的、干净的 JavaScript 执行环境中执行，与创建工作线程的脚本完全隔离。这个新执行环境中的全局对象是一个`WorkerGlobalScope`对象。`WorkerGlobalScope`比核心 JavaScript 全局对象多一些东西，但又比客户端中完整的`Window`对象少一些东西。

`WorkerGlobalScope`对象也有`postMessage()`方法和`onmessage`事件处理程序，只是方向与`Worker`对象上的恰好相反。在工作线程内部调用`postMessage()`会在外部生成消息事件，而在工作线程外部发送的消息会转换为事件并发送给内部的`onmessage`事件处理程序。因为`WorkerGlobalScope`是工作线程的全局对象，`postMessage()`和`onmessage`在工作线程的代码中看起来就像一个全局函数和一个全局变量。

如果给`Worker()`构造函数传入对象作为第二个参数，而该对象有一个`name`属性，则这个属性的值就会成为工作线程中全局对象的`name`属性的值。在通过`console.warn()`或`console.error()`打印的任何消息中，工作线程都包含这个名字（name）。

而`close()`函数可以让工作线程终止自己，效果与调用`Worker`对象的`terminate()`方法一样。

由于 WorkerGlobalScope 是工作线程的全局对象，因此它拥有核心 JavaScript 全局对象的所有属性，如 JSON 对象、isNaN () 函数、Date () 函数。不过，除此之外，WorkerGlobalScope 也拥有下列客户端 Window 对象的属性。

- self 是对全局对象自身的引用。WorkerGlobalScope 不是 Window 对象，没有定义 window 属性。
- setTimeout ()、clearTimeout ()、setInterval ()、clearInterval () 等定时器方法。
- location 属性描述传给 Worker () 构造函数的 URL。这个属性引用一个 Location 对象，就像 Window 对象上的 location 属性一样。Location 对象有 href、protocol、host、hostname、port、pathname、search 和 hash 属性。但在工作线程中，这些属性都是只读的。
- navigator 属性引用的是一个类似 Window 的 Navigator 对象。工作线程的 Navigator 对象拥有 appName、appVersion、platform、userAgent 和 onLine 属性。
- 常用的事件目标方法 addEventListener () 和 removeEventListener ()。

最后，WorkerGlobalScope 对象还包含重要的客户端 JavaScript API，比如 Console 对象、fetch () 函数和 IndexedDB API。WorkerGlobalScope 也包含 Worker () 构造函数，这意味着工作线程也可以创建自己的工作线程。

## 15.13.3 在工作线程中导入代码

浏览器支持 Worker 的时候 JavaScript 还不支持模块系统，因此工作线程有自己一套独特的系统用于导入外部代码。WorkerGlobalScope 定义了 importScripts () 全局函数，所有工作线程都可以使用：

```javascript
// 在开始之前，加载需要的类和辅助程序
importScripts("utils/Histogram.js", "utils/BitSet.js");
```

importScripts () 接收一个或多个 URL 参数，每个 URL 引用一个 JavaScript 代码文件。相对 URL 的解析相对于传给 Worker () 构造函数的 URL（而不是相对于包含文档）。importScripts () 按照传入顺序一个接一个地同步加载并执行这些文件。如果加载某个脚本时出现网络错误，或者如果执行某个脚本时抛出了任何错误，则后续脚本都不会再加载或执行。通过 importScripts () 加载的脚本自身也可以调用 importScripts () 加载自己的依赖文件。不过，要注意的是 importScripts () 不会跟踪已经下载了哪些脚本，也不会阻止循环依赖。

importScripts () 是同步函数，即它会在所有脚本都加载并执行完毕后返回。importScripts () 返回后，就可以立即使用它所加载的脚本，不需要回调、事件处理程序、then () 方法或 await。一旦习惯了客户端 JavaScript 的异步特性，再碰到简单的同步代码反而会让人觉得有点怪。但这正是线程的优点，工作线程中的任何阻塞函数都不会影响主线程的事件循环，也不会影响其他工作线程中的并行计算。

>在工作线程中使用模块
>
>为了在工作线程中使用模块，必须给 Worker () 构造函数传入第二个参数。这个参数必须是一个有 type 属性且值为 module 的对象。给 Worker () 构造函传入 type: "module" 选项与在 HTML <script> 标签中添加 type="module" 类似，都是表示应该将当前代码作为模块来解释，并允许使用 import 声明。

如果工作线程加载的是模块而非常规脚本，WorkerGlobalScope 上不会再定义 importScripts () 函数。

注意，截止到 2020 年初，Chrome 是唯一真正在工作线程中支持模块和 import 声明的浏览器。

## 15.13.4 工作线程执行模型

工作线程自上而下地同步运行自己的代码（和所有导入的脚本及模块），之后就进入了异步阶段，准备对事件和定时器作出响应。如果注册了 "message" 事件处理程序，只要有收到消息事件的可能，则工作线程就不会退出。而如果工作线程没有监听消息事件，它会运行直到没有其他待决的任务（如 fetch () 预约和定时器），且所有任务相关的回调都被调用。在所有注册的回调都被调用后，工作线程已经不可能再启动新任务了，此时线程可以安全退出，而且是自动的。工作线程也可以调用全局的 close () 函数显式将自己终止。注意，Worker 对象上没有任何属性或方法可以告诉我们工作线程是否还在运行，因此除非与父线程协商一致，否则工作线程不应该主动终止自己。

### 工作线程中的错误

如果工作线程中出现了异常，而且没有被 catch 子句捕获，则会在全局对象上触发 "error" 事件。如果这个事件有处理程序，而且处理程序调用了事件对象的 preventDefault ()，则错误会停止传播。否则，"error" 事件会在 Worker 对象上触发。如果这里调用了 preventDefault ()，则传播停止。否则，开发者控制台会打印出错误消息，并调用 Window 对象的 onerror 处理程序（参见 15.1.7 节）。

```javascript
// 在工作线程内处理未被捕获的错误
self.onerror = function(e) {
  console.log(`Error in worker at ${e.filename}:${e.lineno}: ${e.message}`);
  e.preventDefault();
};

// 否则，就要在工作线程外处理未被捕获的错误。
worker.onerror = function(e) {
    console.log(`Error in worker at ${e.filename}:${e.lineno}: ${e.message}`);
    e.preventDefault();
};
```

与在 window 上类似，工作线程也可以注册一个事件处理程序，以便制约被拒绝又没有 .catch () 函数处理它时调用。为此，可以在工作线程内定义一个 `self.onunhandledrejection` 函数，或者使用 `addEventListener()` 为全局事件 "unhandledrejection" 注册一个全局处理程序。传给这个处理程序的事件对象有一个 promise 属性，值为被拒绝的期约对象，还有一个 reason 属性，值为传给 .catch () 函数的值。

## 15.13.5 postMessage ()、MessagePort 和 MessageChannel

Worker 对象的 `postMessage()` 方法和工作线程内部的全局 `postMessage()` 函数，都是通过调用在创建工作线程时一起创建的一对 MessagePort（消息端口）对象的 `postMessage()` 方法来实现通信的。客户端 JavaScript 无法直接访问这两个自动创建的 MessagePort 对象，但可以通过 `MessageChannel()` 构造函数创建一对新的关联端口：

```javascript
let channel = new MessageChannel();  // 创建新信道
let myPort = channel.port1;         // 它有两个相互
let yourPort = channel.port2;       // 连接的端口
myPort.postMessage("Can you hear me?");  // 在一个端口上发送消息
yourPort.onmessage = (e) => console.log(e.data);  // 可在另一个端口收到
```

```javascript
yourPort.onmessage = (e) => console.log(e.data);  // 可在另一个端口收到
```

MessageChannel 是一个对象，有两个属性 port1 和 port2，引用一对关联的 MessagePort 对象。MessagePort 对象有一个 `postMessage()` 方法和一个 `onmessage` 事件处理程序属性。在一个消息端口上调用 `postMessage()`，会触发关联消息端口的 "message" 事件。通过设置 `onmessage` 属性或调用 `addEventListener()` 为 "message" 事件注册监听器可以收到这些 "message" 事件。

发送到一个端口的消息在该端口定义 `onmessage` 属性或调用 `start()` 方法之前会被放在一个队列中。这样可以防止信道一端发送的消息被另一端错过。如果调用了 MessagePort 的 `addEventListener()`，不要忘了调用 `start()`，否则可能永远看不到发送来的消息。

前面看到的 `postMessage()` 调用都接收一个消息参数。实际上这个方法还接收可选的第二个参数，该参数是一个数组，数组的元素不是被复制到信道另一端，而是被转移到信道另一端。像这样可以转移而非复制的值包括 MessagePort 和 ArrayBuffer（有些浏览器也实现了其他可转移类型，如 ImageBitmap 和 OffscreenCanvas，但这些类型并未得到普遍支持，因此本书未做介绍）。如果 `postMessage()` 的第一个参数包含一个 MessagePort（嵌套在消息对象中某个地方），那么该 MessagePort 也必须出现在第二个参数中。这样一来，这个 MessagePort 将被转移到另一个线程，并在当前线程立即失效**注 1**。假设你已经创建了一个工作线程，但希望有两个信道能够与之通信：一个信道用于交换普通数据，另一个信道用于交换高优先级消息。那么可以在主线程中创建一个 MessageChannel，然后调用 Worker 对象的 `postMessage()` 方法，把其中一个 MessagePort 传给工作线程：

```javascript
let worker = new Worker("worker.js");
let urgentChannel = new MessageChannel();
let urgentPort = urgentChannel.port1;
worker.postMessage({ command: "setUrgentPort", value: urgentChannel.port2 },
                  [ urgentChannel.port2 ]);
// 现在可以像这样接收工作线程发过来的紧急消息
urgentPort.addEventListener("message", handleUrgentMessage);
urgentPort.start(); // 开始接收消息
// 像这样发送紧急消息
urgentPort.postMessage("test");
```

使用 MessageChannel 也可以实现两个工作线程间直接通信，从而避免通过主线程代为转发消息。

`postMessage()` 的第二个参数还可以用来在工作线程间转移而非复制 ArrayBuffer。对于较大的 ArrayBuffer，比如保存图像数据的 ArrayBuffer 而言，这样可以在很大程度上提升性能。当 ArrayBuffer 被 MessagePort 转移到另一端之后，原始线程就无法再使用该 ArrayBuffer 了，因而不存在并发访问其内容的可能。如果 `postMessage()` 的第一个参数中包含一个 ArrayBuffer，则该 ArrayBuffer 可以作为数组元素出现在 `postMessage()` 的第二个参数中。如果确实出现了，那么它会被转移而非复制。如果没有出现，那么这个 ArrayBuffer 就会被复制而不会被转移。示例 15-14 将展示通过这种技术转移 ArrayBuffer。

## 15.13.6 通过 postMessage () 跨源发送消息

在客户端 JavaScript 中，`postMessage()` 方法还有另一个使用场景。这个场景涉及窗口而不是工作线程，但两个场景有很多类似之处，只不过接下来要介绍的是 Window 对象上的 `postMessage()` 方法。

如果文档中包含一个 `<iframe>` 元素，则该元素就像一个嵌入但独立的窗口。表示 `<iframe>` 的 Element 对象有一个 `contentWindow` 属性，也就是那个嵌套文档的 Window 对象。对于在这个嵌入窗格（iframe）中运行的脚本，`window.parent` 属性引用包含文档的 Window 对象。当两个窗口显示的文档具有相同来源时，两个窗口中的脚本都拥有访问另一个窗口中内容的权限。但是如果两个文档的来源不同，浏览器的同源策略将阻止两个窗口中的 JavaScript 相互访问对方的内容。

对于工作线程，`postMessage()` 为两个独立的线程提供了无须共享内存就能通信的安全机制。对于窗口，`postMessage()` 也为两个独立的来源提供了安全交换消息的受控机制。即便同源策略阻止脚本访问另一个窗口的内容，仍然可以调用另一个窗口的 `postMessage()`，这样会触发该窗口的 “message” 事件，从而让该窗口脚本中的事件处理程序接收到。

不过，Window 对象上的 `postMessage()` 方法与工作线程的 `postMessage()` 方法有一点不同。第一个参数仍然是可以通过结构化克隆算法复制的任意消息。但包含要转移而非复制对象的第二个可选参数变成了可选的第三个参数。窗口的 `postMessage()` 方法以一个字符串作为其必需的第二个参数。这第二个参数应该是一个源（协议、主机名和可选的端口号），用于指定你希望谁接收这条消息。如果传入 “[https://good.example.com](https://good.example.com/)” 作为第二个参数，但消息发送到了一个内容来源为 “[https://malware.example.com](https://malware.example.com/)” 的窗口，那么你发送的消息将不会被派送。如果你想把消息发送给任意来源的窗口，可以传 “*” 通配符作为第二个参数。

在一个窗口或 `<iframe>` 中运行的 JavaScript 代码可以通过定义窗口的 `onmessage` 属性或通过调用 `addEventListener()` 为 “message” 事件注册处理程序，接收发送到该窗口或该帧的消息。与线程类似，在接收到 “message” 事件时，事件对象的 `data` 属性是发送过来的消息。不过，除此之外，派送到窗口的 “message” 事件也定义了 `source` 和 `origin` 属性。`source` 属性是发送事件的 Window 对象，因此可以使用 `event.source.postMessage()` 发送回信。`origin` 属性则是该窗口中内容的源。这个源是消息发送方无法伪造的，因此在收到 “message” 事件时，通常应该先验证发送消息的源的合法性。

# 15.14 示例：曼德布洛特集合

本章的高潮部分是一个长示例，这个示例演示了使用工作线程和消息机制并行完成计算密集型任务。不过，因为示例本身是一个交互式的真实 Web 应用，所以其中也涉及本章介绍的很多其他 API，包括历史管理，基于 `<canvas>` 使用 ImageData 类，以及键盘、光标和缩放事件等。此外这个示例也演示了重要的核心 JavaScript 特性，比如生成器，以及对闭包的深度应用。

如图 15-16 所示，这个示例程序用于显示和探索曼德布洛特集合，即一种包含漂亮图案的复数分形。

图 15-16：曼德布洛特集合的一部分

这里的曼德布洛特集合是通过一组复平面上的点来定义的。在反复完成一系列复数乘法和加法计算后，这个复平面会产生一个大小在一定范围内的值。这个集合的轮廓极其复杂，计算哪些点在这个集合中，哪些点不在这个集合中，属于计算密集型任务。要产生 500×500 大小的曼德布洛特集合图像，必须计算 25 万个像素中的每个像素，判断它们是否属于该集合。而要验证与每个像素关联的值没有超出既定范围，必须重复完成 1000 甚至更多次复数乘法（迭代次数越多，得到的集合边界也越清晰。迭代次数越少，边界越模糊）。想到生成一幅高质量的曼德布洛特集合图片需要高达 2.5 亿次复数运算，就不难理解为什么工作线程是个得力的帮手了。示例 15-14 展示了我们使用的工作线程代码。这个文件相对简洁，其中只包含了大型程序所需的原始算力。不过，有两件事需要说明一下。

- 这个工作线程创建了一个 ImageData 对象，用于表示矩形的像素网格。针对这个网格会计算曼德布洛特集合的成员。但它并没有在 ImageData 中存储实际的像素值，而是使用了一个自定义的定型数组，将每个像素当成一个 32 位整数。工作线程在这个数组中存储了每个像素必需的迭代次数。如果针对每个像素计算得到的复数大小超过了 4，从数学上可以保证它不会受限制，我们称其为 “逃逸了”。因此这个工作线程针对每个像素返回的值都是在该值逃逸前的迭代次数，我们告诉工作线程对于每个值它应该尝试的最大迭代次数，以及到达最大值就可以认为是集合成员的像素。
- 这个工作线程把 ImageData 关联的 ArrayBuffer 发送回主线程，因此无重复复制与之关联的内存。

示例 15-14：用于计算曼德布洛特集合区域的工作线程代码

```javascript
// 这是一个简单的工作线程，它从父线程接收消息
// 执行消息所描述的计算，然后再把计算结果发送
// 回父线程
onmessage = function(message) {
  // 首先，分析接收到的消息：
    // - ttile 是具有 width 和 height 属性的对象，
    //   表示需要计算其中包含的曼德布洛特集合
    //   成员的像素矩形的大小
    // - (x0, y0) 是复平面上的一个点，对应
    //   切片（ttile）的左上角位置的像素
    // - perPixel 是实数轴和虚数轴上的像素大小
    // - maxIterations 指定在判定某个像素在
    //   集合中之前要执行的最大迭代次数
    const {ttile, x0, y0, perPixel, maxIterations} = message.data;
    const {width, height} = ttile;

    // 接下来，我们创建 ImageData 对象，用以表示
    // 像素的矩形数组，取得其内部 ArrayBuffer，
    // 并创建缓冲的定型数组。这样做可以将
    // 每个像素当作 32 位数值处理，每个像素的每个色
    // 道（以及透明度）在数组中保存为 1 个字节。我们会在
    // 文末（《》处）把迭代次数转换为像素颜色
    const imageData = new ImageData(width, height);
    const iterations = new Uint32Array(imageData.data.buffer);

    // 现在开始计算。这里有 3 个嵌套的 for 循环
    // 外面两个循环像素的行和列，内部的循环
    // 迭代每个像素，检查这是否“逃逸了”
    // 以下是几个循环变量：
    // - row 和 column 是整数，表示像素坐标
    // - x 和 y 表示每个像素的复数点：x + yi
    // - index 是数组 iterations 中当前像素的索引
    // - n 记录每个像素的迭代次数
    // - max 和 min 记录当前矩形中已经检查过的像素的
    //   最大和最小迭代次数
    let index = 0, max = 0, min = maxIterations;
    for(let row = 0, y = y0; row < height; row++, y += perPixel) {
      for(let column = 0, x = x0; column < width; column++, x += perPixel) {
        // 对每个像素，都从复数 c = x+yi 开始
        // 然后按照如下递归公式，重复计算复数 z(n+1):
        // z(n+1) = z(n)^2 + c
        // 如果 |z(n)| (z(n)的大小) 大于 2，则
        // 像素不属于集合，在 n 次迭代后停止
        // n: 目前为止迭代的次数
        let n;
        let r = x, i = y; // 从把 z(0) 设置为 c 开始
        for(n = 0; n < maxIterations; n++) {
          let rr = r*r, ii = i*i; // 计算 z(n) 两部分的平方
          if (rr + ii > 4) {     // 如果 |z(n)|^2 大于 4，
            break;               // 就是逃逸了，停止迭代
          }
          i = 2*r*i + y;         // 计算 z(n+1) 的虚数部分，
          r = rr - ii + x;       // 及 z(n+1) 的实数部分
        }
        iterations[index++] = n; // 记录每个像素的迭代次数
        if (n > max) max = n;    // 记录当前为目的最大值，
        if (n < min) min = n;    // 同时记录最小值
      }
    }

    // 计算完成后，把结果发送回父线程。此时会
    // 复制 ImageData 对象，但它包含的巨大的
    // ArrayBuffer 只会转移出去，从而提升性能
    postMessage({ttile, imageData, min, max}, [imageData.data.buffer]);
};
```

例 15-15 展示了使用以上工作线程代码的曼德布洛特集合查看程序。既然本书中最长的这一章已经接近尾声，那么这个示例某种程度上也是一个巅峰体验的示例，其中集合了很多重要的核心和客户端 JavaScript 特性及 API。代码中的注释非常完整，建议读者认真阅读。

示例 15-15：显示和探索曼德布洛特集合的 Web 应用

```javascript
/*
 * 这个切片类表示一张画布或图片上的小矩形
 * 切片可以把画布切成可以由工作线程独立处理的区块
 */
class Tile {
  constructor(x, y, width, height) {
    this.x = x;           // 这里 Tile 对象的
    this.y = y;           // 属性表示大矩形
    this.width = width;   // 中切片的位置及
    this.height = height; // 大小
  }
}

// 这个静态方法是一个生成器，用于将指定宽
// 和高度的矩形切分成指定行数和列数。国度
// 会生成表示每个小矩形的 Tile 对象
class Tile {
  static *subdivide(width, height, numRows, numCols) {
    let rowHeight = Math.ceil(height / numRows);
    let columnWidth = Math.ceil(width / numCols);

    for(let row = 0; row < numRows; row++) {
      let tileHeight = (row < numRows-1)    // 大多数行的高度
                        ? rowHeight
                        : height - rowHeight * (numRows-1); // 最后一行的高度
      for(let col = 0; col < numCols; col++) {
        let tileWidth = (col < numCols-1)   // 大多数列的宽度
                          ? columnWidth
                          : width - columnWidth * (numCols-1); // 最后一列的宽度
        yield new Tile(col * columnWidth, row * rowHeight,
                       tileWidth, tileHeight);
      }
    }
  }
}

/*
 * 这个类表示一个工作线程池，所有工作线程运行的代码都一样
 * 工作线程的代码必须可以按照接收到的消息执行某些计算，
 * 并发送回一条包含该计算结果的消息
 * 有了 WorkerPool 和表示要完成任务的消息，只需在调用 addWork () 时传入该消息作为参数。如果某个 Worker 对象空闲了，则消息就会立即发送给该工作线程。如
 * 果没有空闲的 Worker 对象，消息就会被放到队列中，等有 Worker 空闲时再发送
 * 
 * addWork () 返回一个期约，该期约将以任务完成后发送回来的消息解决，如果工作线程抛出未处理的错误，期约将会被拒绝
 */
class WorkerPool {
  constructor(numWorkers, workerSource) {
    this.idleWorkers = [];    // 当前空闲的工作线程
    this.workQueue = [];      // 当前未处理的任务
    this.workerMap = new Map(); // 将工作线程映射到解决和拒绝函数

    // 创建指定数量的工作线程，添加消息及错误处理程序
    // 然后将它们保存在idleWorkers数组中
    for(let i = 0; i < numWorkers; i++) {
      let worker = new Worker(workerSource);
      worker.onmessage = (message) => {
        this._workerDone(worker, null, message.data);
      };
      worker.onerror = (error) => {
        this._workerDone(worker, error, null);
      };
      this.idleWorkers[i] = worker;
    }
  }

  // 工作线程完成任务时会调用这个方法
  // 可能发回消息，也可能抛出错误
  _workerDone(worker, error, response) {
    // 找到这个工作线程的resolve()和reject()函数
    // 然后从映射中删除这个工作线程的条目
    const [resolver, rejector] = this.workerMap.get(worker);
    this.workerMap.delete(worker);

    // 如果队列中没有任务，把这个工作线程放回空闲线程数组
    // 否则，从队列中出任务，把任务发送给这个工作线程
    if (this.workQueue.length === 0) {
      this.idleWorkers.push(worker);
    } else {
      let [work, resolver, rejector] = this.workQueue.shift();
      this.workerMap.set(worker, [resolver, rejector]);
      worker.postMessage(work);
    }

    // 最后，解决或拒绝与这个工作线程关联的期约
    error === null ? resolver(response) : rejector(error);
  }

  // 这个方法把任务添加到工作线程池并返回一个期约
  // 该期约会在任务完成时解决为工作线程的响应
  // 任务是一个通过postMessage()发送给工作线程的消息
  // 如果有空闲的工作线程，则会立即发送任务消息
  // 否则，任务会被放到队列中，等待空闲的工作线程
addWork(work) {
    return new Promise((resolve, reject) => {
      if (this.idleWorkers.length > 0) {
        let worker = this.idleWorkers.pop();
        this.workerMap.set(worker, [resolve, reject]);
        worker.postMessage(work);
      } else {
        this.workQueue.push([work, resolve, reject]);
      }
        toURL() {
    let u = new URL(window.location);
    u.searchParams.set("cx", this.cx);
    u.searchParams.set("cy", this.cy);
    u.searchParams.set("pp", this.perPixel);
    u.searchParams.set("it", this.maxIterations);
    return u.href;
}
    });
  }
}

/*
* 这个类保存渲染曼德布洛特集合所需的状态信息
* 其中，cx和cy属性是图片中心在复平面中的点
* 而perPixel属性指定图片中一个像素对应的复数
* 中多少实数和虚数部分的变化。maxIterations属性
* 指定计算这个集合的工作难度。这个数值越大，
* 计算量越越大，但产生的图片越锐利。注意画布的
* 大小没有保存在这个状态信息中。有了cx、cy和
* perPixel，可以按照当前大小在画布上画渲染
* 曼德布洛特集合的任意部分
* 
* 这个类的对象用于history.pushState()，也
* 用于从收藏夹和共享URL中读取预期的状态
*/
class PageState {
  // 这个工厂方法返回用于显示整个集合的初始状态
  static initialState() {
    let s = new PageState();
    s.cx = -0.5;
    s.cy = 0;
    s.perPixel = 3 / window.innerHeight;
    s.maxIterations = 500;
    return s;
  }

  // 这个工厂方法从URL中获取状态，如果无法
  // 从URL中读取有效的状态就返回null
  static fromURL(url) {
    let s = new PageState();
    let u = new URL(url); // 根据URL的搜索参数初始化状态
    s.cx = parseFloat(u.searchParams.get('cx'));
    s.cy = parseFloat(u.searchParams.get('cy'));
    s.perPixel = parseFloat(u.searchParams.get('pp'));
    s.maxIterations = parseInt(u.searchParams.get('it'));
    // 如果取得了有效的值，返回PageState对象；否则返回null
    return (isNaN(s.cx) || isNaN(s.cy) || isNaN(s.perPixel) ||
            isNaN(s.maxIterations))
      ? null
      : s;
  }

	// 这个实例方法把当前状态编码为浏览器当前位置的搜索参数
    toURL() {
    let u = new URL(window.location);
    u.searchParams.set("cx", this.cx);
    u.searchParams.set("cy", this.cy);
    u.searchParams.set("pp", this.perPixel);
    u.searchParams.set("it", this.maxIterations);
    return u.href;
}

// 这几个常量控制同时运行多少曼德布洛特集合计算
// 可以根据自己计算机的配置调整，以获得最佳性能
    const ROWS = 3, COLS = 4, NUMWORKERS = navigator.hardwareConcurrency || 2;

// 这是我们曼德布洛特集合的主类
// 直接用要渲染的<canvas>元素调用构造函数即可
// 程序假设这个<canvas>元素的样式始终让它保持
// 方形
class MandelbrotCanvas {
    constructor (canvas) {
// 存储画布，取得其上下文对象，并初始化 WorkerPool
        this.canvas = canvas;this.context = canvas.getContext ("2d");
        this.workerPool = new WorkerPool (NUMWORKERS, "mandelbrotworker.js");
	// 定义几个后面要用到的属性
        this.tiles = null; 
        // 画布的某个区域
        this.pendingRender = null; // 当前并未渲染
        this.wantsRender = false; // 当前不需要渲染
        this.resizeTimer = null; // 防止过于频繁的缩放
        this.colorTable = null; // 用于把原始数据转换为像素值
	// 设置事件处理程序
        this.canvas.addEventListener ("pointerdown", e => this.handlePointer (e));
        window.addEventListener ("keydown", e => this.handleKey (e));
        window.addEventListener ("resize", e => this.handleResize (e));
        window.addEventListener ("popstate", e => this.setState (e.state, false));
	// 根据 URL 初始化状态，或者获取初始状态
        this.state = PageState.fromURL (window.location) || PageState.initialState ();
	// 通过历史机制保存状态
        history.replaceState (this.state, "", this.state.toURL ());
	// 设置画布大小并取得覆盖它的切片数组
        this.setSize ();
	// 把曼德布洛特集合渲染到画布上
        this.render ();
    }
    
	// 设置画布大小并初始化 Tile 对象的数组
    // 这个方法会在构造函数中调用，也会在浏览器
    // 窗口缩放时被 handleResize () 方法调用
    setSize () {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.tiles = [...Tile.tiles (this, this.height, ROWS, COLS)];
    }

    // 这个函数修改 PageState，然后用新状态重新渲染
    // 曼德布洛特集合。也通过 history.pushState ()
    // 保存新状态。如果第一个参数是一个函数，会调用
    // 该函数并传入状态对象，用函数返回值修改状态对象
    // 如果第一个参数是对象，直接把该对象的属性复制
    // 到状态对象中。如果可选的第二个参数是 false，则
    // 不保存新状态（我们会在响应 popstate 事件时调用
    //setState 时这么做）
    setState (f, save = true) {
        // 如果第一个参数是函数，调用它更新状态
        // 否则，把它的属性复制到当前状态
        if (typeof f === "function") 
        {
            f (this.state);
        } else {
            for (let property in f) {
                this.state [property] = f [property];
            }
        }
        // 无论如何，都尽快渲染新状态
        this.render ();
		// 正常情况下会保存新状态。除非被调用时第二个
        // 参数是 false，这表示在响应 popstate 事件
        if (save) {
            history.pushState (this.state, "", this.state.toURL ());
        }
    }
	
    // 这个方法异步将 PageState 对象指定的曼德布洛特集合的一
    // 部分绘制到画布上。构造函数会调用它。setState () 在状态
    // 变化时会调用它，画布大小变化时缩放处理程序也会调用它
    render () {
        // 有时候用户会使用键盘或鼠标触发渲染，但有可能
        // 比计算速度快。我们不希望把所有渲染请求发送给
        // 工作线程池。如果正在渲染中，那么只做一个标记，
        // 表明需要重新渲染。在当前渲染完成后，我们才会查
        // 渲染当前状态，可能会跳过多个中间状态
    if (this.pendingRender) { // 如果已经在渲染中了，
        this.wantsRerender = true; // 做个标记表明稍后需要重新渲染
        return; // 现在则什么也不做
    }
        
        // 取得状态变量并计算画布左上角位置的复数
        let { cx, cy, perPixel, maxIterations } = this.state;
        
        let x0 = cx - perPixel * this.width/2;
    let y0 = cy - perPixel * this.height/2;

    // 对每个 ROWS*COLS 切片，调用 addWork() 并发送消息给
    // mandelbrotWorker.js 中的代码。把得到的期约对象
    // 收集到一个数组中
    let promises = this.titles.map(title => this.workerPool.addWork({
      tile: title,
      x0: x0 + title.x * perPixel,
      y0: y0 + title.y * perPixel,
      perPixel: perPixel,
      maxIterations: maxIterations
    }));

    // 使用 Promise.all() 从期约数组中取得响应的数组
    // 每个响应对应其中一个切片的计算结果。回想一下，
    // 在 mandelbrotWorker.js 中，每个响应都包含指
    // 定 Tile 对象、包含迭代数目像素值的 ImageData 对象，
    // 以及该对象计算时的最小和最大迭代数
    this.pendingRender = Promise.all(promises).then(responses => {

      // 首先，找到所有切片总体上最大和最小的迭代数
      // 知道这些数值才可以为像素分配颜色
      let min = maxIterations, max = 0;
      for(let r of responses) {
        if (r.min < min) min = r.min;
        if (r.max > max) max = r.max;
      }

      // 现在需要一种方式把工作线程的原始迭代数转换为
      // 在画布中可见的像素颜色值。我们知道所有像素都
      // 在最小和最大迭代之间，因此可以预先计算好每个
      // 迭代数对应的颜色值，保存在 colorTable 数组中
      // 如果还没有分配颜色表，或者颜色表的大小已经不对了
      // 就再分配一个新的
      if (!this.colorTable || this.colorTable.length !== maxIterations+1){
        this.colorTable = new Uint32Array(maxIterations+1);
      }

      // 有了最大和最小值，就可以计算颜色表中对应的值了
      // 集合中的像素会渲染为完全不透明的黑色，集合外的
      // 像素则会渲染为不同的颜色，而且迭代次数越多，越
      // 接近白色。迭代次数最小的像素是透明的，因此会露
      // 出白色背景，从而形成了灰阶图像
      if (min === max) { // 如果所有像素都一样
        if (min === maxIterations) { // 则全部渲染为黑色
          this.colorTable[min] = 0xFF000000;
        } else { // 或者全部渲染为白色
          this.colorTable[min] = 0;
        }
      } else {
        // 在正常情况下，min 和 max 不相等，那么就
        // 使用对数比例将每个可能的迭代次数映射到
        // 0 到 255 间的不透明度，然后使用左移操作符
        // 将其转换为像素值
        let maxLog = Math.log(max-min);
        for(let i = min; i <= max; i++) {
          this.colorTable[i] = 
            (Math.ceil(Math.log(i+1-min)/maxLog * 255) << 24);
        }
      }

      // 现在把每个响应的 ImageData 中的迭代数
      // 转换为 colorTable 中的颜色值
      for(let r of responses) {
        let iterations = new Uint32Array(r.imageData.data.buffer);
        for(let i = 0; i < iterations.length; i++) {
          iterations[i] = this.colorTable[iterations[i]];
        }
      }

      // 最后，使用 putImageData() 方法把所有
      // ImageData 对象渲染为画布中对应的切片
      //（不过，首先要翻转坐标系来匹配 p5.js）
      // 事件处理程序设置的 transform: rotate(180deg)
      this.canvas.style.transform = "";
      for(let r of responses) {
        this.ctx.putImageData(r.imageData, r.tile.x, r.tile.y);
      }
    })
    .catch((reason) => {
      // 只要有任何期约出错，都会在这里把错误记录下来
      // 这是不应该发生的，但万一发生了可以帮我们排错
      console.error("Promise rejected in render():", reason);
    })
    .finally(() => {
      // 在完成渲染后，清除 pendingRender 标记
      this.pendingRender = null;
      // 如果在渲染时有重新渲染的请求，则重新渲染
      if (this.wantsRender) {
        this.wantsRender = false;
        this.render();
      }
    });

    }

    // 如果用户缩放了窗口，就会不断调用这个函数
    // 缩放画布并渲染曼德布洛特集是非常耗时的，
    // 做不到每件事发生重新渲染之后再处理
    // 但不希望每发生 298 毫秒之后，因此要使用计时器
    handleResize(event) {
        // 如果已经推迟了一次，则先清除计时器
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        // And defer this resize instead.
        this.resizeTimer = setTimeout(() => {
        this.resizeTimer = null; // 标记已经处理过了
        this.setState({});       // 触发画布及切片
        this.render();           // 重新在新尺寸上渲染
	}, 2000);
}

// 如果用户按了一个键，就会触发这个事件处理程序
// 对不同的键，我们会调用 setState()，而这个方法
// 会重新状态、更新UI，并在浏览历史中保存状态
handleKey(event) {
    switch(event.key) {
    case 'Escape': // 按 Esc 回到初始状态
        this.setState(PageState.initialState());
        break;
    case '+':      // 按 + 增大迭代数
        this.setState(s => {
            s.maxIterations = Math.round(s.maxIterations*1.5);
        });
        break;
    case '-':      // 按 - 减少迭代数
        this.setState(s => {
            s.maxIterations = Math.round(s.maxIterations/1.5);
            if (s.maxIterations < 1) s.maxIterations = 1;
        });
        break;
    case 'o':      // 按 o 放大
        this.setState(s => s.perPixel *= 2);
        break;
    case 'ArrowUp':   // 向上箭头，向上滚动
        this.setState(s => s.cy -= this.height/10 * s.perPixel);
        break;
    case 'ArrowDown': // 向下箭头，向下滚动
        this.setState(s => s.cy += this.height/10 * s.perPixel);
        break;
    case 'ArrowLeft': // 向左箭头，向左滚动
        this.setState(s => s.cx -= this.width/10 * s.perPixel);
        break;
    case 'ArrowRight': // 向右箭头，向右滚动
        this.setState(s => s.cx += this.width/10 * s.perPixel);
        break;
    }
}

// 在画布上发生 pointerdown 事件时会调用这个方法
// 这个 pointerdown 事件可能是缩放（单击或点按）
// 或平移（拖放）的开始。这个处理程序为 pointermove
// 和 pointerup 事件注册处理程序，以响应后续的手势
// （这两个额外的处理程序会在 pointerup 结束手势时
// 被删除）
handlePointer(event) {
    // 初始指针按下的像素坐标及时间
    // 因为画布是窗口的一部分，这些坐标
    // 也就是画布上的坐标
    const x0 = event.clientX, y0 = event.clientY, t0 = Date.now();

    // 这是移动事件的处理程序
    const pointerMoveHandler = event => {
        // 已经移动了多少，已经过了多少时间
        let dx=event.clientX-x0, dy=event.clientY-y0, dt=Date.now()-t0;

        // 如果指针移动的距离已经够或时间够长，用
        // 说明不是普通的单击，那就要使用CSS来平移
        // （我们会在 pointerup 事件发生时实际来平移
        if (dx > 10 || dy > 10 || dt > 500) {
            thts.canvas.style.transform = `translate(${dx}px, ${dy}px)`;
        }
    };

    // 这是 pointerup 事件的处理程序
    const pointerUpHandler = event => {
        // 在指针抬起时，手势结束，此时删除
        // 移动和抬起处理程序，等待下次手势
        thts.canvas.removeEventListener('pointermove', pointerMoveHandler);
        thts.canvas.removeEventListener('pointerup', pointerUpHandler);

        // 指针移动了多远，过了多长时间
        const dx = event.clientX-x0, dy = event.clientY-y0, dt = Date.now()-t0;
        // 把状态对象分解为个别的变量值
        const {cx, cy, perPixel} = thts.state;

        // 如果指针移动的距离已经够或时间够长，则
        // 是一个平移手势，需要修改状态以移动中心点
        // 否则，用户是在某个点上单击或点按，而我们
        // 要在该点上居中和放大
        if (dx > 10 || dy > 10 || dt > 500) {
            // 用户平移了(dx, dy)像素
            // 把这些值转换为复平面的偏移
            this.setState({cx: cx-dx*perPixel, cy: cy-dy*perPixel});
        } else { // 用户单击。计算中心点要移动多少像素
            // 单击点的位置
            let cdx = x0-this.width/2;
            let cdy = y0-this.height/2;

            // 使用 CSS 快速、临时地放大。
            thts.canvas.style.transform = 
                `translate(${cdx*2}px, ${cdy*2}px) scale(2)`;

            // 把复平面坐标设置为新的中心点
            // 同时把视图放大两倍
            this.setState({
                cx: cx + cdx * s.perPixel,
                cy: cy + cdy * s.perPixel,
                perPixel: perPixel / 2
            });
        }
    };

    // 在用户手势开始时，我们为后面紧接要发生的
    // pointermove 和 pointerup 事件注册处理程序
    this.canvas.addEventListener('pointermove', pointerMoveHandler);
    this.canvas.addEventListener('pointerup', pointerUpHandler);
  	this.canvas.addEventListener("pointerup", pointerUpHandler);
	}
}

    // 最后，这里是创建以及设置画布的代码。注意这个 JavaScript 文件
    // 可以自给自足。换句话说，HTML 文件只需要用 <script> 包含它即可
    let canvas = document.createElement("canvas"); // 动态创建元素
    document.body.appendChild(canvas);             // 把它插入到文档中
    canvas.style.margin = "0";                     // <body> 没有外边距
    canvas.style.width = "100vw";                  // 让画布与页面一样宽
    canvas.style.height = "100vh";                 // 同时也与页面一样高
	new MandelbrotCanvas(canvas);                  // 开始渲染画布
}
```

# 15.15 小结及未来阅读建议

本章到现在已经介绍了很多客户端 JavaScript 编程的基础知识。

- 怎么在网页中包含脚本及 JavaScript 模块，还有如何以及何时会执行它们。
- 客户端 JavaScript 的异步、事件驱动的编程模型。
- DOM 允许 JavaScript 代码检查和修改其所在文档的 HTML 内容。DOM API 是所有客户端 JavaScript 编程的核心所在。
- JavaScript 代码如何操作 CSS 样式，从而修改文档的外观。
- JavaScript 代码如何获取文档元素在浏览器窗口，以及在文档自身中的坐标。
- 如何使用自定义元素及影子 DOM API，通过 JavaScript、HTML 和 CSS 创建可重用的 UI “Web 组件”。
- 如何通过 SVG 和 HTML 的 `<canvas>` 元素显示及动态生成图形。
- 程序如何向网页中以编程方式添加音效（包括预录音效和合成音效）。
- JavaScript 代码如何让浏览器加载新页面，如何在用户浏览器历史中后退和前进，以及如何在浏览器历史中添加新条目。
- JavaScript 程序如何使用 HTTP 和 WebSocket 协议与 Web 服务器交换数据。
- JavaScript 程序如何在用户的浏览器中存储数据。
- JavaScript 程序如何使用工作线程实现安全的并发。

迄今为止，这是本书中最长的一章。但即便如此，这一章也没有包含浏览器支持的全部 API。Web 平台仍然在不断地拓展和演进，本章的目标是介绍最重要的核心 API。结合你通过本书掌握的知识，随时可以在需要的时候去学习新 API。但如果你不知道还有哪些 API，也就谈不上学习它们了。因此本章接下来的几小节将简单概述一下 Web 平台的特性，它们都是你将来有可能花时间去学习的。

## 15.15.1 HTML 与 CSS

Web 构建于 3 个关键技术之上：HTML、CSS 和 JavaScript。JavaScript 知识只是 Web 开发者应该掌握的一部分内容，除此之外还需要学习 HTML 和 CSS，知道如何使用 JavaScript 操作 HTML 元素和 CSS 样式的确很重要，但是如果你也熟悉要操作的 HTML 元素和 CSS 样式不是就更好了吗。

因此在探索更多 JavaScript API 之前，我建议大家花点时间掌握这些 Web 开发必备的技术和工具。比如，HTML 表单和输入元素有很丰富的功能需要深入理解，而 CSS 的 flexbox 和网格布局模式也是极其强大的。

另外两个有必要格外关注的领域是无障碍（包括 ARIA 属性）和国际化（包括从右往左书写方向的支持）。

## 15.15.2 性能

如果你写了一个 Web 应用并且已上线，那么想方设法让它变得更快的日子就开始了。然而，没有度量就无法优化。因此有必要熟悉一下 Performance API。Window 对象的 performance 属性是个 API 的主入口，其中包含高分辨率的时间戳 performance.now ()，以及在代码中打点的 performance.mark () 和度量断点之间运行时间的 performance.measure () 方法。调用这几个方法会创建 PerformanceEntry 对象，可以通过 performance.getEntries () 访问它们。浏览器会在加载新页面或通过网络抓取到文件时添加自己的 PerformanceEntry 对象。而这些自动创建的 PerformanceEntry 对象包含应用的网络性能相关的细粒度时间信息。相关的 PerformanceObserver 类则允许指定一个函数，在新 PerformanceEntry 对象创建时调用。

## 15.15.3 安全

本章介绍了如何防御 XSS（Cross-Site Scripting，跨站点脚本）安全漏洞的一般策略，但没有太深入讲解细节。Web 安全本身是一个重要的主题，大家也应该花点时间去研究。除了 XSS，还应该掌握 Content-Security-Policy HTTP 头部，以及理解 CSP 怎么让你要求浏览器限制它赋予 JavaScript 代码的能力，理解 CORS（Cross-Origin Resource Sharing，跨源资源共享）也很重要。

## 15.15.4 WebAssembly

WebAssembly（简称 WASM）是一种低级虚拟机字节码格式，专门用于在浏览器中与 JavaScript 解释器配合使用。有些编译器可以将 C、C++ 和 Rust 程序编译为 WebAssembly 字节码，并在不破坏浏览器沙箱或安全模型的前提下，在浏览器中以接近原生的速度运行。近原生的速度运行这些程序。WebAssembly 可以导出供 JavaScript 程序调用的函数。WebAssembly 的典型应用场景是编译标准 C 语言 zlib 压缩库，以便 JavaScript 代码可以使用高速压缩和解压缩算法。更多内容可以参考：[https://webassembly.org](https://webassembly.org/)。

## 15.15.5 更多 Document 和 Window 特性

Document 和 Window 对象还有一些本章并未介绍的特性。

- Window 对象定义了 `alert()`、`confirm()` 和 `prompt()` 方法，用于向用户显示简单的模态对话框。这些方法都会阻塞线程。`confirm()` 方法同步返回一个布尔值，`prompt()` 同步返回一个用户输入的字符串。这些方法不适合在线上产品中使用，但在简单的项目和原型中可以使用。
- Window 对象的 `navigator` 和 `screen` 属性在本章前面提到过，但它们引用的 `Navigator` 和 `Screen` 对象还有一些本章未介绍但可能对你有用的特性。
- 任何 Element 对象的 `requestFullscreen()` 方法会要求浏览器以全屏模式显示该元素（比如 `<video>` 或 `<canvas>` 元素）。Document 的 `exitFullscreen()` 方法返回正常显示模式。
- Window 对象的 `requestAnimationFrame()` 方法以一个函数作为参数，并会在浏览器准备渲染下一帧时执行该函数。在涉及视觉变化（特别是重复的视觉变化动画相关的视觉变化）的功能时，在代码中调用 `requestAnimationFrame()` 可以保证变化被浏览器按照最优的方式平滑渲染。
- 如果用户选择了文档中的文本，可以通过 Window 对象的 `getSelection()` 方法获得选区的详细信息，并通过 `getSelection().toString()` 取得选中的文本。在有的浏览器中，`navigator.clipboard` 是一个具有异步 API 的对象，可以读取和设置系统剪贴板的内容，以支持浏览器外部应用的复制及粘贴操作。
- 浏览器有一个鲜为人知的特性，就是 HTML 元素的 `contenteditable="true"` 属性可以让元素内容变得可以编辑。而 `document.execCommand()` 方法则支持对可编辑内容应用富文本编辑特性。
- `MutationObserver` 对象允许 JavaScript 监控文档中指定元素（或下方元素）的变化。通过 `MutationObserver` 构造函数可以创建 `MutationObserver` 对象，传入的回调函数会在变化发生时被调用。然后再调用 `MutationObserver` 的 `observe()` 方法指定要监控哪个元素的哪个部分。
- `IntersectionObserver` 对象允许 JavaScript 确定哪个文档元素当前在屏幕上，哪个元素接近屏幕。对于随着用户滚动按需动态加载内容的应用，`IntersectionObserver` 非常有用。

## 15.15.6 事件

Web 平台支持的事件数量之庞大、类型之多样是令人望而生畏的。本章已经介绍了很多事件类型，但下面这些也很有用。

- 浏览器会在获得和失去互联网连接时在 Window 对象上分别触发 “online” 和 “offline” 事件。
- 浏览器会在文档（通常是因为用户切换标签页而）变得可见或不可见时在 Document 对象上触发 “visibilitychange” 事件。JavaScript 可以检查 `document.visibilityState` 确定其文档当前是 “visible”（可见）还是 “hidden”（隐藏）。
- 浏览器支持一套复杂的 API，以支持拖放 UI 和与浏览器外部应用程序的数据交换。这个 API 涉及很多事件，包括 “dragstart”“dragover”“dragend” 和 “drop”。虽然正确使用这个 API 比较麻烦，但必要时还是很有用的。如果你希望支持用户从桌面向 Web 应用中拖放文件，那这个 API 就非常重要了。
- Pointer Lock API 可以让 JavaScript 隐藏鼠标指针，获得与鼠标指针在屏幕上的相对移动量而非绝对位置相关的原始鼠标事件。这适用于编写游戏很有用。首先在需要接收鼠标事件的元素上调用 `requestPointerLock()`，然后该元素就可以收到 “mousemove” 事件，事件对象上就会有 `movementX` 和 `movementY` 属性。
- Gamepad API 增加了对游戏手柄（控制器）的支持。使用 `navigator.getGamepads()` 取得已连接的 Gamepad 对象，并监听 Window 对象上的 “gamepadconnected” 事件，可以在新手柄插入时收到通知。Gamepad 对象定义了一个 API，可以查询手柄按键的当前状态。

## 15.15.7 PWA 与 Service Worker

PWA（Progressive Web App）指的是使用几种关键技术构建的一种 Web 应用形式。如果要详细讲解相关技术，差不多需要一本书的篇幅，因此本章并没有介绍它们。但是，读者应该了解与之相关的所有 API。不过有必要指出，像这样强大的现代 API 通常都只能在安全的 HTTPS 连接下工作。仍然使用 `http://` URL 的网站则无法使用这些新技术。

- ServiceWorker（服务线程）是一种工作线程，但具有在它 “服务” 的 Web 应用中拦截、检查和响应网络请求的能力。当 Web 应用注册了一个服务线程时，该线程的代码就会在浏览器本地持久存储，而当用户再次访问关联的网站时，该服务线程会被重新激活。服务线程可以缓存网络响应（包括文件和 JavaScript 代码），这意味着使用服务线程的 Web 应用实际上可以把自己安装在用户的家浏览器以*Service Worker*启动和离线使用。要深入学习服务线程及相关技术，推荐大家阅读 *Service Worker Cookbook*（请访问 https://serviceworke.rs/）。

- Cache API 就是设计由服务线程来使用的（不过在工作线程外部的普通 JavaScript 代码中也可以使用）。这个 API 要使用 fetch () API 定义的 Request 和 Response 对象，实现对 Request/Response 对的缓存。Cache API 可以让服务线程缓存脚本以及它所服务的 Web 应用的其他资源，也可以辅助实现 Web 应用的离线使用（对于移动设备而言尤其重要）。
- Web Manifest 是 JSON 格式的文件，描述 Web 应用，包含名字、URL 和指向各种尺寸图标的链接。如果你的 Web 应用注册了服务线程，而且包含引用一个 .webmanifest 文件的 `<link rel="manifest">` 标签，则浏览器（特别是移动设备上的浏览器）可能会把该 Web 应用的图标添加到桌面或主屏幕上。
- Notifications API 可以让 Web 应用在移动和桌面设备上使用原生 OS 的通知机制显示通知。通知可以包含图片和文本。如果用户单击了通知，你的代码可以收到事件。由于使用这个 API 涉及向用户请求显示通知的权限，所以还是有点复杂的。
- Push API 可以让涉及了服务线程（且已获得用户许可）的 Web 应用订阅服务器的通知，并能够在应用本身没有运行的情况下显示这些通知。推送通知在移动设备上很常见，而 Push API 让 Web 应用在移动设备上向原生应用又迈进了一步。

## 15.15.8 移动设备 API

有不少 Web API 主要用于在移动设备上运行的 Web 应用（可惜的是，这些 API 中有很多只能在 Android 设备上使用，不能在 iOS 设备上使用）。

- Geolocation API 可以让 JavaScript（在用户许可的情况下）确定用户的地理位置。桌面和移动设备都支持这个 API，包括 iOS 设备。调用 `navigator.geolocation.getCurrentPosition()` 请求用户当前位置，调用 `navigator.geolocation.watchPosition()` 注册一个回调，当用户位置变化时可以调用它。
- `navigator.vibrate()` 方法可以让移动设备（不包含 iOS 设备）震动。通常只能在响应用户某个手势时使用。调用这个方法可以让你的应用在识别出某个手势时给出无声的反馈。
- ScreenOrientation API 让 Web 应用可以查询移动设备屏幕的当前朝向，也可以把自己锁定为横屏或竖屏模式。
- Window 对象上的 “`devicemotion`” 和 “`deviceorientation`” 事件会报告设备的加速度感应器和磁力感应器数据，从而让你确定设备加速的方式，以及用户在空间中的朝向（iOS 也支持这些事件）。
- 除 Android 设备上的 Chrome 之外，Sensor API 还没有得到广泛支持。它可以让 JavaScript 访问移动设备上的所有传感器，包括加速感应器、陀螺仪、磁力感应器和环境光传感器。这些传感器可以让 JavaScript 确定用户面对哪个方向，或者确定用户什么时候晃动了自己的手机。

## 15.15.9 二进制 API

定型数组、ArrayBuffer 和 DataView 类（11.2 节都介绍过）可以让 JavaScript 操作二进制数据。正像本章前面提到的，fetch () API 让 JavaScript 程序可以通过网络接收二进制数据。另一个二进制数据的来源是用户的本地文件系统。出于安全考虑，JavaScript 不能读取用户本地文件。但如果用户选择了某个文件并上传（使用 `<input type="file">` 表单元素），或者用户把一个文件拖放到了你的 Web 应用中，那么 JavaScript 可以通过 File 对象来访问这个文件。

File 是 Blob 的子类，因此它也是一个数据块的不透明表示。可以使用 FileReader 类以 ArrayBuffer 或字符串形式异步获取文件的内容（在某些浏览器中，可以不用 FileReader，而直接使用 Blob 类定义的基于步骤的 text () 和 arrayBuffer () 方法获取文件的内容，或者使用 stream () 方法通过流 API 访问文件内容）。

在操作二进制数据，特别是使用网络 API 访问二进制数据时，可能需要把字节解码为文本，或者把文本编码为字节。此时可以使用 TextEncoder 和 TextDecoder 类。

## 15.15.10 媒体 API

JavaScript 代码可以通过 `navigator.mediaDevices.getUserMedia()` 方法请求访问用户的麦克风或摄像头。请求成功会返回一个 MediaStream 对象，视频流可以显示在一个 `<video>` 标签中（通过把 `srcObject` 属性设置为视频流），可以使用画布的 `captureStream()` 函数把视频的静态帧捕获到屏外的 `<canvas>` 元素上，得到一张低分辨率的图片。`getUserMedia()` 返回的音频流和视频流可以通过 MediaRecorder 录制并编码为 Blob 对象。更复杂的 WebRTC API 支持通过网络发送和接收 MediaStream，可以实现点对点的视频会议。

## 15.15.11 加密及相关 API

Window 对象的 crypto 属性暴露了一个 `getRandomValues()` 方法，用于产生密码学意义上安全的随机数。与加密、解密、密钥生成、数字签名等相关的其他方法则暴露在 `crypto.subtle` 上。这个属性的名字（subtle，难以捉摸）意在警告使用这些方法的所有人：正确使用加密算法是很难的，除非你真的知道自己在干什么，否则不要使用这些方法。同样，`crypto.subtle` 的方法只能由通过安全的 HTTPS 连接加载的文档中的 JavaScript 代码使用。Credential Management API 和 Web Authentication API 可以让 JavaScript 生成、存储和取得公钥（及其他类型的）凭据，从而实现免密创建账号和登录。这个 JavaScript API 主要涉及函数 navigator.credentials.create () 和 navigator.credentials.get ()，但为了让这两个方法起作用，服务端必须有对应的基础设施。这些 API 尚未得到普遍支持，但有希望颠覆现在登录网站的方式。

Payment Request API 为浏览器增加了在网页上通过信用卡支付的能力。用户通过它可以把自己的支付信息存储在浏览器上，这样就不必每次购物时都输入一遍自己的信用卡号了。需要请求用户支付的 Web 应用要创建一个 PaymentRequest 对象，并调用它的 show () 方法向用户显示支付请求。













