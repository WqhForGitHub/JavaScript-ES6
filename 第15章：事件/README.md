JavaScript 与 HTML 的交互是通过事件实现的，事件代表文档或浏览器窗口中某个有意义的时刻。可以使用仅在事件发生时执行的监听器（也叫处理程序）订阅事件。在传统软件工程领域，这个模型叫观察者模式，该模式能够做到页面行为（在 JavaScript 中定义）与页面展示（在 HTML 和 CSS 中定义）的分离。

事件最早在 IE3 和 Netscape Navigator2 中出现的，当时的用意是把某些表单处理工作从服务器转移到浏览器上来。到了 IE4 和 Netscape Navigator 3 发布的时候，这两家浏览器都提供了类似但又不同的 API，而且持续了好几代。DOM2 开始尝试以符合逻辑的方式来标准化 DOM 事件 API。目前所有现代浏览器都实现了 DOM2 Events 的核心部分。IE8 是最后一个使用专有事件系统的主流浏览器。

浏览器的事件系统非常复杂。即使所有主流浏览器都实现了 DOM2 Events，规范也没有涵盖所有的事件类型。BOM 也支持事件，这些事件与 DOM 事件之间的关系由于长期以来缺乏文档，经常容易被混淆（HTML5 已经致力于明确这些关系）。而 DOM3 新增的事件 API 又让这些问题进一步复杂化了。根据具体的需求不同，使用事件可能会相对简单，也可能会非常复杂。但无论如何，理解其中的核心概念还是最重要的。

# 1. 事件流

在第四代 Web 浏览器（IE4 和 Netscape Communicator 4）开始开发时，开发团队碰到了一个有意思的问题：页面哪个部分拥有特定的事件呢？要理解这个问题，可以在一张纸上画几个同心圆。把手指放到圆心上，则手指不仅是在一个圆圈里，而且是在所有的圆圈里。两家浏览器的开发团队都是以同样的方式看待浏览器事件的，当你点击一个按钮时，实际上不光点击了这个按钮，还点击了它的容器以及整个页面。

事件流描述了页面接收事件的顺序。结果非常有意思，IE 和 Netscape 开发团队提出了几乎完全相反的事件流方案。IE 将支持事件冒泡流，而 Netscape Communicator 将支持事件捕获流。

## 1. 事件冒泡

被广泛采用的事件流模型被称为事件冒泡，这是因为事件被定义为从具体的元素（文档树中最深的节点）开始触发，然后向上传播至没有那么具体的元素（文档）。比如有如下 HTML 页面：

```html
<!DOCTYPE html>
<html>
<head>
	<title>Event Bubbling Example</title>
</head>
<body>
    <div id="myDiv">Click Me</div>
</body>
</html>
```

在点击页面中的 `<div>` 元素后，click 事件会以如下顺序发生：

1. `<div>`
2. `<body>`
3. `<html>`
4. document
5. window

也就是说，`<div>` 元素，即被点击的元素，最先触发 click 事件。然后，click 事件沿 DOM 树一路向上，在经过的每个节点上依次触发，直至到达 window 对象。下图形象地展示了这个过程。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC15%E7%AB%A0%EF%BC%9A%E4%BA%8B%E4%BB%B6/%E4%BA%8B%E4%BB%B6%E5%86%92%E6%B3%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

## 2. DOM 事件流

DOM2 Events 规范规定事件流分为 3 个阶段：事件捕获、到达目标和事件冒泡。事件捕获最先发生，为提前拦截事件提供了可能。然后，实际地目标元素接收到事件。最后一个阶段是冒泡，最迟要在这个阶段响应事件。仍以前面那个简单的 HTML 为例，点击 `<div>` 元素会以如下图所示的顺序触发事件。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC15%E7%AB%A0%EF%BC%9A%E4%BA%8B%E4%BB%B6/%E4%BA%8B%E4%BB%B6%E6%8D%95%E8%8E%B7%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

在 DOM 事件流中，实际的目标（`<div>` 元素）在捕获阶段不会接收到事件。这是因为捕获阶段从 document 到 `<html>` 再到 `<body>` 就结束了。下一阶段，即会在 `<div>` 元素上触发事件的到达目标阶段，通常在事件处理时被认为是冒泡阶段的一部分（稍后讨论）。然后，冒泡阶段开始，事件反向传播至文档。

大多数支持 DOM 事件流的浏览器实现了一个小小的拓展。虽然 DOM2 Events 规范明确捕获阶段不命中事件目标，但现代浏览器都会在捕获阶段在事件目标上触发事件。最终结果是在事件目标上有两个机会来处理事件。

# 2. 事件处理程序

事件意味着用户或浏览器执行的某种动作。比如，单击（click）、加载（load）、鼠标悬停（mouseover）。为响应事件而调用的函数被称为事件处理程序（或事件监听器）。事件处理程序的名字以 "on" 开头，因此 click 事件的处理程序叫做 onclick，而 load 事件的处理程序叫做 onload。有很多方式可以指定事件处理程序。

## 1. HTML 事件处理程序

特定元素支持的每个事件都可以使用事件处理程序的名字以 HTML 属性的形式来指定。此时属性的至必须是能够执行 JavaScript 代码。例如，要在按钮被点击时执行某些 JavaScript 代码，可以使用以下 HTML 属性：

```html
<input type="button" value="Click Me" onclick="console.log('Clicked')" />
```

点击这个按钮后，控制台会输出一条消息。这种交互能力是通过为 onclick 属性指定 JavaScript 代码值来实现的。注意，因为属性的值是 JavaScript 代码，所以不能在未经转义的情况下使用 HTML 语法字符，比如和好（&）、双引号（"）、小于号（<）和大于号（>）。此时，为了避免使用 HTML 实体，可以使用单引号代替双引号，则要把代码改成下面这样：

```html
<input type="button" value="Click Me" onclick="console.log("Clicked")" />
```

在 HTML 中定义的事件处理程序可以包含精确的动作指令，也可以调用在页面其他地方定义的脚本，比如：

```html
<script>
    function showMessage() {
        console.log("Hello world!");
    }
</script>
<input type="button" value="Click Me" onclick="showMessage()" />
```

在这个例子中，单击按钮会调用 showMessage() 函数。showMessage() 函数是在单独的 `<script>` 元素中定义的，而且也可以在外部文件中定义。作为事件处理程序执行的代码可以访问全局作用域中的一切。

以这种方式指定的事件处理程序有一些特殊的地方。首先，会创建一个函数来封装属性的值。这个函数有一个特殊的布局变量 event，其中保存的就是 event 对象（本章后面会讨论）：

```html
<!-- 输出 "click" -->
<input type="button" value="Click Me" onclick="console.log(event.type)">
```

有了这个对象，就不用开发者另外定义其他变量，也不用从包装函数的参数列表中去取了。

在这个函数中，this 值相当于事件的目标函数，如下面的例子所示：

```html
<!-- 输出 "Click Me" -->
<input type="button" value="Click Me" onclick="console.log(this.value)">
```

这个动态创建的包装函数还有一个特别有意思的地方，就是其作用域被扩展了。在这个函数中，document 和元素自身的成员都可以当成局部变量来访问。这是通过使用 with 实现的：

```javascript
function() {
    with(document) {
        with(this) {
            // 属性值
        }
    }
}
```

这意味着事件处理程序可以更方便地访问自己的属性。下面的代码与前面的示例功能一样：

```html
<!-- 输出 "Click Me" -->
<input type="button" value="Click Me" onclick="console.log(value)">
```

如果这个元素是一个表单输入框，则作用域链中还会包含表单元素，事件处理程序对应的函数等价于如下这样：

```javascript
function() {
    with(document) {
        with(this.form) {
            with(this) {
                // 属性值
            }
        }
    }
}
```

本质上，经过这样的扩展，事件处理程序的代码就可以不必引用表单元素，而直接访问同一表单中的其他成员了。下面的例子就展示了这种成员访问模式：

```html
<form method="post">
    <input type="text" name="username" value="">
    <input type="button" value="Echo Username" onclick="console.log(username.value)">
</form>
```

点击这个例子中的按钮会显示出文本框中包含的文本。注意，事件处理程序中的代码直接引用了 username。

在 HTML 中指定事件处理程序有一些问题。第一个问题是时机问题。有可能是 HTML 元素已经显示在页面上，用户都与其交互了，而事件处理程序的代码还无法执行。比如在前面的例子中，如果 showMessage() 函数在页面后面，在按钮中代码的后面定义的，那么当用户在 showMessage() 函数被定义之前点击按钮时，就会发生错误。为此，大多数 HTML 事件处理程序会封装在 try/catch 块中，以便在这种情况下静默失败，如下面的例子所示：

```html
<input type="button" value="Click Me" onclick="try{showMessage();}catch(ex) {}">
```

这样，如果在 showMessage() 函数被定义之前点击了按钮，就不会发生 JavaScript 错误了，这时因为错误在浏览器收到之前已经被拦截了。

另一个问题是对事件处理程序作用域链的扩展在不同浏览器中可能导致不同的结果。不同 JavaScript 引擎中标识符解析的规则存在差异，因此访问无限定的对象成员可能导致错误。

使用 HTML 指定事件处理程序的最后一个问题是 HTML 与 JavaScript 强耦合。如果需要修改事件处理程序，必须在两个地方，即 HTML 和 JavaScript 中修改代码。这也是很多开发者不使用 HTML 事件处理程序，而使用 JavaScript 指定事件处理程序的主要原因。

## 2. DOM0 事件处理程序

在 JavaScript 中指定事件处理程序的传统方式是把一个函数赋值给（DOM 元素的）一个事件处理程序属性。这也是在第四代 Web 浏览器中开始支持的事件处理程序赋值方法，直到现在所有现代浏览器仍然都支持此方法，主要原因是简单。要使用 JavaScript 指定事件处理程序，必须先取得要操作对象的引用。

每个元素（包括 window 和 document）都有通常小写的事件处理程序属性，比如 onclick。只要把这个属性赋值为一个函数即可：

```javascript
let btn = document.getElementById("myBtn");
btn.onclick = function() {
    console.log("Clicked");
};
```

这里先从文档中取得按钮，然后给它的 onclick 事件处理程序赋值一个函数。注意，前面的代码在运行之后才会给事件处理程序赋值。因此如果在页面上面的代码出现在按钮之后，则有可能出现用户点击按钮没有反应得情况。

像这样 DOM0 方式为事件处理程序赋值时，所赋函数被视为元素的方法。因此，事件处理程序会在元素的作用域中运行，即 this 等于元素。下面的例子演示了使用 this 引用元素本身：

```javascript
let btn = document.getElementById("myBtn");
btn.onclick = function() {
    console.log(this.id); // "myBtn"
};
```

点击按钮，这段代码会显示元素的 ID。这个 ID 是通过 this.id 获取的。不仅仅是 id，在事件处理程序里通过 this 可以访问元素的任何属性和方法，以这种方式添加处理程序是注册在事件流的冒泡阶段的。

通过将事件处理程序属性的值设置为 null，可以移除通过 DOM0 方式添加的事件处理程序，如下面的例子所示：

```javascript
btn.onclick = null; // 移除事件处理程序
```

把事件处理程序设置为 null，再点击按钮就不会执行任何操作了。

>注意
>
>如果事件处理程序是在 HTML 中指定的，则 onclick 属性的值是一个包装相应 HTML 事件处理程序属性值的函数。这些事件处理程序也可以通过 JavaScript 中将相应属性设置为 null 来移除。

## 3. DOM2 事件处理程序

### addEventListener()

### removeEventListener()

DOM2 Events 为事件处理程序的赋值和移除定义了两个方法：addEventListener() 和 removeEventListener()。这两个方法暴露在所有 DOM 节点上，它们接收 3 个参数：事件名、事件处理函数和一个布尔值，true 表示捕获阶段调用处理处理程序，false（默认值）表示在冒泡阶段调用事件处理程序。

仍以给按钮添加 click 事件处理程序为例，可以这样写：

```javascript
let btn = document.getElementById("myBtn");
btn.addEventListener("click", () => {
    console.log(this.id);
}, false);
```

以上代码为按钮添加了会在事件冒泡阶段触发的 onclick 事件处理程序（因为最后一个参数值为 false）。与 DOM0 方式类似，这个事件处理程序同样在被附加到的元素的作用域中运行。使用 DOM2 方式的主要优势是可以为同一个事件添加多个事件处理程序。来看下面的例子：

```javascript
let btn = document.getElementById("myBtn");
btn.addEventListener("click", () => {
    console.log(this.id);
}, false);
btn.addEventListener("click", () => {
    console.log("Hello world!");
}, false);
```

这里给按钮添加了两个处理程序。多个事件处理程序以添加顺序来触发，因此前面的代码会先打印元素 ID，然后显示消息 "Hello, world!"。

通过 addEventListener() 添加的事件处理程序只能使用 removeEventListener() 并传入与添加时同样的参数来移除。这意味着使用 addEventListener() 添加的匿名函数无法移除，如下面的例子所示：

```javascript
let btn = document.getElementById("myBtn");
btn.addEventListener("click", () => {
    console.log(this.id);
}, false);

// 其他代码

btn.removeEventListener("click", function() { // 没有效果!
    console.log(this.id);
}, false);
```

这个例子通过 addEventListener() 添加了一个匿名函数作为事件处理程序。然后，又以看起来相同的参数调用了 removeEventListener()。但实际上，传递给 removeEventListener() 的第二个参数与传给 addEventListener() 的完全不是一回事，传给 removeEventListener() 的事件处理函数必须与传给 addEventListener() 的是同一个，如下面的例子所示：

```javascript
let btn = document.getElementById("myBtn");
let handler = function() {
    console.log(this.id);
};
btn.addEventListener("click", handler, false); // 有效果!
```

这个例子有效，因为调用 addEventListener() 和 removeEventListener() 时传入的是同一个函数。

大多数情况下，事件处理程序会被添加到事件流的冒泡阶段，主要原因是跨浏览器兼容性好。把事件处理程序注册到捕获阶段通常用于在事件到达其指定目标之前拦截事件。如果不需要拦截，则不要使用事件捕获。

# 3. 事件对象

## event.type

## event.target

## event.currentTarget

## event.preventDefault()

## event.eventPhase

在 DOM 中发生事件时，所有相关信息都会被收集并存储在一个名为 events 的对象中。这个对象包含了一些基本信息，比如导致事件的元素、发生的事件类型，以及可能与特定事件相关的任何其他数据。例如，鼠标操纵导致的事件生成鼠标位置信息，而键盘操作导致的事件会生成与被按下的键有关的信息。所有浏览器都支持这个 events 对象，尽管支持方式不同。

## 1. DOM 事件对象

在 DOM 合规的浏览器中，event 对象是传给事件处理程序的唯一参数。不管以哪种方式（DOM0 或 DOM2）指定事件处理程序，都会传入这个 events 对象。下面的例子展示了在两种方式下都可以使用事件对象：

```javascript
let btn = document.getElementById("myBtn");
btn.onclick = function(event) {
    console.log(event.type); // "click"
};

btn.addEventListener("click", (event) => {
    console.log(event.type); // "click"
}, false);
```

这个例子中的两个事件处理程序都会在控制台打出 event.type 属性包含的事件类型。这个属性中始终包含被触发事件的类型，如 "click"（与传给 addEventListener() 和 removeEventListener() 方法的事件名一致）。

在通过 HTML 属性指定的事件处理程序中，同样可以使用变量 event 引用事件对象。下面的例子中演示了如何使用这个变量：

```html
<input type="button" value="Click Me" onclick="console.log(event.type)">
```

以这种方式提供 event 对象，可以让 HTML 属性中的代码实现与 JavaScript 函数同样的功能。

如前所述，事件对象包含与特定事件相关的属性和方法。不同的事件生成的事件对象也会包含不同的属性和方法。不过，所有事件对象都会包含下表列出的这些属性和方法。不过，所有事件对象都会包含下表列出的这些属性和方法。

| 属性/方法                  | 类型         | 读/写 | 说明                                                         |
| -------------------------- | ------------ | ----- | ------------------------------------------------------------ |
| bubbles                    | 布尔值       | 只读  | 表示事件是否冒泡                                             |
| cancelable                 | 布尔值       | 只读  | 表示是否可以取消事件的默认行为                               |
| currentTarget              | 元素         | 只读  | 当前事件处理程序所在的元素                                   |
| defaultPrevented           | 布尔值       | 只读  | true 表示已经调用 preventDefault() 方法（DOM3 Events 中新增） |
| detail                     | 整数         | 只读  | 与事件相关的其他信息                                         |
| eventPhase                 | 整数         | 只读  | 表示调用事件处理程序的阶段：1 代表捕获阶段，2 代表到达目标，3 代表冒泡阶段 |
| preventDefault()           | 函数         | 只读  | 用于取消事件的默认行为。只有 cancelable 为 true 才可以调用这个方法 |
| stopImmediatePropagation() | 函数         | 只读  | 用于取消所有后续事件捕获或事件冒泡，并阻止调用任何后续事件处理程序（DOM3 Events 中新增） |
| stopPropagation()          | 函数         | 只读  | 用于取消所有后续事件捕获或事件冒泡。只有 bubbles 为 true 才可以调用这个方法 |
| target                     | 元素         | 只读  | 事件目标                                                     |
| trusted                    | 布尔值       | 只读  | true 表示事件是由浏览器生成的。false 表示事件是开发者通过 JavaScript 创建的（DOM3 Events 中新增） |
| type                       | 字符串       | 只读  | 被触发的事件类型                                             |
| View                       | AbstractView | 只读  | 与事件相关的抽象视图。等于事件所发生的 windows 对象          |

在事件处理程序内部，this 对象始终等于 currentTarget 的值，而 target 只包含事件的实际目标。如果事件处理程序直接添加在了意图的目标上，则 this、currentTarget 和 target 的值是一样的。下面的例子展示了这两个属性都等于 this 的情形：

```javascript
let btn = document.getElementById("myBtn");
ben.onclick = function(event) {
    console.log(event.currentTarget === this); // true
    console.log(event.target === this); // true
};
```

上面的代码检测了 currentTarget 和 target 的值是否等于 this。因为 click 事件的目标是按钮，所以这 3 个值是相等的。如果这个事件处理程序是添加到按钮的父节点（如 document.body）上，那么它们的值就不一样了。比如下面额例子在 document.body 上添加了单击处理程序：

```javascript
document.body.onclick = function(event) {
    console.log(event.currentTarget === document.body); // true
    console.log(this === document.body); // true
    console.log(event.target === document.getElementById("myBtn")); // true
}
```

这种情况下点击按钮，this 和 currentTarget 都等于 document.body，这是因为它是注册事件处理程序的元素。而 target 属性等于按钮本身，这是因为那才是 click 事件真正的目标。由于按钮本身并没有注册事件处理程序，因此 click 事件冒泡到 document.body，从而触发了在它上面注册的处理程序。

type 属性在一个处理程序多个事件时很有用。比如下面的处理程序中就使用了 event.type：

```javascript
let btn = document.getElementById("myBtn");
let handler = function(event) {
    switch(event.type) {
        case "click":
            console.log("Clicked");
            break;
        case "mouseover":
            event.target.style.backgroundColor = "red";
            break;
        case "mouseout":
            event.target.style.backgroundColor = "";
            break;
    }
};

btn.onclick = handler;
btn.onmouseover = handler;
btn.onmouseout = handler;
```

在这个例子中，函数 handler 被用于处理 3 种不同的事件：click、mouseover 和 mouseout。当按钮被点击时，应该在控制台打印一条消息，如前面的例子所示。而把鼠标放到按钮上，会导致按钮背景变成红色，接着把鼠标从按钮上移开，背景颜色应该又恢复成默认值。这个函数使用 event.type 属性确定了事件类型，从而可以做出不同的响应。

preventDefault() 方法用于阻止特定事件的默认动作。比如，链接的默认行为就是被单击时导航到 href 属性指定的 URL。如果想阻止这个导航行为，可以在 onclick 事件处理程序中取消，如下面的例子所示：

```javascript
let link = document.getElementById("myLink");
link.onclick = function(event) {
    event.preventDefault();
};
```

任何可以通过 preventDefault() 取消默认行为的事件，其事件对象的 cancelable 属性都会设置为 true。

stopPropagation() 方法用于立即阻止事件流在 DOM 结构中传播，取消后续的事件捕获或冒泡。例如，直接添加到按钮的事件处理程序中调用 stopPropagation()，可以阻止 document.body 上注册的事件处理程序执行。比如：

```javascript
let btn = document.getElementById("myBtn");
btn.onclick = function(event) {
    console.log("Clicked");
    event.stopPropagation();
};

document.body.onclick = function() {
    console.log("Body clicked");
};
```

如果这个例子中不调用 stopPropagation()，那么点击按钮就会打印两条消息。但这里由于 click 事件不会传播到 document.body，因此 onclick 事件处理程序永远不会执行。

eventPhase 属性可用于确定事件流当前所处的阶段。如果事件处理程序在捕获阶段被调用，则 eventPhase 等于 1。如果事件处理程序在目标上被调用，则 eventPhase 等于 2。如果事件处理程序在冒泡阶段被调用，则 eventPhase 等于 3。不过要注意的是，虽然到达目标是在冒泡阶段发生的，但其 eventPhase 仍然等于 2。下面的例子展示了 eventPhase 在不同阶段的值：

```javascript
let btn = document.getElementById("myBtn");
btn.onclick = function(event) {
    console.log(event.eventPhase); // 2
};

document.body.addEventListener("click", (event) => {
    console.log(event.eventPhase); // 1
}, true);

document.body.onclick = (event) => {
    console.log(event.eventPhase); // 3
};
```

在这个例子中，点击按钮首先会被触发注册在捕获阶段的 document.body 上的事件处理程序，显示 eventPhase 为 1。接着，会触发按钮本身的事件处理程序（尽管是注册在冒泡阶段），此时显示 eventPhase 等于 2。最后触发的是注册在冒泡阶段的 document.body 上的事件处理程序，显示 eventPhase 为 3。而当 eventPhase 等于 2 时，this、target 和 currentTarget 三者相等。

>注意
>
>event 对象只在事件处理程序执行期间存在，一旦执行完毕，就会被销毁。





















































































