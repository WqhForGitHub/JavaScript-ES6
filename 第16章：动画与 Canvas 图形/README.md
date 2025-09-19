图形和动画已经日益成为浏览器中现代 Web 应用程序的必备功能，但现实起来仍然比较困难。视觉上复杂的功能要求性能调优和硬件加速，不能拖慢浏览器。目前已经有一套日趋完善的 API 和工具可以用来开发此类功能。

母庸置疑，`<canvas>` 是 HTML5 最受欢迎的新特性。这个元素会占据一块页面区域，JavaScript 可以动态在上面绘制图片。`<canvas>` 最早是苹果公司提出并准备用在控制面板中的，随着其他浏览器的迅速跟进，HTML5 将其纳入标准。

与浏览器环境中的其他部分一样，`<canvas>` 自身提供了一些 API，其中包括支持基础绘图能力的 2D 上下文和被称为 WebGL 的 3D 上下文。

# 1. 使用 requestAnimationFrame

## requestAnimationFrame

很长时间以来，计时器和定时执行都是 JavaScript 动画最先进的工具。虽然 CSS 过渡和动画方便了 Web 开发者实现某些动画，但 JavaScript 动画领域多年来进展甚微。Firefox4 率先在浏览器中为 JavaScript 动画增加了一个名为 mozRequestAnimationFrame() 方法的 API。这个方法会告诉浏览器要执行动画了，于是浏览器可以通过最优方式确定重绘的时序。自从出现之后，这个 API 被广泛采用，现在作为 requestAnimationFrame() 方法已经得到各大浏览器的支持。

## 1. 早期定时动画

以前，在 JavaScript 中创建动画基本上就是使用 setInterval() 来控制动画的执行。下面的例子展示了使用 setInterval() 的基本模式：

```javascript
(function() {
    function updateAnimations() {
        doAnimation1();
        doAnimation2();
        // 其他任务
    }
    setInterval(updateAnimations, 100);
})();
```

作为一个小型动画库的标配，这个 updateAnimations() 方法会周期性运行注册的动画任务，并反映出每个任务的变化（例如，同时更新滚动新闻和进度条）。如果没有动画需要更新，则这个方法既可以什么也不做，直接退出，也可以停止动画循环，等待其他需要更新的动画。

这种定时动画的问题在于无法准确知晓循环之间的延时。定时间间隔必须足够短，这样才能让不同的动画类型都能平滑顺畅，但又要足够长，以便产生浏览器可以渲染出来的变化。一般计算机显示器的屏幕刷新率都是 60Hz，基本上意味着每秒需要重绘 60 次。大多数浏览器会限制重绘频率，使其不超出屏幕的刷新率，这是因为超过刷新率，用户也感知不到。

因此，实现平滑动画最佳的重绘间隔为 1000 毫秒/60，大约 17 毫秒。以这个速度重绘可以实现最平滑的动画，因为这已经是浏览器的极限了。如果同时运行多个动画，可能需要加以限流，以免 17 毫秒的重绘间隔过快，导致动画过早运行完。

虽然使用 setInterval() 的定时动画比使用多个 setTimeout() 实现循环效率更高，但也不是没有问题。无论 setInterval() 还是 setTimeout() 都是不能保证时间精度的。作为第二个参数的延时只能保证何时会把代码添加到浏览器的任务队列，不能保证添加到队列就会立即运行。如果队列前面还有其他任务，那么就要等这些任务执行完再执行。简单来讲，这里毫秒延时并不是说何时这些代码会执行，而只是说到时候会把回调加到任务队列。如果添加到队列后，主线程还被其他任务占用，比如正在处理用户操作，那么回调就不会马上执行。

## 2. 时间间隔的问题

知道何时绘制下一帧是创造平滑动画的关键。直到几年前，都没有办法确切保证何时能让浏览器把下一帧绘制出来。随着 `<canvas>` 的流行和 HTML5 游戏的兴起，开发者发现 setInterval() 和 setTimeout() 的不精确是个大问题。

浏览器自身计数器的精度不足毫秒让这个问题雪上加霜。更麻烦的是，浏览器又开始对切换到后台或不活跃标签页中的计时器执行限流。因此即使将时间间隔设定为最优，也免不了只能得到近似的结果。

## 3. requestAnimationFrame

Mozilla 的 Robert O Callahan 一直在思考这个问题，并提出了一个独特的方案。他指出，浏览器知道 CSS 过渡和动画应该什么时候开始，并据此计算出正确的时间间隔，到时间就去刷新用户界面。但对于 JavaScript 动画，浏览器不知道动画什么时候开始。他给出的方案是创造一个名为 mozRequestAnimationFrame() 的新方法，用以通知浏览器某些 JavaScript 代码要执行动画了。这样浏览器就可以在运行某些代码后进行适当的优化。目前所有浏览器都支持这个方法不带前缀的版本，即 requestAnimationFrame()。

requestAnimationFrame() 方法接收一个参数，此参数是一个要在重绘屏幕前调用的函数。这个函数就是修改 DOM 样式以反映下一次重绘有什么变化的地方。为了实现动画循环，可以把多个 requestAnimationFrame() 调用串联起来，就像以前使用 setTimeout() 时一样：

```javascript
function updateProgress() {
    var div = document.getElementById("status");
    div.style.width = (parseInt(div.style.width), 10) + 5) + "%";
    if (div.style.left != "100%") {
        requestAnimationFrame(updateProgress);
    }
}
 requestAnimationFrame(updateProgress);
```

因为 requestAnimationFrame() 只会调用一次传入的函数，所以每次更新用户界面时需要再手动调用它一次。同样，也需要控制动画何时停止。结果就会得到非常平滑的动画。

目前为止，requestAnimationFrame() 已经解决了浏览器不知道 JavaScript 动画何时开始的问题，以及最佳间隔是多少的问题，但是，不知道自己的代码何时实际执行的问题呢？这个方案同样也给出了解决方法。

传给 requestAnimationFrame() 的函数可以接收一个参数，此参数是一个 DOMHighResTimeStamp 的实例（比如 performance.now() 返回的值），表示下次重绘的时间，这一点非常重要：requestAnimationFrame() 把重绘任务安排在了未来一个已知的时间点上，而且通过这个参数告诉了开发者。基于这个参数，就可以更好地决定如何调优动画了。

## 4. cancelAnimationFrame

与 setTimeout() 类似，requestAnimationFrame() 也返回一个请求 ID，可以用于通过另一个方法 cancelAnimationFrame() 来取消重绘任务。下面的例子展示了刚把一个任务加入队列又立即将其取消：

```javascript
let reqeustID = window.requestAnimationFrame(() => {
    console.log('Repaint!');
});
window.cancelAnimationFrame(requestID);
```

## 5. 通过 requestAnimationFrame 节流

requestAnimationFrame 这个名字多少有点误导性。支持这个方法的浏览器实际上会暴露出作为钩子的回调队列。所谓钩子（hook），就是浏览器在执行下一次重绘之前的一个点。这个回调队列是一个可修改的函数列表，包含应该在重绘之前调用的函数。每次调用 requestAnimationFrame() 都会在队列上推入一个回调函数，队列的长度没有限制。

这个回调队列的行为不一定跟动画有关。不过，通过 requestAnimationFrame() 递归地向队列中加入回调函数，可以保证每次重绘最多只调用一次回调函数。这是一个非常好的节流工具。在频繁执行影响页面外观的代码时（比如滚动事件监听器），可以利用这个回调队列进行节流。

先来看一个原生实现，其中的滚动事件监听器每次触发都会调用名为 expensiveOperation()（耗时操作）的函数。当向下滚动网页时，这个事件很快就会触发并执行成百上千次：

```javascript
function expensiveOperation() {
    console.log('Invoked at', Date.now());
}

window.addEventListener('scroll', () => {
    expensiveOperation();
})
```

如果想把事件处理程序的调用限制在每次重绘前发生，那么可以像这样下面把它封装到 requestAnimationFrame() 调用中：

```javascript
function expensiveOperation() {
    console.log('Invoked at', Date.now());
}

window.addEventListener('scroll', () => {
    window.requestAnimationFrame(expensiveOperation);
});
```

这样会把所有回调的执行集中在重绘钩子，但不会过滤掉每次重绘的多余调用。此时，定义一个标志变量，由回调设置其开关状态，就可以将多余的调用屏蔽：

```javascript
let enqueued = false;

function expensiveOperation() {
    console.log('Invoked at', Date.now());
    enqueued = false;
}

window.addEventListener('scroll', () => {
    if (!enqueued) {
        enqueued = true;
        window.requestAnimationFrame(expensiveOperation);
    }
});
```

因为重绘是非常频繁的操作，所以这还算不上真正的节流。更好的办法是配合使用一个计时器来限制操作执行的频率。这样，计时器可以限制实际的操作执行间隔，而 requestAnimationFrame 控制在浏览器的哪个渲染周期中执行。下面的例子可以将回调限制为不超过 50 毫秒执行一次：

```javascript
let enabled = true;

function expensiveOperation() {
    console.log('Invoked at', Date.now());
}

window.addEventListener('scroll', () => {
    if (enabled) {
        enabled = false;
        window.requestAnimationFrame(expensiveOperation);
        window.setTimeout(() => enabled = true, 50);
    }
});
```

# 2. 基本的画布功能

## getContext("2d")

创建 `<canvas>` 元素时至少要设置其 width 和 height 属性，这样才能告诉浏览器在多大面积上绘图。出现在开始和结束标签之前的内容是后备数据，会在浏览器不支持 `<canvas>` 元素时显示。比如：

```html
<canvas id="drawing" width="200" height="200">A drawing of something.</canvas>
```

与其他元素一样，width 和 height 属性也可以在 DOM 节点上设置，因此可以随时修改。整个元素还可以通过 CSS 添加样式，并且元素在添加样式或实际绘制内容前是不可见的。

要在画布上绘制图形，首先要取得绘图上下文。使用 getContext() 方法可以获取对绘图上下文的引用。对于平面图形，需要给这个方法传入参数 "2d"，表示要获取 2D 上下文对象：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");
```

可以使用 toDataURL() 方法导出 `<canvas>` 元素上的图像。这个方法接收一个参数：要生成图像的 MIME 类型（与用来创建图形的上下文无关）。例如，要从画布上导出一张 PNG 格式的图片，可以这样做：

```javascript
let drawing = document.getElementById("drawing");

// 取得图像的数据 URI
let imgURI = drawing.toDataURL("image/png");

// 显示图片
let image = document.createElement("img");
image.src = imgURI;
document.body.appendChild(image);
```

浏览器默认将图像编码为 PNG 格式，除非另行指定。

>注意
>
>如果画布中的图像是其他域绘制过来的，toDataURL() 方法就会抛出错误。相关内容本章后面会讨论。

# 3. 2D 绘图上下文

## strokeStyle

## fillStyle

## fillRect()

## strokeRect()

## clearRect()

## arc()

## arcTo()

## bezierCurveTo()

## lineTo()

## moveTo()

## quadraticCurceTo()

## rect()

## font

## textAlign

## textBaseLine

## fillText()

## strokeText()

## save()

## restore()

## drawImage()

## createLinearGradient()

2D 绘图上下文提供了绘制 2D 图形的方法，包括矩形、弧形和路径。2D 上下文的坐标原点（0, 0）在 `<canvas>` 元素的左上角。所有坐标值都相对于该点计算，因此 x 坐标向右增长，y 坐标向下增长。默认情况下，width 和 height 表示两个方向上像素的最大值。

## 1. 填充和描边

2D 上下文有两个基本绘制操作：填充和描边。填充以指定样式（颜色、渐变或图像）自动填充形状，而描边只为图形边界着色。大多数 2D 上下文操作有填充和描边的变体，显示效果取决于两个属性：fillStyle 和 strokeStyle。

这两个属性可以是字符串、渐变对象或图案对象，默认值为 "#000000"。字符串表示颜色值，可以是 CSS 支持的任意格式：名称、十六进制代码、rgb、rgba、hsl 或 hsla。比如：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");
context.strokeStyle = "red";
context.fillStyle = "#0000ff";
```

这里把 strokeStyle 设置为 "red"（CSS 颜色名称），把 fillStyle 设置为 "#0000ff"（蓝色）。所有与描边和填充相关的操作都会使用这两种样式，除非再次修改。这两个属性也可以是渐变或图案，本章后面会讨论。

## 2. 绘制矩形

矩形是唯一一个可以直接在 2D 绘图上下文中绘制形状。与绘制矩形相关的方法有 3 个：fillRect()、strokeRect() 和 clearRect()。这些方法都接收 4 个参数：矩形 x 坐标、矩形 y 坐标、矩形宽度和矩形高度。这几个参数的单位都是像素。

fillRect() 方法用于以指定颜色在画布上绘制并填充矩形。填充的颜色使用 fillStyle 属性指定。来看下面的例子：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 绘制红色矩形
context.fillStyle = "#ff0000";
context.fillRect(10, 10, 50, 50);

// 绘制半透明蓝色矩形
context.fillStyle = "rgba(0, 0, 255, 0.5)";
context.fillRect(30, 30, 50, 50);
```

以上代码先将 fillStyle 设置为红色并在坐标点（10, 10）绘制了一个宽高均为 50 像素的矩形。接着使用 rgba() 格式将 fillStyle 设置为半透明蓝色，并绘制了另一个与第一部分重叠的矩形。结果就是可以透过蓝色矩形看到红色矩形（见下图）。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E7%94%A8%20fillRect%28%29%20%E7%BB%98%E5%88%B6%E7%9A%84%E9%87%8D%E5%8F%A0%E7%9A%84%E5%8D%8A%E9%80%8F%E6%98%8E%E7%9F%A9%E5%BD%A2.png)

strokeRect() 方法使用通过 strokeStyle 属性指定的颜色绘制矩形轮廓。下面是一个例子：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 绘制红色轮廓的矩形
context.strokeStyle = "#ff0000";
context.strokeRect(10, 10, 50, 50);

// 绘制半透明蓝色轮廓的矩形
context.strokeStyle = "rgba(0, 0, 255, 0.5)";
context.strokeRect(30, 30, 50, 50);
```

以上代码同样绘制了两个重叠的矩形，不过只有轮廓，不是实心的（见下图）。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E7%94%A8%20strokeRect%28%29%20%E7%BB%98%E5%88%B6%E7%9A%84%E9%87%8D%E5%8F%A0%E7%9A%84%E7%9F%A9%E5%BD%A2%E8%BD%AE%E5%BB%93.png)

>注意
>
>描边宽度由 lineWidth 属性控制，它可以是任意整数值。类似地，lineCap 属性控制线条端点的形状["butt"（平头）、"round"（出圆头）或 "square"（出方头）]，而 lineJoin 属性控制线条交点的形状["round"（圆转）、"bevel"（取平）或 "miter"（出尖）]。

使用 clearRect() 方法可以擦除画布中某个区域。该方法用于把绘图上下文中的某个区域变透明。通过先绘制形状再擦除指定区域，可以创造出有趣的效果，比如从已有矩形中开个孔。来看下面的例子：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 绘制红色矩形
context.fillStyle = "#ff0000";
context.fillRect(10, 10, 50, 50);

// 绘制半透明蓝色矩形
context.fillStyle = "rgba(0, 0, 255, 0.5)";
context.fillRect(30, 30, 50, 50);

// 在前两个矩形重叠的区域擦除一个矩形区域
context.clearRect(40, 40, 10, 10);
```

以上代码在两个矩形重叠的区域上擦出了一个小矩形，下图展示了结果。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20clearRect%28%29%20%E6%93%A6%E9%99%A4%E5%86%85%E5%AE%B9.png)

## 3. 绘制路径

2D 绘图上下文支持很多在画布上绘制路径的方法。通过路径可以创建复杂的形状和线条。要绘制路径，必须首先调用 beginPath() 方法以表示要开始绘制新路径。然后，再调用下列方法来绘制路径。

* arc(x, y, radius, startAngle, endAngle, counterclockwise)：以坐标（x, y）为圆心，以 radius 为半径绘制一条弧线，起始角度为 startAngle，结束角度为 endAngle（都是弧度）。最后一个参数 counterclockwise 表示是否逆时针计算起始角度和结束角度（默认为顺时针）。
* arcTo(x1, y1, x2, y2, radius)：以给定半径 radius，经由（x1, y1）绘制一条从上一点到（x2, y2）的弧线。
* bezierCurveTo(c1x, c1y, c2x, c2y, x, y)：以 (c1x, c1y) 和 (c2x, c2y) 为控制点，绘制一条从上一点到（x, y）的弧线（三次贝塞尔曲线）。
* lineTo(x, y)：绘制一条从上一点到（x, y）的直线。
* moveTo(x, y)：不绘制线条，只把绘制光标移动到（x, y）。
* quadraticCurveTo(cx, cy, x, y)：以（cx, cy）为控制点，绘制一条从上一点到（x, y）的弧线（二次贝塞尔曲线）。
* rect(x, y, width, height)：以给定宽度和高度在坐标点（x, y）绘制一个矩形。这个方法与 strokeRect() 和 fillRect() 的区别在于，它创建的是一条路径，而不是独立的图形。

创建路径之后，可以使用 closePath() 方法绘制一条返回起点的线。如果路径已经完成，则既可以指定 fillStyle 属性并调用 fill() 方法来填充路径，也可以指定 strokeStyle 属性并调用 stroke() 方法来描画路径，还可以调用 clip() 方法基于已有路径创建一个新剪切区域。

下面这个例子使用前面提到的方法绘制了一个不带数字的表盘：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 创建路径
context.beginPath();

// 绘制外圆
context.arc(100, 100, 99, 0, 2 * Math.PI, false);

// 绘制内圆
context.moveTo(194, 100);
context.arc(100, 100, 94, 0, 2 * Math.PI, false);

// 绘制分针
context.moveTo(100, 100);
context.lineTo(100, 15);

// 绘制时针
context.moveTo(100, 100);
context.lineTo(35, 100);

// 描画路径
context.stroke();
```

这个例子使用 arc() 绘制了两个圆形，一个外圆和一个内圆，以构成表盘的边框。外圆半径 99 像素，原点为（100, 100），也就是画布的中心。要绘制完整的圆形，必须从 0 弧度绘制到 2Π 弧度（使用数字常量 Math.PI）。而在绘制内圆之前，必须先把路径移动到内圆上的一点，以避免绘制出多余的线条。第二次调用 arc() 时使用了稍小一些的半径，以呈现边框效果。然后，再组合运用 moveTo() 和 lineTo() 分别绘制分针和时针。最后一步是调用 stroke()，得到如下图所示的图像。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20arc%28%29%20%E7%BB%98%E5%88%B6%E8%B7%AF%E5%BE%84.png)

路径是 2D 上下文的主要绘制机制，为绘制结果提供了很多控制。因为路径经常被使用，所以也有一个 isPointInPath() 方法，接收 x 轴和 y 轴坐标作为参数。这个方法用于确定指定的点是否在路径上，可以在关闭路径前随时调用，比如：

```javascript
if (context.isPointInPath(100, 100)) {
    alert("Point (100, 100) is in the path.");
}
```

2D 上下文的路径 API 非常可靠，可用于创建涉及各种填充样式、描边样式等的复杂图像。

## 4. 绘制文本

文本和图像混合也是常见的绘制需求，因此 2D 绘图上下文还提供了绘制文本的方法，即 fillText() 和 strokeText()。这两个方法都接收 4 个参数：要绘制的字符串、x 坐标、y 坐标和可选的最大像素宽度。这两个方法最终绘制的结果都取决于以下 3 个属性。

* font：以 CSS 语法指定的字体样式、大小、字体族等，比如 "10px Arial"
* textAlign：指定文本的对齐方式，可能的值包括 "start"、"end"、"left"、"right" 和 "center"。推荐使用 "start" 和 "end"，不使用 "left" 和 "right"，因为前者无论在从左到右书写的语言还是从右到左的语言中含义都更明确。
* textBaseLine：指定文本的基线，可能的值包括 "top"、"hanging"、"middle"、"alphabetic"、"ideographic" 和 "bottom"。

这些属性都有相应的默认值，因为没必要每次绘制文本时都设置它们。fillText() 方法使用 fillStyle 属性绘制文本，而 strokeText() 方法使用 strokeStyle 属性。通常，fillText() 方法是使用最多的，因为它模拟了在网页中渲染文本。例如，下面的例子会在前一节示例的表盘顶部绘制数字 "12"：

```javascript
context.font = "bold 14px Arial";
context.textAlign = "center";
context.textBaseline = "middle";
context.fillText("12", 100, 20);
```

结果就得到了如下图所示的图像。

因为把 textAlign 设置为了 "center"，把 textBaseline 设置为了 "middle"，所以（100, 20）表示文本水平和垂直中心点的坐标。如果 textAlign 是 "start"，那么 x 坐标在从左到右书写的语言中表示文本的左侧坐标，而 "end" 会让 x 坐标在从左到右书写的语言中表示文本的右侧坐标。例如：

```javascript
// 正常
context.font = "bold 14px Arial";
context.textAlign ="center";
context.textBaseline = "middle";
context.fillText("12", 100, 20);
// 与开头对齐
context.textAlign = "start";
context.fillText("12", 100, 40);
// 与末尾对齐
context.textAlign = "end";
context.fillText("12", 100, 60);
```

字符串 "12" 被绘制了 3 次，每次使用的坐标都一样，但 textAlign 值不同。为了让每个字符串不至于重叠，每次绘制的 y 坐标都会设置得大一些。结果就是如下图所示的图像。

因为表盘中垂直的线条是居中的，所以文本的对齐方式就一目了然了。类似地，通过修改 textBaseline 属性，可以改变文本的垂直对齐方式。比如，设置为 "top" 意味着 y 坐标表示文本顶部，"bottom" 表示文本底部，"hanging"、"alphabetic" 和 "ideographic" 分别引用字体中特定的基准点。

由于绘制文本很复杂，特别是想把文本绘制要特定区域的时候，因此 2D 上下文提供了用于辅助确定文本大小的 measureText() 方法。这个方法接收一个参数，即要绘制的文本，然后返回一个 TextMetrics 对象。这个返回的对象目前只有一个属性 width，不过将来应该会增加更多度量指标。

meaureText() 方法使用 font、textAlign 和 textBaseline 属性当前的值计算绘制指定文本后的大小。假设要把文本 "Hello world!" 放到一个 140 像素宽的矩形中，可以使用以下代码，从 100 像素的字体大小开始计算，不断递减，直到文本大小合适：

```javascript
let fontSize = 100;
context.font = fontSize + "px Arial";
while(context.measureText("Hello world!").width > 140) {
    fontSize--;
    context.font = fontSize + "px Arial";
}
context.fillText("Hello world!", 10, 10);
context.fillText("Font size is " + fontSize + "px", 10, 50);
```

fillText() 和 strokeText() 方法还有第四个参数，即文本的最大宽度。这个参数是可选的（Firefox 4 是第一个实现它的浏览器），如果调用 fillText() 和 strokeText() 时提供了此参数，但要绘制的字符串超出了最大宽度限制，则文本会以正确的字符高度绘制，这时字符会被水平压缩，以达到限定宽度。下图展示了这个参数的效果。

绘制文本是一项比较复杂的操作，因此支持 `<canvas>` 元素的浏览器不一定全部实现了相关的文本绘制 API。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20fillText%28%29%20%E7%BB%98%E5%88%B6%E6%96%87%E6%9C%AC.png)

因为把 textAlign 设置成了 "center"，把 textBaseline 设置为了 "middle"，所以（100，20）表示文本水平和垂直中心点的坐标。如果 textAlign 是 "start"，那么 x 坐标在从左到右书写的语言中表示文本的左侧坐标，而 "end" 会让 x 坐标在从左至右书写的语言中表示文本的右侧坐标。例如：

```javascript
// 正常
context.font = "bold 14px Arial";
context.textAlign = "center";
context.textBaseline = "middle";
context.fillText("12", 100, 20);
// 与开头对齐
context.textAlign = "start";
context.fillText("12", 100, 40);
// 与末尾对齐
context.textAlign = "end";
context.fillText("12", 100, 60);
```

字符串 "12" 被绘制了 3 次，每次使用的坐标都一样，但 textAlign 值不同。为了让每个字符串不至于重叠，每次绘制的 y 坐标都会设置得大一些，结果就是如下图所示的图像。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%B8%8D%E5%90%8C%E7%9A%84%E6%96%87%E6%9C%AC%E6%8E%92%E5%B8%83.png)

因为表盘中垂直的线条是居中的，所以文本的对齐方式就一目了然了。类似地，通过修改 textBaseline 属性，可以改变文本的垂直对齐方式。比如，设置为 "top" 意味着 y 坐标表示文本顶部，"bottom" 表示文本底部，"hanging"、"alphabetic" 和 "ideographic" 分别引用字体中特定的基准点。

由于绘制文本很复杂，特别是想把文本绘制到特定区域的时候，因此 2D 上下文提供了用于辅助确定文本大小的 measureText() 方法，这个方法接收一个参数，即要绘制的文本，然后返回一个 TextMetrics 对象。这个返回的对象目前只有一个属性 width，不过将来应该会增加更多度量指标。

meaureText() 方法使用 font、textAlign 和 textBaseline 属性当前的值计算绘制指定文本后的大小。假设要把文本 "Hello world!" 放到一个 140 像素宽的矩形中，可以使用以下代码，从 100 像素的字体大小开始计算，不断递减，直到文本大小合适：

```javascript
let fontSize = 100;
context.font = fontSize + "px Arial";
while(context.measureText("Hello world!").width > 140) {
    fontSize--;
    context.font = fontSize + "px Arial";
}
context.fillText("Hello world!", 10, 10);
context.fillText("Font size is " + fontSize + "px", 10, 50);
```

fillText() 和 strokeText() 方法还有第四个参数，即文本的最大宽度。这个参数是可选的（Firefox 4 是第一个实现它的浏览器），如果调用 fillText() 和 strokeText() 时提供了此参数，但要绘制的字符串超出了最大宽度限制，则文本会以正确的字符高度绘制，这时字符会被水平压缩，以达到限定宽度。下图展示了参数的效果。

绘制文本是一项比较复杂的操作，因此支持 `<canvas>` 元素的浏览器不一定全部实现了相关的文本绘制 API。

## 5. 变换

上下文变换可以操作绘制在画布上的图像。2D 绘图上下文支持所有常见的绘制变换。在创建绘制上下文时，会以默认值初始化变换矩阵，从而让绘制操作如实应用到绘制结果上。对绘制上下文应用变换，可以导致以不同的变换矩阵应用绘制操作，从而产生不同的结果：

以下方法可用于改变绘制上下文的变换矩阵。

* rotate(angle)：围绕原点把图像旋转 angle 弧度
* scale(scaleX, scaleY)：通过在 x 轴乘以 scaleX、在 y 轴乘以 scaleY 来缩放图像。scaleX 和 scaleY 的默认值都是 1.0
* translate(x, y)：把原点移动到（x, y）。执行这个操作后，坐标（0, 0）就会变成（x, y）。
* transform(m1_1, m1_2, m2_1, m2_2, dx, dy)：像下面这样通过矩阵乘法直接修改矩阵。

​	m1_1    m1_2    dx

​	m2_1    m2_2    dy

​	0           0            1

*  setTransform(m1_1, m1_2, m2_1, m2_2, dx, dy)：把矩阵重置为默认值，再以传入的参数调用 transform()。

变换可以简单，也可以复杂。例如，在前面绘制表盘的例子中，如果把坐标原点移动到表盘中心，那再绘制表针就非常简单了：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 创建路径
context.beginPath();

// 绘制外圆
context.arc(100, 100, 99, 0, 2 * Math.PI, false);

// 绘制内圆
context.moveTo(194, 100);
context.arc(100, 100, 94, 0, 2 * Math.PI, false);

// 移动原点到表盘中心
context.translate(100, 100);

// 绘制分针
context.moveTo(0, 0);
contexgt.lineTo(0, -85);

// 绘制时针
context.moveTo(0, 0);
context.lineTo(-65, 0);

// 描画路径
context.stroke();
```

把原点移动到 (100, 100)，也就是表盘的中心后，要绘制表针只需简单的数学计算即可。这是因为所有计算都是基于(0, 0)，而不是(100, 100) 了。当然，也可以使用 rotate() 方法来转动表针：

```javascript
let drawing = document.getElementById("drawing");

let context = drawing.getContext("2d");

// 创建路径
context.beginPath();

// 绘制外圆
context.arc(100, 100, 99, 0, 2 * Math.PI, false);

// 绘制内圆
context.moveTo(194, 100);
context.arc(100, 100, 94, 0, 2 * Math.PI, false);

// 移动原点到表盘中心
context.translate(100, 100);

// 旋转表针
context.rotate(1);

// 绘制分针
context.moveTo(0, 0);
context.lineTo(0, -85);

// 绘制时针
context.moveTo(0, 0);
context.lineTo(-65, 0);

// 描画路径
context.stroke();
```

因为原点已经移动到表盘中心，所以旋转就是以该点为圆心的。这相当于把表针一头固定在表盘中心，然后向右拨了一个弧度。结果如下图所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20rotate%28%29%20%E6%97%8B%E8%BD%AC%E7%94%BB%E5%B8%83%E5%86%85%E5%AE%B9.png)

所有这些变换，包括 fillStyle 和 strokeStyle 属性，会一直保留在上下文中，直到再次修改它们。虽然没有办法明确地将所有值都重置为默认值，但有两个方法可以帮我们跟踪变化。如果想着什么时候再回到当前的属性和变换状态，可以调用 save() 方法。调用这个方法后，所有这一时刻的设置会被放到一个暂存栈中。保存之后，可以继续修改上下文。而在需要恢复之前的上下文时，可以调用 restore() 方法。这个方法会从暂存栈中取出并恢复之前保存的设置。多次调用 save() 方法可以在暂存栈中存储多套设置，然后通过 restore() 可以系统地恢复。下面来看一个例子：

```javascript
context.fillStyle = "#ff0000";
context.save();

context.fillStyle = "#00ff00";
context.translate(100, 100);
context.save();

context.fillStyle = "#0000ff";
context.fillRect(0, 0, 100, 200); // 在（100, 100）绘制蓝色矩形

context.restore();
context.fillRect(10, 10, 100, 200); // 在（110, 110）绘制绿色矩形

context.restore();
context.fillRect(0, 0, 100, 200); // 在（0, 0）绘制红色矩形
```

以上代码先将 fillStyle 设置为红色，然后调用 save()。接着，将 fillStyle 修改为绿色，坐标移动到（100, 100），并再次调用 save()，保存设置。随后，将 fillStyle 属性设置为蓝色并绘制一个矩形。因为此时坐标被移动了，所以绘制矩形的坐标上是（100, 100）。在调用 restore() 之后，fillStyle 恢复为绿色，因此这一次绘制的矩形是绿色的。而绘制矩形的坐标是（110, 110），因为变换仍在起作用。再次调用 restore() 之后，变换被移除，fillStyle 也恢复为红色。绘制最后一个矩形的坐标变成了（0, 0）。

注意，save() 方法只保存应用到绘图上下文的设置和变换，不保存绘图上下文的内容。

## 6. 绘制图像

2D 绘图上下文内置支持操作图像。如果想把现有图像绘制到画布上，可以使用 drawImage() 方法。这个方法可以接收 3 组不同的参数，并产生不同的结果。最简单的调用是传入一个 HTML 的 `<img>` 元素，以及表示绘制目标的 x 和 y 坐标，结果是把图像绘制到指定位置。比如：

```javascript
let image = document.images[0];
context.drawImage(image, 10, 10);
```

以上代码获取了文本中的第一个图像，然后在画布上的坐标（10, 10）处将它绘制了出来。绘制出来的图像与原来的图像一样大。如果想改变所绘制图像的大小，可以再传入另外两个参数：目标宽度和目标高度。这里的缩放只影响绘制的图像，不影响上下文的变换矩阵。比如下面的例子：

```javascript
context.drawImage(image, 50, 10, 20, 30);
```

执行之后，图像会缩放到 20 像素宽、30 像素高。

还可以只把图像的一个区域绘制到上下文中。此时，需要给 drawImage() 提供 9 个参数：要绘制的图像、源图像 x 坐标、源图像 y 坐标、源图像宽度、源图像高度、目标区域 x 坐标、目标区域 y 坐标、目标区域宽度和目标区域高度。这个重载后的 drawImage() 方法可以实现最大限度的控制，比如：

```javascript
context.drawImage(image, 0, 10, 50, 50, 0, 100, 40, 60);
```

最终，原始图像中只有一部分会绘制到画布上。这一部分从 (0, 10) 开始，50 像素宽、50 像素高。而绘制到画布上，会从 (0, 100) 开始，变成 40 像素宽、60 像素高。

像这样可以实现如下图所示的有趣效果。

第一个参数除了可以是 HTML 的 `<img>` 元素，还可以是另一个 `<canvas>` 元素，这样就会把另一个画布的内容绘制到当前画布上。

结合其他一些方法，drawImage() 方法可以方便地实现常见的图像操作。操作的结果可以使用 toDataURL() 方法获取。不过有一种情况例外：如果绘制的图像来自其他域而非当前页面，则不能获取其数据。此时，调用 toDataURL() 将抛出错误。如果来自 www.example.com 的页面上绘制的是来自 www.wiley.com 的图像，则上下文就是脏的，获取数据时会抛出错误。

## 7. 阴影

2D 上下文可以根据以下属性的值自动为已有形状或路径生成阴影。

* shadowColor：CSS 颜色值，表示要绘制的阴影颜色，默认为黑色。
* shadowOffsetX：阴影相对于形状或路径的 x 坐标的偏移量，默认为 0
* shadowOffsetY：阴影相对于形状或路径的 y 坐标的偏移量，默认为 0
* shadowBlur：像素，表示阴影的模糊量。默认值为 0，表示不模糊

这些属性都可以通过 context 对象读写。只要在绘制图像或路径前个这个属性设置好适当的值，阴影就会自动生成。比如：

```javascript
let context = drawing.getContext("2d");
// 设置阴影
context.shadowOffsetX = 5;
context.shadowOffsetY = 5;
context.shadowBlur = 4;
context.shadowColor = "rgba(0, 0, 0, 0.5)";
// 绘制红色矩形
context.fillStyle = "#ff0000";
context.fillRect(10, 10, 50, 50);
// 绘制蓝色矩形
context.fillStyle = "rgba(0, 0, 255, 1)";
context.fillRect(30, 30, 50, 50);
```

这里两个矩形使用了相同的阴影样式，得到了如下图所示的结果。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E5%9C%A8%E7%94%BB%E5%B8%83%E4%B8%8A%E7%BB%98%E5%88%B6%E9%98%B4%E5%BD%B1.png)

## 8. 渐变

渐变通过 CanvasGradient 的实例表示，在 2D 上下文中创建和修改都非常简单。要创建一个新的线性渐变，可以调用上下文的 createLinearGradient() 方法。这个方法接收 4 个参数：起点 x 坐标、起点 y 坐标、终点 x 坐标和终点 y 坐标。调用之后，该方法会以指定大小创建一个新的 CanvasGradient 对象并返回实例。

有了 gradient 对象后，接下来要使用 addColorStop() 方法为渐变指定色标。这个方法接收两个参数：色变位置和 CSS 颜色字符串。色标位置通过 0 ~ 1 范围内的值表示，0 是第一种颜色，1 是最后一种颜色。比如：

```javascript
let gradient = context.createLinearGradient(30, 30, 70, 70);
gradient.addColorStop(0, "white");
gradient.addColorStop(1, "black");
```

这个 gradient 对象现在表示的就是在画布上从 (30, 30) 到 (70, 70) 绘制一个渐变。渐变的起点颜色为白色，终点颜色为黑色。可以把这个对象赋给 fillStyle 或 strokeStyle 属性，从而以渐变填充或描画绘制的图形：

```javascript
// 绘制红色矩形
context.fillStyle = "#ff0000";
context.fillRect(10, 10, 50, 50);
// 绘制渐变矩形
context.fillStyle = gradient;
context.fillRect(30, 30, 50, 50);
```

为了让渐变覆盖整个矩形而不只是其中一部分，两者的坐标必须搭配合适。以上代码将得到如下图所示的结果。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20createLinearGradient%28%29%20%E7%BB%98%E5%88%B6%E7%BA%BF%E6%80%A7%E6%B8%90%E5%8F%98.png)

如果矩形没有绘制到渐变的范围内，则只会显示部分渐变。比如：

```javascript
context.fillStyle = gradient;
context.fillRect(50, 50, 50, 50);
```

以上代码执行之后绘制的矩形只有左上角有一部分白色。这是因为矩形的起点在渐变的中间，此时颜色过渡几乎要完成了。结果矩形大部分地方是黑色的，因为渐变不会重复。保持渐变与形状的一致非常重要，有时候可能需要写个函数计算相应的坐标。比如：

```javascript
function createRectLinearGradient(context, x, y, width, height) {
    return context.createLinearGradient(x, y, x + width, y + height);
}
```

这个函数会基于起点的 x，y 坐标和传入的宽度、高度创建渐变对象，之后调用 fillRect() 方法时可以使用相同的值：

```javascript
let gradient = createRectLinearGradient(context, 30, 30, 50, 50);
gradient.addColorStop(0, "white");
gradient.addColorStop(1, "black");
// 绘制渐变矩形
context.fillStyle = gradient;
context.fillRect(30, 30, 50, 50);
```

运行以上代码会得到如下图所示的效果。

因为创建起来要复杂一些，所以径向渐变比较难处理。不过，通常情况下，起点和终点的圆形都是同心圆，只要定义好圆心坐标，剩下的就是调整各自半径的问题了。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC16%E7%AB%A0%EF%BC%9A%E5%8A%A8%E7%94%BB%E4%B8%8E%20Canvas%20%E5%9B%BE%E5%BD%A2/%E4%BD%BF%E7%94%A8%20createRadialGradient%28%29%20%E7%BB%98%E5%88%B6%E5%BE%84%E5%90%91%E6%B8%90%E5%8F%98.png)

因为创建起来要复杂一些，所以径向渐变比较难处理。不过，通常情况下，起点和终点的圆形都是同心圆，只要定义好圆心坐标，剩下的就是调整各自半径的问题了。

## 9. 图案

图案是用于填充和描画图形的重复图像。要创建新图案，可以调用 createPattern() 方法并传入两个参数：一个 HTML `<img>` 元素和一个表示该如何从重复图像的字符串。第二个参数的值与 CSS 的 background-repeat 属性是一样的，包括 "repeat"、"repeat-x"、"repeat-y" 和 "no-repeat"。比如：

```javascript
let image = document.images[0],
    pattern = context.createPattern(image, "repeat");
// 绘制矩形
context.fillStyle = pattern;
context.fillRect(10, 10, 150, 150);
```

记住，跟渐变一样，图案的起点实际上是画布的原点（0, 0）。将填充样式设置为图案，表示在指定位置而不是开始绘制的位置显示图案。以上代码执行的结果如下图所示。

传给 createPattern() 方法的第一个参数也可以是 `<video>` 元素或者另一个 `<canvas>` 元素。





















































