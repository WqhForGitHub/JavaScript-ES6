# 1. window 对象

BOM 的核心是 window 对象，表示浏览器的实例。window 对象在浏览器中有两重身份，一个是 ECMAScript 中的 Global 对象，另一个就是浏览器窗口的 JavaScript 接口。这意味着网页中定义的所有对象、变量和函数都以 window 作为其 Global 对象，都可以访问其上定义的 parseInt() 等全局方法。

>注意
>
>因为 window 对象的属性在全局作用域中有效，所以很多浏览器 API 及相关构造函数都以 window 对象属性的形式暴露出来。这些 API 将在全书各章中介绍，特别是第 18 章。

## 1. Global 作用域

因为 window 对象被复用为 ECMAScript 的 Global 对象，所以通过 var 声明的所有全局变量和函数都会变成 window 对象的属性和方法。比如：

```javascript
var age = 29;
var sayAge = () => alert(this.age);

alert(window.age); // 29
sayAge(); // 29
window.sayAge(); // 29
```

这里，变量 age 和函数 sayAge() 被定义在全局作用域中，它们自动成为 window 对象的成员。因此，变量 age 可以通过 window.age 来访问，而函数 sayAge() 也可以通过 window.sayAge() 来访问。因为 sayAge() 存在于全局作用域，this.age 映射到 window.age，所以可以显示正确的结果。

如果在这里使用 let 或 const 替代 var，则不会把变量添加给全局对象：

```javascript
let age = 29;
const sayAge = () => alert(this.age);

alert(window.age); // undefined
sayAge(); // undefined
window.sayAge(); // TypeError: window.sayAge is not a function
```

另外，访问未声明的变量会抛出错误，但是可以在 window 对象上查询是否存在可能未声明的变量。比如：

```javascript
// 这会导致抛出错误，因为 oldValue 没有声明
var newValue = oldValue;
// 这不会抛出错误，因为这里是属性查询
// newValue 会被设置为 undefined
var newValue = window.oldValue;
```

记住，JavaScript 中有很多对象暴露在全局作用域中，比如 location 和 navigator（本章后面都会讨论），因而它们也是 window 对象的属性。

## 2. globalThis 属性

取决于在什么环境下运行 JavaScript，全局对象也有几种不同的形式。

* 在网页脚本中，全局对象是 window、self 或 frames。
* Web Worker 中，全局对象是 self。
* 在 Node.js 中，全局对象是 global。

* 在脚本的顶级，this 通常引用全局对象，但在严格模式下或在有箭头函数的情况下，问题会复杂一些。

为消除这些差异，ECMAScript 定义了一个 globalThis 属性，以期达成两个目标。

1. 将跨环境访问全局 this 的方式统一为 globalThis，即在网页中 globalThis === window，在 Web Worker 中 globalThis === self。
2. 允许脚本修改和控制 globalThis 的特性和行为，因为 globalThis 是对全局对象的间接引用，其本身是可写、可配置的。

在非浏览器引擎中，globalThis 属性直接引用全局对象，而在浏览器引擎中，它通过代理间接引用全局对象。

在需要访问全局对象且有可能在不一样的 JavaScript 环境中共享的时候，应该使用 globalThis。如果脚本只在一个环境下运行，应该用不到 globalThis。

## 3. 窗口关系

top 对象始终指向最上层（最外层）窗口，即浏览器窗口本身。而 parent 对象始终指向当前窗口的父窗口。如果当前窗口是最上层窗口，则 parent 等于 top（都等于 window）。最上层的 window 如果不是他通过 window.open() 打开的，那么其 name 不会包含值，本章后面会讨论。

还有一个 self 对象，它是终极 window 属性，始终会指向 window。实际上，self 和 window 就是同一个对象。之所以还要暴露 self，就是为了和 top、parent 保持一致。

这些属性都是 window 对象的属性，因此访问 window.parent、window.top 和 window.self 都可以。这意味着可以把访问多个窗口的 window 对象串联起来，比如 window.parent.parent。

## 4. 窗口位置与像素比

### window.moveTo()

### window.moveBy()

### window.devicePixelRatio

window 对象的位置可以通过不同的属性和方法来确定。现代浏览器提供了 screenLeft 和 screenTop 属性，用于表示窗口相对于屏幕左侧和顶部的位置，返回值的单位是 CSS 像素。

可以使用 moveTo() 和 moveBy() 方法移动窗口。moveTo() 接收要移动到的新位置的绝对坐标 x 和 y，而 moveBy() 接收相对当前位置在两个方向上移动的像素数。比如：

```javascript
// 把窗口移动到左上角
window.moveTo(0, 0);

// 把窗口向下移动 100 像素
window.moveBy(0, 100);

// 把窗口移动到坐标位置（200, 300）
window.moveTo(200, 300);

// 把窗口向左移动 50 像素
window.moveBy(-50, 0);
```

依浏览器而定，以上可能会被部分或全部禁用。

### 像素比

CSS 像素是 Web 开发中使用的统一像素单位。这个单位的背后其实是一个角度：0.0213°。如果屏幕距离人眼是一臂长，则以这个角度计算的 CSS 像素大小约为 1/96 英寸。这样定义像素大小是为了在不同设备上统一标准。比如，低分辨率平板设备上 12 像素（CSS 像素）的文字应该与高清 4K 屏幕下 12 像素（CSS 像素）的文字具有相同大小。这就带来了一个问题，不同像素密度的屏幕下就会有不同的缩放系数，以便把物理像素（屏幕实际的分辨率）转换为 CSS 像素（浏览器报告的虚拟分辨率）。

举个例子，手机屏幕的物理分辨率可能是 1920⨉1080，但因为其像素可能非常小，所以浏览器需要将其分辨率降为较低的逻辑分辨率，比如 640⨉360。这个物理像素与 CSS 像素之间的转换比率由 window.devicePixelRatio 属性提供。对于分辨率从 1920⨉1080 转换为 640⨉360 的设备，window.devicePixelRatio 的值就是 3。这样一来，12 像素（CSS 像素）的文字实际上会用 36 像素的物理像素来显示。

window.devicePixelRatio 实际上与每英寸像素数（DPI，dots per inch）是对应的。DPI 表示单位像素密度，而 window.devicePixelRatio 表示物理像素与逻辑像素之间的缩放系数。

## 5. 窗口大小

### window.innerWidth

### window.innerHeight

### window.outerWidth

### window.outerHeight

### document.documentElement.clientWidth

### document.documentElement.clientHeight

### window.resizeTo()

### window.resizeBy()

在不同浏览器中确定浏览器窗口大小没有想象中那么容易。所有现代浏览器都支持 4 个属性：innerWidth、innerHeight、outerWidth 和 outerHeight。outerWidth 和 outerHeight 返回浏览器窗口自身的大小（不管是在最外层 window 上使用，还是在窗格 `<frame>` 中使用）。innerWidth 和 innerHeight 返回浏览器窗口中页面视口的大小（不包含浏览器边框和工具栏）。此外，document.documentElement.clientWidth 和 document.documentElement.clientHeight 返回页面视口的宽度和高度。

在移动设备上，window.innerWidth 和 window.innerHeight 返回视口的大小，也就是屏幕上页面可视区域的大小。在放大或缩小页面时，这些值也会相应变化。document.documentElement 用于度量布局视口的大小，即渲染页面的实际大小。布局视口是相对于可见视口的概念，可见视口只能显示整个页面的一小部分。在放大或缩小页面时，这些值也会相应变化。

因为桌面浏览器的差异，所以需要先确定用户是不是在使用移动设备，然后再决定使用哪个属性。

可以使用 resizeTo() 和 resizeBy() 方法调整窗口大小。这两个方法都接收两个参数：resizeTo() 接收新的宽度和高度值，而 resizeBy() 接收宽度和高度各缩放多少像素。下面看个例子：

```javascript
// 缩放到 100⨉100
window.resizeTo(100, 100);

// 缩放到 200⨉150
window.resizeBy(100, 50);

// 缩放到 300⨉300
window.resizeTo(300, 300);
```

与移动窗口的方法一样，缩放窗口的方法可能会被浏览器禁用，而且在某些浏览器中默认是禁用的。同样，缩放窗口的方法只能应用到最上层的 window 对象。

## 6. 视口位置

### window.pageXoffset

### window.pageYoffset

### window.scrollX

### window.scrollY

### window.scrollTo()

### window.scrollBy()

浏览器窗口尺寸通常无法显示整个页面，为此用户可以通过滚动在有限的视口中查看文档。度量文档相对于视口滚动距离的属性有两对，它们返回相等的值：window.pageXoffset/window.scrollX 和 window.pageYoffset/window.scrollY。

可以使用 scroll()、scrollTo() 和 scrollBy() 方法滚动页面。这 3 个方法都接收表示相对视口距离的 x 和 y 坐标，这两个参数在前两个方法中表示要滚动到的坐标，在最后一个方法中表示滚动的距离。

```javascript
// 相对于当前视口向下滚动 100 像素
window.scrollBy(0, 100);

// 相当于当前视口向右滚动 40 像素
window.scrollBy(40, 0);

// 滚动到页面左上角
window.scrollTo(0, 0);

// 滚动到距离屏幕左边及顶边各 100 像素的位置
window.scrollTo(100, 100);
```

这几个方法也都接收一个 ScrollToOptions 字典，除了提供偏移值，还可以通过 behavior 属性告诉浏览器是否平滑滚动。

```javascript
// 正常滚动
window.scrollTo({
    left: 100,
    top: 100,
    behavior: 'auto'
});

// 平滑滚动
window.scrollTo({
    left: 100,
    top: 100,
    behavior: 'smooth'
});
```

## 7. 导航与打开窗口

### window.open()

window.open() 方法可以用于导航到指定 URL，也可以用于打开新浏览器窗口。这个方法接收 4 个参数：要加载的 URL、目标窗口、特性字符串和表示新窗口的浏览器历史记录中是否替代当前加载页面的布尔值。通常，调用这个方法时只传 3 个参数，最后一个参数只有在不打开新窗口时才会使用。

如果 window.open() 的第二个参数是一个已经存在的窗口或窗格（frame）的名字，则会在对应的窗口或窗格中打开 URL。下面是一个例子：

```javascript
// 与 <a href="http://www.wiley.com" target="topFrame" />相同
window.open("http://www.wiley.com/", "topFrame");
```

执行这行代码的结果就如同用户点击了一个 href 属性为 "http://www.wiley.com"、target 属性为 "topFrame" 的链接。如果有一个窗口名叫 "topFrame"，则这个窗口就会打开这个 URL，否则就会打开一个新窗口并将其命名为 "topFrame"。第二个参数也可以是一个特殊的窗口名，比如 _self、_parent、_top 或 _blank。

### 1. 弹出窗口

如果 window.open() 的第二个参数不是已有窗口，则会打开一个新窗口或标签页。第三个参数，即特性字符串，用于指定新窗口的配置。如果没有传第三个参数，则新窗口（或标签页）会带有所有默认的浏览器特性（工具栏、地址栏、状态栏等都是默认配置）。如果打开的不是新窗口，则忽略第三个参数。

特性字符串是一个逗号分隔的字符串，用于设置新窗口包含的特性。下表列出了一些选项。

| 设置       | 值            | 说明                                                         |
| ---------- | ------------- | ------------------------------------------------------------ |
| height     | 数值          | 新窗口高度。这个值不能小于 100                               |
| left       | 数值          | 新窗口的 x 轴坐标。这个值不能是负值                          |
| location   | "yes" 或 "no" | 表示是否显示地址栏。不同浏览器的默认值不一样。在设置为 "no" 时，地址栏可能隐藏或禁用（取决于浏览器） |
| menubar    | "yes" 或 "no" | 表示是否显示菜单栏。默认为 "no"                              |
| resizable  | "yes" 或 "no" | 表示是否可以拖动改变新窗口大小。默认为 "no"                  |
| scrollbars | "yes" 或 "no" | 表示是否可以在内容过长时滚动。默认为 "no"                    |
| status     | "yes" 或 "no" | 表示是否显示状态栏。不同浏览器的默认值不一样                 |
| toolbar    | "yes" 或 "no" | 表示是否显示工具栏。默认为 "no"                              |
| top        | 数值          | 新窗口的 y 轴坐标。这个值不能是负值f                         |
| width      | 数值          | 新窗口的宽度。这个值不能小于 100                             |

>注意
>
>其中一些选项（例如 toolbar、scrollbars）并没有在 Firefox 和 Chrome 等现代浏览器中得到支持。

这些设置需要以逗号分隔的名值对形式出现，其中名值对以等号连接。（特性字符串中不能包含空格。）来看下面的例子：

```javascript
window.open("http://www.wiley.com/", "wileyWindow", "height=400,width=400,top=10,left=10,resizable=yes");
```

这行代码会打开一个可缩放的新窗口，大小为 400像素⨉400 像素，位于离屏幕左边及顶边各 10 像素的位置。

window.open() 方法返回一个对新建窗口的引用。这个对象与普通 window 对象没有区别，只是为控制新窗口提供方便。例如，某些浏览器默认不允许缩放或移动主窗口，但可能允许缩放或移动通过 window.open() 创建的窗口。跟使用任何 windows 对象一样，可以使用这个对象操纵新打开的窗口。

```javascript
let wileyWin = window.open("http://www.wiley.com/", "wileyWindow", "height=400,width=400,top=10,left=10,resizable=yes");

// 缩放
wileyWin.resizeTo(500, 500);

// 移动
wileyWin.moveTo(100, 100);
```

还可以使用 close() 方法关闭新打开的窗口：

```javascript
wileyWin.close();
```

这个方法只能用于 window.open() 创建的弹出窗口。虽然不可能不经用户确认就关闭主窗口，但弹出窗口可以调用 top.close() 来关闭自己。关闭窗口以后，窗口的引用虽然还在，但只能用于检查其 closed 属性：

```javascript
wileyWin.close();
alert(wileyWin.closed()); // true
```

新创建窗口的 window 对象有一个 opener 是修改呢，指向打开它的窗口。这个属性只在弹出窗口的最上层 window 对象（top）有定义，是指向调用 window.open() 打开它的窗口或窗格的指针。例如：

```javascript
let wileyWin = window.open("http://www.wiley.com/", "wileyWindow", "height=400,width=400,top=10,left=10,resizable=yes");

alert(wileyWin.opener === window); // true
```

虽然新建窗口中有指向打开它的窗口的指针，但反之则不然。窗口不会跟踪记录自己打开的新窗口，因此开发者需要自己记录。

在某些浏览器中，每个标签页会运行在独立的进程中。如果一个标签页打开了另一个标签页，而 window 对象需要跟另一个标签页通信，则标签页就不能运行在独立的进程中。在这些浏览器中，可以将新打开的标签页的 opener 属性设置为 null，表示新打开的标签页可以运行在独立的进程中。比如：

```javascript
let wileyWin = window.open("http://www.wiley.com/", "wileyWindow", "height=400,width=400,top=10,left=10,resizable=yes");

wileyWin.opener = null;
```

把 opener 设置为 null 表示新打开的标签页不需要与打开它的标签页通信，因此可以在独立的进程中运行。这个连接一旦切断，就无法恢复了。

### 2. 安全限制

弹出窗口有段时间被在线广告滥用。很多在线广告会把弹出窗口伪装成系统对话框，诱导用户点击。因为长得向系统对话框，所以用户很难分清这些弹窗得来源。为了让用户能够区分清楚，浏览器开始对弹窗施加限制。

此外，浏览器仅在用户操作后才允许创建弹窗。在网页加载过程中调用 window.open() 没有效果，而且还可能导致向用户显示错误。弹窗通常可能在点击鼠标或按下键盘中某个键的情况下才能打开。

### 3. 弹窗屏蔽程序

所有现代浏览器都内置了屏蔽弹窗的程序，因此大多数意料之外的弹窗会被屏蔽。在浏览器屏蔽弹窗时，可能会发生一些事。如果浏览器内置的弹窗屏蔽程序阻止了弹窗，那么 window.open() 很可能会返回 null。此时，只要检查这个方法的返回值就可以知道弹窗是否被屏蔽了，比如：

```javascript
let wileyWin = window.open("http://www.wiley.com", "_blank");
if (wileyWin === null) {
    alert("The popup was blocked!");
}
```

在浏览器扩展或其他程序屏蔽弹窗时，window.open() 通常会抛出错误。因此要准确检测弹窗是否被屏蔽，除了检测 window.open() 的返回值，还要把它用 try/catch 包装起来，像这样：

```javascript
let blocked = false;

try {
    let wileyWin = window.open("http://www.wiley.com", "_blank");
    if (wileyWin === null) {
        blocked = true;
    }
} catch(ex) {
    blocked = true;
}

if (blocked) {
    alert("The popup was blocked!");
}
```

无论弹窗是用什么方法屏蔽的，以上代码都可以准确判断调用 window.open() 的弹窗是否被屏蔽了。

>注意
>
>检查弹窗是否被屏蔽不影响浏览器显示关于弹窗被屏蔽的消息。

## 8. 定时器

### setTimeout()

### setInterval()

JavaScript 在浏览器中是单线程执行的，但允许使用定时器指定在某个时间之后或每隔一段时间就执行相应的代码。setTimeout() 用于指定在一定时间后执行某些代码，而 setInterval() 用于指定每隔一段时间执行某些代码。

setTimeout() 方法通常接收两个参数：要执行的代码和在执行回调函数前等待的时间（毫秒）。第一个参数可以是包含 JavaScript 代码的字符串（类似于传给 eval() 的字符串）或者一个函数，比如：

```javascript
// 在 1 秒后显示警告框
setTimeout(() => alert("Hello world!"), 1000);
```

第二个参数是要等待的毫秒数，而不是要执行代码的确切时间。JavaScript 是单线程的，所以每次只能执行一段代码。为了调度不同代码的执行，JavaScript 维护了一个任务队列，其中的任务会按照添加到队列的先后顺序执行。setTimeout() 的第二个参数只是告诉 JavaScript 引擎在指定的毫秒数过后把任务添加到这个队列。如果队列是空的，则会立即执行该代码。如果队列不是空的，则代码必须等待前面的任务执行完才能执行。

调用 setTimeout() 时，会返回一个表示该超时排期的数值 ID。这个超时 ID 是被排期执行代码的唯一标识符，可用于取消该任务。要取消等待中的排期任务，可以调用 clearTimeout() 方法并传入超时 ID，如下面的例子所示：

```javascript
// 设置超时任务
let timeoutId = setTimeout(() => alert("Hello world!"), 1000);

// 取消超时任务
clearTimeout(timeoutId);
```

只要是在指定到达之前调用 clearTimeout()，就可以取消超时任务。在任务执行后再调用 clearTimeout() 没有效果。

>注意
>
>所有超时执行的代码（函数）都会在全局作用域中国的一个匿名函数中运行，因此函数中的 this 值在非严格模式下始终指向 window，而在严格模式下是 undefined。如果给 setTimeout() 提供一个箭头函数，那么 this 会引用定义它时所在的词法作用域。

setInterval() 与 setTimeout() 的使用方法类似，只不过指定的任务会每隔指定时间就执行一次，直到取消循环定时或者页面卸载。setInterval() 同样可以接收两个参数：要执行的代码（字符串或函数），以及把下一次执行定时代码的任务添加到队列要等待的时间（毫秒）。下面是一个例子：

```javascript
setInterval(() => alert("Hello world!"), 10000);
```

>注意
>
>这里的关键是第二个参数，也就是间隔时间，它指的是向队列添加新任务之前等待的时间。比如，调用 setInterval() 的时间为 01:00:00，间隔时间为 3000 毫秒。这意味着 01:00:03 时，浏览器会把任务添加到执行队列。浏览器不关心这个任务什么时候执行或者执行要花多长时间。因此，到了 01:00:06，它会向队列中添加一个任务。由此可见，执行时间短、非阻塞的回调函数比较适合 setInterval()。

setInterval() 方法也会返回一个循环定时 ID，可以用于在未来某个时间点取消循环定时。要取消循环定时，可以调用 clearInterval() 并传入定时 ID。相对于 setTimeout() 而言，取消定时的能力对 setInterval() 更加重要。毕竟，如果一直不管它，那么定时任务会一直执行到页面卸载，下面是一个常见的例子：

```javascript
let num = 0, intervalId = null;
let max = 10;

let incrementNumber = function() {
    num++;
    
    // 如果达到最大值吗，则取消所有未指定的任务
    if (num == max) {
        clearInterval(intervalId);
        alert("Done");
    }
}

intervalId = setInterval(incrementNumber, 500);
```

在这个例子中，变量 num 会每半秒递增一次，直至达到最大限制值，此时循环定时会被取消。这个模式也可以使用 setTimeout() 来实现，比如：

```javascript
let num = 0;
let max = 10;
let incrementNumber = function() {
    num++;
    
    // 如果还没有达到最大值，再设置一个超时任务
    if (num < max) {
        setTimeout(incrementNumber, 500);
    } else {
        alert("Done");
    }
}

setTimeout(incrermentNumber, 500);
```

注意在使用 setTimeout() 时，不一定要记录超时 ID，因为它会在条件满足时自动停止，否则会自动设置另一个超时任务。这个模式是设置循环任务的推荐做法。setInterval() 在实践中很少会在生产环境中使用，因为8一个任务结束和下一个任务开始之间的时间间隔是无法保证的，有些循环定时任务可能会被跳过。而像前面这个例子中一样使用 setTimeout() 则能确保不会出现这种情况。一般来说，最好不要使用 setInterval()。

## 9. 系统对话框

使用 alert()、confirm() 和 prompt() 方法，可以让浏览器调用系统对话框向用户显示消息。这些对话框与浏览器中显示的网页无关，而且也不包含 HTML。它们的外观由操作系统或者浏览器决定，无法使用 CSS 设置。此外，这些对话框都是同步的模态对话框，即在它们显示的时候，代码会停止执行，在它们消失以后，代码才会恢复执行。

alert() 方法在本书示例中经常用到。它接收一个要显示给用户的字符串。与 console.log 可以接收任意数量的参数且能一次性打印这些参数不同，alert() 只接收一个参数。调用 alert() 时，传入的字符串会显示在一个系统对话框中。对话框只有一个 "OK"（确定）按钮。如果传给 alert() 的参数不是一个原始字符串，则会调用这个值的 toString() 方法将其转换为字符串。

警告框（alert）通常用于向用户显示一些他们无法控制的消息，比如报错。用户唯一的选择就是在看到警告框之后把它关闭。下图展示了一个警告框。

第二种对话框叫确认框，通过调用 confirm() 来显示。确认框跟警告框类似，都会向用户显示消息。但不同之处在于，确认框有两个按钮："Cancel"（取消）和 "
OK"（确定）。用户通过单击不同的按钮表明接下来执行什么操作。比如，confirm("Are you sure?") 会显示下图所示的确认框。





















