# 1. 样式

HTML 中的样式有 3 种定义方式：外部样式表（通过 `<link>` 元素）、文档样式表（使用 `<style>` 元素）和元素特定样式（使用 style 属性）。DOM2 Style 为这 3 种应用样式的机制都提供了 API。

## 1. 存取元素样式

任何支持 style 属性的 HTML 元素在 JavaScript 中都会有一个对应的 style 属性。这个 style 属性是 CSSStyleDeclaration 类型的实例，其中包含通过 HTML style 属性为元素设置的所有样式信息，但不包含通过层叠机制从文档样式和外部样式中继承来的样式。HTML style 属性中的 CSS 属性在 JavaScript style 对象中都有对应的属性。因为 CSS 属性名使用连字符表示法（用连字符分隔两个单词，如 background-image），所以在 JavaScript 中这些属性必须转换为驼峰大小写样式（如 backgroundImage）。下表给出了几个常用的 CSS 属性与 style 对象中等价属性的对比。

| CSS 属性         | JavaScript 属性       |
| ---------------- | --------------------- |
| background-image | style.backgroundImage |
| color            | style.color           |
| display          | style.display         |
| font-family      | style.fontFamily      |

大多数属性名会这样直接转换过来。但有一个 CSS 属性名不能直接转换，它就是 float。因为 float 是 JavaScript 的保留字，所以不能用作属性名。DOM2 Style 规定它在 style 对象中对应的属性应该是 cssFloat。

任何时候，只要获得了有效 DOM 元素的引用，就可以通过 JavaScript 来设置样式。来看下面的例子：

```javascript
let myDiv = document.getElementById("myDiv");

// 设置背景颜色
myDiv.style.backgroundColor = "red";

// 修改尺寸
myDiv.style.width = "100px";
myDiv.style.height = "200px";

// 设置边框
myDiv.style.border = "1px solid black";
```

像这样修改样式时，元素的外观会自动更新。

>注意
>
>所有值都必须带单位。把 style.width 设置为 "20" 会被忽略，因为没带单位。记住，一定要加上单位。

通过 style 属性设置的值也可以通过 style 对象获取。比如下面的 HTML：

```html
<div id="myDiv" style="background-color: blue; width: 10px; height: 25px;"></div>
```

这个元素 style 属性的值可以像这样通过代码获取：

```javascript
console.log(myDiv.style.backgroundColor); // "blue"
console.log(myDiv.style.width); // "10px"
console.log(myDiv.style.height); // "25px"
```

如果元素上没有 style 属性，则 style 对象包含所有可能的 CSS 属性的空值。

### 1. DOM 样式属性和方法

#### cssText

#### length

#### parentRule

#### getPropertyPriority(propertyName)

#### getPropertyValue(propertyName)

#### item(index)

#### removeProperty(propertyName)

#### setProperty(propertyName, value, priority)k

DOM2 Style 规范也在 style 对象上定义了一些属性和方法。这些属性和方法提供了元素 style 属性的信息并支持修改，列举如下。

* cssText，包含 style 属性中的 CSS 代码。
* length，应用给元素的 CSS 属性数量。
* parentRule，表示 CSS 信息的 CSSRule 对象（下一节会讨论 CSSRule 类型）。
* getPropertyCSSValue(propertyName)，返回包含 CSS 属性 proeprtyName 值得 CSSValue 对象（已废弃，不推荐使用）。
* getPropertyPriority(propertyName)，如果 CSS 属性 propertyName 使用了 !important 则返回 "important"，否则返回空字符串。
* getPropertyValue(propertyName)，返回属性 propertyName 的字符串值。
* item(index)，返回索引为 index 的 CSS 属性名。
* removeProperty(propertyName)，从样式中删除 CSS 属性 propertyName。
* setProperty(propertyName, value, priority)，设置 CSS 属性 propertyName 的值为 value，priority 是 "important" 或空字符串。

通过 cssText 属性可以存取样式的 CSS 代码。在读模式下，cssText 返回 style 属性 CSS 代码在浏览器内部的表示。在写模式下，给 cssText 赋值会重写整个 style 属性的值，意味着之前通过 style 属性设置的属性都会丢失，比如一个元素通过 style 属性设置了边框，而赋给 cssText 属性的值不包含边框，则元素的边框会消失。下面的例子演示了 cssText 的使用：

```javascript
myDiv.style.cssText = "width: 25px; height: 100px; background-color: green;";
console.log(myDiv.style.cssText);
```

设置 cssText 是一次性修改元素多个样式最快捷的方式，因为所有变化会同时生效。

length 属性是跟 item() 方法一起配套迭代 CSS 属性用的。此时，style 对象实际上变成了一个集合，也可以用中括号代替 item() 取得相应位置的 CSS 属性名，如下所示：

```javascript
for (let i = 0, len = myDiv.style.length; i < len; i++) {
    console.log(myDiv.style[i]); // 或者用 myDiv.style.item(i)
}
```

使用中括号或者 item() 都可以取得相应位置的 CSS 属性名（"background-color"，不是 "backgroundColor"）。这个属性名可以传给 getPropertyValue() 以取得属性的值，如下面的例子所示：

```javascript
let prop, value, i, len;
for (i = 0, len = myDiv.style.length; i < len; i++) {
    prop = myDiv.style[i]; // 或者用 myDiv.style.item(i)
    value = myDiv.style.getPropertyValue(prop);
    console.log(`prop:: ${value}`);
}
```

getPropertyValue() 方法返回 CSS 属性值的字符串表示。如果需要更多信息，则可以通过 getPropertyCSSValue() 获取 CSSValue 对象。这个对象有两个属性：cssText 和 cssValueType。前者的值与 getPropertyValue() 方法返回的值一样。后者是一个数值常量，表示当前值的类型（0 代表继承的值，1 代表原始值，2 代表列表，3 代表自定义值）。下面的代码演示了如何输出 CSS 属性值和值类型：

```javascript
let prop, value, i, len;
for (i = 0, len = myDiv.style.length; i < len; i++) {
    prop = myDiv.style[i]; // alternately, myDiv.style.item(i)
    value = myDiv.style.getPropertyCSSValue(prop);
    console.log(`prop: ${value.cssText} (${value.cssValueType})`);
}
```

removeProperty() 方法用于从元素样式中删除指定的 CSS 属性。使用这个方法删除属性意味着会应用该属性的默认（从其他样式表层叠继承的）样式。例如，可以像下面这样删除 style 属性中设置的 border 样式：

```javascript
myDiv.style.removeProperty("border");
```

在不确定给定 CSS 属性的默认值是什么的时候，可以使用这个方法。只要从 style 属性中删除，就可以使用默认值。

### 2. 计算样式

#### document.defaultView.getComputedStyle()

style 对象中包含支持 style 属性的元素为这个属性设置的样式信息，但不包含从其他样式表层叠继承的同样影响该元素的样式信息。DOM2 Style 在 document.defaultView 上增加了 getComputedStyle() 方法。这个方法接收两个参数：要取得计算样式的元素和伪元素字符串（如 ":after"）。如果不需要查询伪元素，则第二个参数可以传 null。getComputedStyle() 方法返回一个 CSSStyleDeclaration 对象（与 style 属性的类型一样），包含元素的计算样式。假设有如下 HTML 页面：

```html
<!DOCTYPE html>
<html>
<head>
    <title>Computed Styles Example</title>
    <style type="text/css">
        #myDiv {
            background-color: blue;
            width: 100px;
            height: 200px;
        }
    </style>
</head>
<body>
    <div id="myDiv" style="background-color: red; border: 1px solid black;">4</div>
</body>
</html>
```

这里的 `<div>` 元素从文档样式表（`<style>` 元素）和自己的 style 属性获取了样式。此时，这个元素的 style 对象中包含 backgroundColor 和 border 属性，但不包含（通过样式表规则应用的）width 和 height 属性。下面的代码从这个元素获取了计算样式：

```javascript
let myDiv = document.getElementById("myDiv");
let computedStyle = document.defaultView.getComputedStyle(myDiv, null);

console.log(computedStyle.backgroundColor); // "red"
console.log(computedStyle.width); // "100px"
console.log(computedStyle.height); // "200px"
console.log(computedStyle.border); // "1px solid black"（在某些浏览器中）
```

在取得这个元素的计算样式时，得到的背景颜色是 "red"，宽度为 "100px"，高度为 "200px"。背景颜色不是 "blue"，因为元素样式覆盖了它。border 属性不一定返回样式表中实际的 border 规则。这种不一致性是因浏览器解释简写样式的方式造成的，比如 border 实际上会设置一组别的属性。在设置 border 时，实际上设置的是 4 条边的线条宽度、颜色和样式（border-left-width、border-top-color、border-bottom-style 等）。因此，即使 computedStyle.border 在所有浏览器中都不会返回值，computedStyle.borderLeftWidth 也一定会返回值。

关于计算样式要记住一点，即在所有浏览器中计算样式都是只读的，不能修改 getComputedStyle() 方法返回的对象。而且，计算样式还包含浏览器内部样式表中的信息。因此有默认值的 CSS 属性会出现在计算样式里。例如，visibility 属性在所有浏览器中都有默认值，但这个值因实现而不同。有些浏览器会把 visibility 的默认值设置为 "visible"，而另一些将其设置为 "inherit"。不能假设 CSS 属性的默认值在所有浏览器中都一样。如果需要元素具有特定的默认值，那么一定要在样式表中手动指定。

## 2. 操作样式表

### document.styleSheets

### sheet.cssRules

### sheet.rules

### sheet.insertRule()

### sheet.deleteRule()

CSSStyleSheet 类型表示 CSS 样式表，包括使用 `<link>` 元素和通过 `<style>` 元素定义的样式表。注意，这两个元素本身分别是 HTMLLinkElement 和 HTMLStyleElement。CSSStyleSheet 类型是一个通用样式表类型，可以表示以任何方式在 HTML 中定义的样式表。另外，元素特定的类型允许修改 HTML 属性，而 CSSStyleSheet 类型的实例则是一个只读对象（只有一个属性例外）。

CSSStyleSheet 类型继承 StyleSheet，后者可用作非 CSS 样式表的基类。以下是 CSSStyleSheet 从 StyleSheet 继承的属性。

* disabled，布尔值，表示样式表是否被禁用了（这个属性是可读写的，因此将它设置为 true 会禁用样式表）。
* href，如果使用 `<link>` 包含的样式表，则返回样式表的 URL，否则返回 null。
* media，样式表支持的媒体类型集合，这个集合有一个 length 属性和一个 item() 方法，跟所有 DOM 集合一样，也可以使用中括号访问集合中特性的项。如果样式表可用于所有媒体，则返回空列表。
* ownerNode，指向拥有当前样式表的节点，要么是 `<link>` 元素要么是 `<style>` 元素。如果当前样式表是通过 `@import` 被包含在另一个样式表中，则这个属性值为 null。
* parentStyleSheet，如果当前样式表是通过 `@import` 被包含在另一个样式表中，则这个属性指向导入它的样式表。
* title，ownerNode 的 title 属性。
* type，字符串，表示样式表的类型。对 CSS 样式表来说，就是 "text/css"。

上述属性里除了 disabled，其他属性都是只读的。除了上面继承的属性，CSSStyleSheet 类型还支持以下属性和方法。

* cssRules，当前样式表包含的样式规则的集合。
* ownerRule，如果样式表是使用 `@import` 导入的，则指向导入规则，否则为 null。
* deleteRule(index)，在指定位置删除 cssRules 中插入规则。
* insertRule(rule, index)，在指定位置向 cssRules 中插入规则。

document.styleSheets 包含文档中可用的样式表集合。这个集合的 length 属性保存着文档中样式表的数量，而每个样式都可以使用中括号或 item() 方法获取。来看下面的例子：

```javascript
let sheet = null;
for (let i = 0, len = document.styleSheets.length; i < len; i++) {
    sheet = document.styleSheets[i];
    console.log(sheet.href);
}
```

以上代码输出了文档中每个样式表的 href 属性（`<style>` 元素没有这个属性）。

document.styleSheets 返回的样式表可能会因浏览器而异。所有浏览器都会包含 `<style>` 元素和 rel 属性设置为 "stylesheet" 的 `<link>` 元素。

通过 `<link>` 或 `<style>` 元素也可以直接获取 CSSStyleSheet 对象。DOM 在这两个元素上暴露了 sheet 属性，其中包含对应的 CSSStyleSheet 对象。

### 1. CSS 规则

CSSRule 类型表示样式表中的一条规则。这个类型也是一个通用基类，很多类型继承它，但其中最常用的是表示样式信息的 CSSStyleRule（其他 CSS 规则还有 @import、@font-face、@page 和 @chartset 等，不过这些规则很少需要使用脚本来操作）。以下是 CSSStyleRule 对象上可用的属性。

* cssText，返回整条规则的文本。这里的文本可能与样式表中实际的文本不一样，因为浏览器内部处理样式表的方式也不一样。
* parentRule，如果这条规则被其他规则（如 @media）包含，则指向包含规则，否则就是 null。
* parentStyleSheet，包含当前规则的样式表。
* selectorText，返回规则的选择符文本。这里的文本可能与样式表中实际的文本不一样，因为浏览器内部处理样式表的方式也不一样。
* style，返回 CSSStyleDeclaration 对象，可以设置和获取当前规则中的样式。
* type，数值常量，表示规则类型。对于样式规则，它始终为 1。

在这些属性中，使用最多的是 cssText、selectorText 和 style。cssText 属性与 style.cssText 类似，不过并不完全一样。前者包含选择符文本和环绕样式声明的大括号，而后者只包含样式声明（类似于元素上的 style.cssText）。此外，cssText 是只读的，而 style.cssText 可以被重写。

多数情况下，使用 style 属性就可以实现操作样式规则的任务。这个对象可以像每个元素上的 style 对象一样，用来读取或修改规则的样式。比如下面这条 CSS 规则：

```javascript
div.box {
    background-color: blue;
    width: 100px;
    height: 200px;
}
```

假设这条规则位于页面中的第一个样式表中，而且是该样式表中唯一一条 CSS 规则，则下列代码可以获取它的所有信息：

```javascript
let sheet = document.styleSheets[0];
let rules = sheet.cssRules || sheet.rules; // 取得规则集合
let rule = rules[0]; // 取得第一条规则
console.log(rule.selectorText); // "div.box"
console.log(rule.style.cssText); // 完整的 CSS 代码
console.log(rule.style.backgroundColor); // "blue"
console.log(rule.style.width); // "100px"
console.log(rule.style.height); // "200px"
```

使用这些接口，可以像确定元素 style 对象中包含的样式一样，确定一条样式规则的样式信息。与元素的场景一样，也可以修改规则中的样式，如下所示：

```javascript
let sheet = document.styleSheets[0];
let rules = sheet.cssRules || sheet.rules; // 取得规则集合
let rule = rules[0]; // 取得第一条规则
rule.style.backgroundColor = "red"
```

注意，这样修改规则会影响页面中所有应用了该规则的元素。如果页面上有两个 `<div>` 元素有 "box" 类，则这两个元素都会受到这个修改的影响。

### 2. 创建规则

#### sheet.insertRule()

DOM 规定，可以使用 insertRule() 方法向样式表中添加新规则。这个方法接收两个参数：规则的文本和表示插入位置的索引值。下面是一个例子：

```javascript
sheet.insertRule("body { background-color: silver }", 0); // 使用 DOM 方法
```

这个例子插入了一条改变文档背景颜色的规则。这条规则是作为样式表的第一条规则（位置 0）插入的，顺序对规则层叠式很重要的。

虽然可以这样添加规则，但随着要维护的规则增多，很快就会变得非常麻烦。这时候，更好的方式是使用第 13 章介绍的动态样式加载技术。

### 3. 删除规则

#### sheet.deleteRule()

支持从样式表中删除规则的 DOM 方法是 deleteRule()，它接收一个参数：要删除规则的索引。要删除的样式表中的第一条规则，可以这样做：

```javascript
sheet.deleteRule(0); // 使用 DOM 方法
```

与添加规则一样，删除规则并不是 Web 开发中常见的做法。删除规则时要慎重。

## 3. 元素尺寸

### offsetWidth

### offsetHeight

### offsetLeft

### offsetTop

### clientWidth

### clientHeight

### scrollWidth

### scrollHeight

### scrollLeft

### scrollTop

### getBoundingClientRect()

本节介绍的属性和方法并不是 DOM2 Style 规范中定义的，但与 HTML 元素的样式有关。DOM 一直缺乏页面中元素实际尺寸的规定。

### 1. 偏移尺寸

第一组属性涉及偏移尺寸（offset dimensions），包含元素在屏幕上占用的所有视觉空间。元素在页面上的视觉空间由其高度和宽度决定，包括所有内边距、滚动条和边框（但不包含外边距）。以下 4 个属性用于取得元素的偏移尺寸。

* offsetHeight，元素的垂直方向上占用的像素尺寸，包括它的高度、水平滚动条高度（如果可见）和上、下边框的高度。
* offsetLeft，元素左边框外侧距离包含元素左边框内侧的像素数
* offsetTop，元素上边框外侧距离包含元素上边框内侧的像素数
* offsetWidth，元素在水平方向上占用的像素尺寸，包括它的宽度、垂直滚动条宽度（如果可见）和左、右边框的宽度

其中，offsetLeft 和 offsetTop 是相对于包含元素的，包含元素保存在 offsetParent 属性中。offsetParent 不一定是 parentNode。比如，`<td>` 元素的 offsetParent 是作为其祖先的 `<table>` 元素，因为 `<table>` 是节点层级中第一个提供尺寸的元素。下图展示了这些属性代表的不同尺寸。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E5%81%8F%E7%A7%BB%E5%B0%BA%E5%AF%B8.png)

要确定一个元素在页面中的偏移量，可以把它的 offsetLeft 和 offsetTop 属性分别与 offsetParent 的相同属性相加，一直加到根元素。下面是一个例子：

```javascript
function getElementLeft(element) {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent;
    
    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    
    return actualLeft;
}

function getElementTop(element) {
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    
    while (current !== null) {
        actualTop += currrent.offsetTop;
        current = current.offsetParent;
    }
    
    return actualTop;
}
```

这两个函数使用 offsetParent 在 DOM 树中逐级上溯，将每一级的偏移属性相加，最终得到元素的实际偏移量。对于使用 CSS 布局的简单页面，这两个函数是很精确的。而对于使用表格和内嵌窗格的页面布局，它们返回的值会因浏览器不同而有所差异，因为浏览器实现这些元素的方式不同。一般来说，包含在 `<div>` 元素中所有元素都以 `<body>` 为其 offsetParent，因此 getElementleft() 和 getElementTop() 返回的值与 offsetLeft 和 offsetTop 返回的值相同。

>注意
>
>所有这些偏移尺寸属性都是只读的，每次访问都会重新计算。因此，应该尽量减少对它们的查询次数。比如把查询的值保存在局部变量中，就可以避免影响性能。

### 2. 客户端尺寸

元素的客户端尺寸（client dimensions）包含元素内容及其内边距所占用的空间。客户端尺寸只有两个相关属性：clientWidth 和 clientHeight。clientWidth 是内容区宽度加左、右内边距宽度，clientHeight 是内容区高度加上、下内边距高度。下图形象地展示了这两个属性。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%B0%BA%E5%AF%B8.png)

客户端尺寸实际上就是元素内部的空间，因此不包含滚动条占用的空间。这两个属性最常用于确定浏览器视口尺寸，即检测 document.documentElement 的 clientWidth 和 clientHeight。这两个属性表示视口（`<html>` 或 `<body>` 元素）的尺寸。

>注意
>
>与偏移尺寸一样，客户端尺寸也是只读的，而且每次访问都会重新计算。

### 3. 滚动尺寸

最后一组尺寸是滚动尺寸（scroll dimensions），提供了元素内容滚动距离的信息。有些元素，比如 `<html>` 无须任何代码就可以自动滚动，而其他元素需要使用 CSS 的 overflow 属性令其滚动。滚动尺寸相关的属性有如下 4 个。

* scrollHeight，没有滚动条出现时，元素内容的总高度
* scrollLeft，内容区左侧隐藏的像素数，设置这个属性可以改变元素的滚动位置
* scrollTop，内容区顶部隐藏的像素数，设置这个属性可以改变元素的滚动位置
* scrollWidth，没有滚动条出现时，元素内容的总宽度

下图展示了这些属性的含义。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E6%BB%9A%E5%8A%A8%E5%B0%BA%E5%AF%B8.png)

scrollWidth 和 scrollHeight 可以用来确定给定元素内容的实际尺寸。例如，`<html>` 元素是浏览器中滚动视口的元素。因此，document.documentElement.scrollHeight 就是整个页面垂直方向的总高度。

scrollLeft 和 scrollTop 属性可以用于确定当前元素滚动的位置，或者用于设置它们的滚动位置。元素在未滚动时，这两个属性都等于 0。如果元素在垂直方向上滚动，则 scrollTop 会大于 0，表示元素顶部不可见区域的高度。如果元素在水平方向上滚动，则 scrollLeft 会大于 0，表示元素左侧不可见区域的宽度。因为这两个属性也是可写的，所以把它们都设置为 0 就可以重置元素的滚动位置。下面这个函数检测元素是不是位于顶部，如果不是则把它滚动回顶部：

```javascript
function scrollToTop(element) {
    if (element.scrollTop != 0) {
        element.scrollTop = 0;
    }
}
```

这个函数使用 scrollTop 获取并设置值。

### 4. 确定元素尺寸

浏览器在每个元素上都暴露了 getBoundingClientRect() 方法，返回一个 DOMRect 对象，包含 6 个属性：left、top、right、bottom、height 和 width。这些属性给出了元素在页面中相对于视口的位置。下图展示了这些属性的含义。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/DOMRect%20%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7.png)

# 2. 遍历

DOM2 Traversal and Range 模块定义了两个类型用于辅助顺序遍历 DOM 结构。这两个类型 NodeIterator 和 TreeWalker，从某个起点开始执行对 DOM 结构的深度优先遍历。

如前所述，DOM 遍历是对 DOM 结构的深度优先遍历，至少允许朝两个方向移动（取决于类型）。遍历以特定节点为根，不能在 DOM 中向上超越这个根节点。来看下面的 HTML：

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Example</title>
    </head>
    <body>
    	<p><b>Hello</b> world!</p>
    </body>
</html>
```

这段代码构成的 DOM 树如下图所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/DOM%20%E6%A0%91%E7%9A%84%E5%8F%AF%E8%A7%86%E5%8C%96%E8%A1%A8%E7%A4%BA.png)

其中的任何节点都可以成为遍历的根节点。比如，假设以 `<body>` 元素作为遍历的根节点，那么接下来是 `<p>` 元素、`<b>` 元素和两个文本节点（都是 `<body>` 元素的后代）。但这个遍历不会到达 `<html>` 元素、`<head>` 元素，或者其他不属于 `<body>` 元素子树的元素。而以 document 为根节点的遍历，则可以访问到文档中的所有节点。下图展示了以 document 为根节点的深度优先遍历。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E6%B7%B1%E5%BA%A6%E4%BC%98%E5%85%88%E9%81%8D%E5%8E%86%E7%9A%84%E9%A1%BA%E5%BA%8F.png)

从 document 开始，然后循序移动，第一个节点是 document，最后一个节点是包含 "world!" 的文本节点。到达文档末尾最后那个文本节点后，遍历会在 DOM 树中反向回溯。此时，第一个访问的节点就是包含 "world!" 的文本节点，而最后一个是 document 节点本身。NodeIterator 和 TreeWalker 都以这种方式进行遍历。

## 1. NodeIterator

NodeIterator 是上述两个类型中比较简单的，可以通过 document.createNodeIterator() 方法创建其实例。这个方法接收以下 4 个参数。

* root，作为遍历根节点的节点
* whatToShow，数值代码，表示应该访问哪些节点
* filter，NodeFilter 对象或函数，表示应该访问哪些节点
* entityReferenceExpansion，布尔值，表示是否扩展实体引用。这个参数在 HTML 文档中没有效果，因为实体引用永远不扩展

whatToShow 参数是一个位掩码，通过应用一个或多个过滤器来指定访问哪些节点。这个参数对应的常量是在 NodeFilter 类型中定义的。

* NodeFilter.SHOW_ALL，所有节点
* NodeFilter.SHOW_ELEMENT，元素节点
* NodeFilter.SHOW_ATTRIBUTE，属性节点。由于 DOM 结构，因此实际上用不上
* NodeFilter.SHOW_TEXT，文本节点
* NodeFilter.SHOW_CDATA_SECTION，CDATA 区块节点。不是在 HTML 页面中使用的。
* NodeFilter.SHOW_ENTITY_REFERENCE，实体引用节点。不是在 HTML 页面中使用的。
* NodeFilter.SHOW_ENTITY，实体节点。不是在 HTML 页面中使用的。
* NodeFilter.SHOW_PROCESSING_INSTRUCTION，处理指令节点。不是在 HTML 页面中使用的。
* NodeFilter.SHOW_COMMENT，注释节点。
* NodeFilter.SHOW_DOCUMENT，文档节点。
* NodeFilter.SHOW_DOCUMENT_TYPE，文档类型节点。
* NodeFilter.SHOW_DOCUMENT_FRAGMENT，文档片段节点。不是在 HTML 页面中使用的。
* NodeFilter.SHOW_NOTATION，记号节点。不是在 HTML 页面中使用的。

这些值除了 NodeFilter.SHOW_ALL 之外都可以组合使用。比如，可以像下面这样使用按位或操作组合多个选项：

```javascript
let whatToShow = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;
```

createNodeIterator() 方法的 filter 参数可以用来指定自定义 NodeFilter 对象，或者一个作为节点过滤器的函数。NodeFilter 对象只有一个方法 acceptNode()，如果给定节点应该访问就返回 NodeFilter.FILTER_ACCEPT，否则返回 NodeFilter.FILTER_SKIP。因为 NodeFilter 是一个抽象类型，所以不可能创建它的实例。只要创建一个包含 acceptNode() 的对象，然后把它传给 createNodeIterator() 就可以了。以下代码定义了只接收 `<p>` 元素的节点过滤器对象：

```javascript
let filter = {
    acceptNode(node) {
        return node.tagName.toLowerCase() == "p" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
};

let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, filter, false);
```

filter 参数还可以是一个函数，与 acceptNode() 的形式一样，如下面的例子所示：

```javascript
let filter = function(node) {
    return node.tagName.toLowerCase() == "p" ? NodeFilter.FILTER_ACCEPT: NodeFilter.FILTER_SKIP;
};

let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, filter, false);
```

通常在 JavaScript 中会使用这种形式，因为更简单也更像普通 JavaScript 代码。如果不需要指定过滤器，则可以给这个参数传入 null。

要创建一个简单的遍历所有节点的 NodeIterator，可以使用以下代码：

```javascript
let iterator = document.createNodeIterator(document, NodeFilter.SHOW_ALL, null, false);
```

NodeIterator 的两个主要方法是 nextNode() 和 previousNode()。nextNode() 方法在 DOM 子树中以深度优先方式前进一步，而 previousNode() 则是在遍历后退一步。创建 NodeIterator 对象的时候，会有一个内部指针指定根节点，因此第一次调用 nextNode() 返回的是根节点。当遍历到达 DOM 树最后一个节点时，nextNode() 返回 null。previousNode() 方法也是类似的。当遍历到达 DOM 树最后一个节点时，调用 previousNode() 返回遍历的根节点后，再次调用也会返回 null。

以下面的 HTML 片段为例：

```html
<div id="div1">
    <p><b>Hello</b> world!</p>
    <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
    </ul>
</div>
```

假设想要遍历 `<div>` 元素内部的所有元素，那么可以使用如下代码：

```javascript
let div = document.getElementById("div1");
let iterator = document.createNodeIterator(div, NodeFilter.SHOW_ELEMENT, null, false);

let node = iterator.nextNode();
while (node !== null) {
    console.log(node.tagName); // 输出标签名
    node = iterator.nextNode();
}
```

这个例子中第一次调用 nextNode() 返回 `<div>` 元素。因为 nextNode() 在遍历到达 DOM 子树末尾时返回 null，所以这里通过 while 循环检测每次调用 nextNode() 的返回值是不是 null。以上代码执行后会输出以下标签名：

DIV

P

B

UL

LI

LI

LI

如果只想遍历 `<li>` 元素，可以传入一个过滤器，比如：

```javascript
let div = document.getElementById("div1");
let filter = function(node) {
    return node.tagName.toLowerCase() == "li" ? NodeFilter.FILTER_ACCEPT: NodeFilter.FILTER_SKIP;
};

let iterator = document.createNodeIterator(div, NodeFilter.SHOW_ELEMENT, filter, false);

let node = iterator.nextNode();
while (node !== null) {
    console.log(node.tagName); // 输出标签名
    node = iterator.nextNode();
}
```

在这个例子中，遍历只会输出 `<li>` 元素的标签。

nextNode() 和 previousNode() 方法使用 NodeIterator 对 DOM 结构的内部指针，因此修改 DOM 结构也会体现在遍历中。

## 2. TreeWalker

TreeWalker 是 NodeIterator 的高级版。除了包含同样的 nextNode()、previousNode() 方法，TreeWalker 还添加了如下在 DOM 结构中向不同方向遍历的方法。

* parentNode()，遍历到当前节点的父节点
* firstChild()，遍历到当前节点的第一个子节点
* lastChild()，遍历到当前节点的最后一个子节点
* nextSibling()，遍历到当前节点的下一个同胞节点
* previousSibling()：遍历到当前节点的上一个同胞节点

TreeWalker 对象要调用 document.createTreeWalker() 方法来创建，这个方法接收与 document.createNodeIterator() 同样的参数：作为遍历起点的根节点、要查看的节点类型、节点过滤器和一个表示是否扩展实体引用的布尔值。因为两者很类似，所以 TreeWalker 通常可以取代 NodeIterator，比如：

```javascript
let div = document.getElementById("div1");
let filter = function(node) {
    return node.tagName.toLowerCase() == "li" ? NodeFilter.FILTER_ACCEPR : NodeFilter.FILTER_SKIP;
};

let walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, filter, false);

let node = iterator.nextNode();
while (node !== null) {
    console.log(node.tagName); // 输出标签名
    node = iterator.nextNode();
}
```

不同的是，节点过滤器（filter）除了可以返回 NodeFilter.FILTER_ACCEPT 和 NodeFilter.FILTER_SKIP，还可以返回 NodeFilter.FILTER_REJECT。在使用 NodeIterator 时，NodeFilter.FILTER_SKIP 和 NodeFilter.FILTER_REJECT 是一样的。但在使用 TreeWalker 时，NodeFilter.FILTER_SKIP 表示跳过节点，访问子树中的下一个节点，而 NodeFilter.FILTER_REJECT 则表示跳过该节点以及该节点的整个子树。如果把前面示例中的过滤器函数改为返回 NodeFilter.FILTER_REJECT（而不是 NodeFilter.FILTER_SKIP），则会导致遍历立即返回，不会访问任何节点。这是因为第一个返回的元素是 `<div>`，其中标签名不是 "li"，因此过滤函数返回 NodeFilter.FILTER_REJECT，表示要跳过整个子树。因为 `<div>` 本身就是遍历的根节点，所以遍历会就此结束。

当然，TreeWalker 真正的威力是可以在 DOM 结构中四处游走。如果不使用过滤器，单纯使用 TreeWalker 的漫游能力同样可以在 DOM 子树中访问 `<li>` 元素，比如：

```javascript
let div = document.getElementById("div1");
let walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null, false);

walker.firstChild(); // 前往第一个 <li>
while (node !== null) {
    console.log(node.tagName);
    node = walker.nextSibling();
}
```

因为我们知道 `<li>` 元素在文档结构中的位置，所以可以直接定位过去。先使用 firstChild() 前往 `<p>` 元素，再通过 nextSibling() 前往 `<ul>` 元素，然后使用哦个 firstChild() 到达第一个 `<li>` 元素。注意，此时的 TreeWalker 只返回元素（这时因为传给 createTreeWalker() 的第二个参数）。最后就可以使用 nextSibling() 访问每个 `<li>` 元素，直到再也没有元素，此时方法返回 null。

TreeWalker 类型也有一个名为 currentNode 的属性，表示遍历过程中上一次返回的节点（无论使用的是哪个遍历方法）。可以通过修改这个属性来影响接下来遍历的起点，如下面的例子所示：

```javascript
let node = walker.nextNode();
console.log(node === walker.currentNode); // true
walker.currentNode = document.body; // 修改起点
```

相比于 NodeIterator，TreeWalker 类型为遍历 DOM 提供了更大的灵活性。

# 3. 范围

为了支持对页面更细致的控制，DOM2 Traversal and Range 模块定义了范围接口。范围可用于在文档中选择内容，而不用考虑节点之间的界限。（选择在后台发生，用户是看不到的）。范围在常规 DOM 操作的粒度不够时可以发挥作用。

## 1. DOM 范围

DOM2 在 Document 类型上定义了一个 createRange() 方法，暴露在 document 对象上。使用这个方法可以创建一个 DOM 范围对象，如下所示：

```javascript
let range = document.createRange();
```

与节点类似，这个新创建的范围对象是与创建它的文档关联的，不能再其他文档中使用。然后可以使用这个范围在后台选择文档特定的部分。创建范围并指定它的位置之后，可以对范围的内容执行一些操作，从而实现对底层 DOM 树更精细的控制。

每个范围都是 Range 类型的实例，拥有相应的属性和方法。下面的属性提供了与范围在文档位置相关的信息。

* startContainer，范围起点所在的节点（选区中第一个子节点的父节点）
* startOffset，范围起点在 startContainer 中的偏移量。如果 startContainer 是文本节点、注释节点或 CDATA 区块节点吗，则 startOffset 指范围起点之间跳过的字符数，否则，表示范围中第一个节点的索引。
* endContainer，范围终点所在的节点（选区中最后一个子节点的父节点）
* endOffset，范围起点在 startContainer 中的偏移量（与 startOffset 中偏移量的含义相同）
* commonAncestoryContainer，文档中以 startContainer 和 endContainer 为后代的最深的节点。

这些属性会在范围被放到文档中特定位置时获得相应的值。

## 2. 简单选择

通过范围选择文档中某个部分最简单的方式，就是使用 selectNode() 或 selectNodeContents() 方法。这两个方法都接收一个节点作为参数，并将该节点的信息添加到调用它的范围。selectNode() 方法选择整个节点，包括其后代节点，而 selectNodeContents() 只选择节点的后代。假设有如下 HTML：

```html
<!DOCTYPE html>
<html>
    <body>
        <p id="p1"><b>Hello</b> world!</p>
    </body>
</html>
```

以下 JavaScript 代码可以访问并创建相应的范围：

```javascript
let range1 = document.createRange(),
    range2 = document.createRange(),
    p1 = document.getElementById("p1");
range1.selectNode(p1);
range2.selectNodeContents(p1);
```

例子中的这两个范围包含文档的不同部分。range1 包含 `<p>` 元素及其所有后代，而 range2 包含 `<b>` 元素、文本节点 "Hello" 和文本节点 " world!"，如下图所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E4%B8%A4%E4%B8%AA%E4%B8%8D%E5%90%8C%E8%8C%83%E5%9B%B4%E7%9A%84%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

调用 selectNode() 时，startContainer、endContainer 和 commonAncestorContainer 都等于传入节点的父节点。在这个例子中，这几个属性都等于 document.body。startOffset 属性等于传入节点在其父节点 childNodes 集合中的索引（在这个例子中，startOffset 等于 1，因为 DOM 的合规实现把空格当成文本节点），而 endOffset 等于 startOffset 加 1（因为只选择了一个节点）。

在调用 selectNodeContents() 时，startContainer、endContainer 和 commonAncestorContainer 属性就是传入的节点，在这个例子中是 `<p>` 元素。startOffset 属性始终为 0，因为范围从传入节点的第一个子节点开始，而 endOffset 等于传入节点的子节点数量（node.childNodes.length），在这个例子中等于 2。

在像上面这样选定节点或节点后代之后，还可以在范围上调用相应的方法，实现对范围中选区的更精细控制。

* setStartBefore(refNode)，把范围的起点设置到 refNode 之前，从而让 refNode 成为选区的第一个子节点。startContainer 属性被设置为 refNode.parentNode，而 startOffset 属性被设置为 refNode 在其父节点 childNodes 集合中的索引。
* setStartAfter(refNode)，把范围的起点设置到 refNode 之后，从而将 refNode 排除在选区之外，让其下一个同胞节点成为选区的第一个子节点。startContainer 属性被设置为 refNode.parentNode，startOffset 属性被设置为 refNode 在其父节点 childNodes 集合中的索引加 1。
* setEndBefore(refNode)，把范围的终点设置到 refNode 之前，从而将 refNode 排除在选区之外、让其上一个同胞节点成为选区的最后一个子节点。endContainer 属性被设置为 refNode.parentNode，endOffset 属性被设置为 refNode 在其父节点 childNodes 集合中的索引。
* setEndAfter(refNode)，把范围内的终点设置到 refNode 之后，从而让 refNode 成为选区的最后一个子节点。endContainer 属性被设置为 refNode.parentNode，endOffset 属性被设置为 refNode 在其父节点 childNodes 集合中的索引加 1。

调用这些方法时，所有属性都会自动重新赋值。不过，为了实现更复杂的选区，也可以直接修改这些属性的值。

## 3. 复杂选择

要创建复杂的范围，需要使用 setStart() 和 setEnd() 方法。这两个方法都接收两个参数：参照节点和偏移量。对 setStart() 来说，参照节点会成为 startContainer，而偏移量会赋值给 startOffset。对 setEnd() 而言，参照节点会成为 endContainer，而偏移量会赋值给 endOffset。

使用这两个方法，可以模拟 selectNode() 和 selectNodeContents() 的行为。比如：

```javascript
let range1 = document.createRange(),
    range2 = document.createRange(),
    p1 = document.getElementById("p1"),
    p1Index = -1,
    i,
    len;
for (i = 0, len = p1.parentNode.childNodes.length; i < len; i++) {
    if (p1.parentNode.childNodes[i] === p1) {
        p1Index = i;
        break;
    }
}
range1.setStart(p1.parentNode, p1Index);
range1.setEnd(p1.parentNode, p1Index + 1);
range2.setStart(p1, 0);
range2.setEnd(p1, p1.childNodes.length);
```

注意，要选择节点（使用 range1），必须先确定给定节点（p1）在其父节点 childNodes 集合中的索引。而要选择节点的内容（使用 range2），则不需要这样计算，因为可以直接给 setStart() 和 setEnd() 传默认值。虽然可以模拟 selectNode() 和 selectNodeContents()，但 setStart() 和 setEnd() 真正的威力还是选择节点中的某个部分。

假设我们想通过范围从前面示例中选择从 "Hello" 中的 "llo" 到 " world!" 中的 "o" 的部分。很简单，第一步是取得所有相关节点的引用，如下面的代码所示：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.lastChild
```

文本 "Hello" 其实是 `<p>` 的孙子节点，因为它是 `<b>` 的子节点。为此可以使用 p1.firstChild 取得 `<b>`，而使用 p1.firstChild.firstChild 取得 "Hello" 这个文本节点。文本节点 " world!" 是 `<p>` 的第二个（也是最后一个）子节点，因此可以使用 p1.lastChild 来取得它。然后，再创建范围，指定其边界，如下所示：

```javascript
let range = document.createRange();
range.setStart(helloNode, 2);
range.setEnd(worldNode, 3);
```

因为选区起点在 "Hello" 中的字母 "e" 之后，所以要给 setStart() 传入 helloNode 和偏移量 2（"e" 后面的位置，"H" 的位置是 0）。要设置选区终点，则要给 setEnd() 传入 worldNode 和偏移量 3，即不属于选区的i的一个字符的位置，也就是 "r" 的位置 3（位置 0 是一个空格）。下图展示了范围对应的选区。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E8%8C%83%E5%9B%B4%E5%AD%97%E7%AC%A6%E9%80%89%E6%8B%A9%E7%9A%84%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

因为 helloNode 和 worldNode 是文本节点，所以它们会成为范围的 startContainer 和 endContainer，这样 startOffset 和 endOffset 实际上表示每个节点中文本字符的位置，而不是子节点的位置（传入元素节点时的情形）。而 commonAncestorContainer 是 `<p>` 元素，即包含这两个节点的第一个祖先节点。

当然，只选择文档中的某个部分并不是特别有用，除非可以对选中部分执行操作。

## 4. 操作范围

创建范围之后，浏览器会在内部创建一个文档片段节点，用于包含范围选区中的节点。为操作范围的内容，选区中的内容必须格式完好。在前面的例子中，因为范围的起点和终点都在文本节点内部，并不是完好的 DOM 结构，所以无法在 DOM 中表示。不过，范围能够确定缺失的开始和结束标签，从而可以重构出有效的 DOM 结构，以便后续操作。

仍以前面的例子中的范围来说，范围发现选区中缺少一个开始的 `<b>` 标签，于是会在后台动态补上这个标签，同时还需要补上封闭 "He" 的结束表标签 `</b>`，结果会把 DOM 修改为这样：

```html
<p><b>He</b><b>llo</b> world!</p>
```

而且，" world!" 文本节点会被拆分成两个文本节点，一个包含 " wo"，另一个包含 "rld!"。最终的 DOM 树和范围文档片段的比较如下图所示。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/DOM%20%E6%A0%91%E5%92%8C%E8%8C%83%E5%9B%B4%E6%96%87%E6%A1%A3%E7%89%87%E6%AE%B5%E7%9A%84%E6%AF%94%E8%BE%83.png)

这里创建了范围之后，就可以使用很多方法来操作范围的内容。（注意，范围对应文档片段中的所有节点，都是文档中相应节点的指针。）

第一个方法最容易理解和使用：deleteContents()。顾名思义，这个方法会从文档中删除范围包含的节点。下面是一个例子：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.firstChild,
    range = document.createRange();

range.setStart(helloNode, 2);
range.setEnd(worldNode. 3);

range.deleteContents();
```

执行上面的代码之后，页面中的 HTML 会变成这样：

```html
<p><b>He</b>rld!</p>
```

因为前面介绍的范围选择过程通过修改底层 DOM 结构保证了结构完好，所以即使删除范围之后，剩下的 DOM 结构照样是完好的。

另一个方法 extractContents() 跟 deleteContents() 类似，也会从文档冲移除范围选区。但不同的是，extractContents() 方法返回范围对应的文档片段。这样，就可以把范围选中的内容插入文本中其他地方。来看一个例子：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.lastChild,
    range = document.createRange();

range.setStart(helloNode, 2);
range.setEnd(worldNode, 3);
let fragment = range.extractContents();
p1.parentNode.appendChild(fragment);
```

这个例子提取了范围的文档片段，然后把它添加到文档 `<body>` 元素的最后。（别忘了，在把文档片段传给 appendChild() 时，只会添加片段的子树，不包含片段自身。）结果就会得到如下 HTML：

```html
<p><b>He</b>rld!</p>
<b>llo</b> wo
```

如果不想把范围从文档中移除，也可以使用 cloneContents() 创建一个副本，然后把这个副本插入到文档其他地方。比如：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.lastChild,
    range = document.createrRange();

range.setStart(helloNode, 2);
range.setEnd(worldNode, 3);

let fragment = range.cloneContents();
p1.parentNode.appendChild(fragment);
```

这个方法跟 extractContents() 很相似，因为它们都返回文档片段。主要区别是 cloneContents() 返回的文档片段包含范围中节点的副本，而非实际的节点。执行上面操作之后，HTML 页面会变成这样：

```html
<p><b>Hello</b> world!</p>
<b>llo</b> wo
```

此时关键是要知道，为保持结构完好而拆分节点的操作，只有在调用前述方法时才会发生。在 DOM 被修改之前，原始 HTML 会一直保持不变。

## 5. 范围插入

上一节介绍了移除和复制范围的内容，本节来看一看怎么向范围中插入内容。使用 insertNode() 方法可以在范围选区的开始位置插入一个节点。假设我们想在前面例子中的 HTML 中插入如下 HTML：

```html
<span style="color: red">Inserted text</span>
```

可以使用下列代码：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.lastChild,
    range = document.createRange();

range.setStart(helloNode, 2);
range.setEnd(worldNode, 3);

let span = document.createElement("span");
span.style.color = "red";
span.appendChild(document.createTextNode("Inserted text"));
range.insertNode(span);
```

运行上面的代码会得到如下 HTML 代码：

```html
<p id="p1"><b>He<span style="color: red">Inserted text</span>llo</b> world</p>
```

注意，`<span>` 正好插入到 "Hello" 中的 "llo" 之前，也就是范围选区的前面。同时，也要注意原始的 HTML 并没有添加或删除 `<b>` 元素，因为这里并没有使用之前提到的方法。使用这个技术可以插入有用的信息，比如咋打开新窗口的外部链接旁边插入一个小图标。

除了向范围中插入内容，还可以使用 surroundContents() 方法插入包含范围的内容。这个方法接收一个参数，即包含范围内容的节点。调用这个方法时，后台会执行如下操作：

1. 提取范围的内容
2. 在原始文档中范围之前所在的位置插入给定的节点
3. 将范围对应文档片段的内容添加到给定节点

这种功能适合在网页中高亮显示某些关键词，比如：

```javascript
let p1 = document.getElementById("p1"),
    helloNode = p1.firstChild.firstChild,
    worldNode = p1.lastChild,
    range = document.createRange();

range.selectNode(helloNode);
let span = document.createElement("span");
span.style.backgroundColor = "yellow";
range.surroundContents(span);
```

执行以上代码会以黄色背景高亮显示范围连接的文本。得到的 HTML 如下所示：

```html
<p><b><span style="background-color: yellow">Hello</span></b> world!</p>
```

为了插入 `<span>` 元素，范围中必须包含完整的 DOM 结构。如果范围中包含部分选择的非文节点，这个操作会失败并报错。另外，如果给定的节点是 Document、DocumentType 或 DocumenFragment 类型，也会导致错误。

## 6. 范围折叠

如果范围并没有选择文档的任何部分，则成为折叠（collapsed）。折叠范围有点类似文本框：如果文本框中有文本，那么可以用鼠标选中以高亮显示全部文本。这时候，如果再单击鼠标，则选区会被移除，光标会落在某两个字符中间。而在折叠范围时，位置会被设置为范围与文档交界的地方，可能是范围选区的开始处，也可能是结尾处。下图展示了范围折叠时会发生什么。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/%E8%8C%83%E5%9B%B4%E6%8A%98%E5%8F%A0%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

折叠范围可以使用 collapse() 方法，这个方法接收一个参数：布尔值，表示折叠到范围哪一端。true 表示折叠起点，false 表示折叠到终点。要确定范围是否已经被折叠，可以检测范围的 collapsed 属性：

```javascript
range.collapse(true); // 折叠到起点
console.log(range.collapsed); // 输出 true
```

测试范围是否被折叠，能够帮助确定范围中的两个节点是否相邻。例如有以下 HTML 代码：

```html
<p id="p1">Paragraph 1</p><p id="p2">Paragraph 2</p>
```

如果事先并不知道标记的结构（比如自动生成的标记），则可以像下面这样创建一个范围：

```javascript
let p1 = document.getElementById("p1"),
    p2 = document.getElementById("p2"),
    range = document.createRange();

range.setStartAfter(p1);
range.setStartBefore(p2);
console.log(range.collapsed); // true
```

在这种情况下，创建的范围是折叠的，因为 p1 后面和 p2 前面没有任何内容。

## 7. 范围比较

如果有多个范围，则可以使用 compareBoundPoints() 方法确定范围之间是否存在公共的边界（起点或终点）。这个方法接收两个参数：要比较的范围和一个常量值，表示比较的方式。这个常量参数包括：

* Range.START_TO_START（0），比较两个范围的起点
* Range.START_TO_END（1），比较第一个范围的起点和第二个范围的终点
* Range.END_TO_END（2），比较两个范围的终点
* Range.END_TO_START（3），比较第一个范围的终点和第二个范围的起点

compareBoundaryPoints() 方法在第一个范围的边界点位于第二个范围的边界点之间时返回 -1，在两个范围的边界点相等时返回 0，在第一个范围的边界点位于第二个范围的边界点之后时返回 1。来看下面的例子：

```javascript
let range1 = document.createRange();
let range2 = document.createRange();
let p1 = document.getElementById("p1");

range1.selectNodeContents(p1);
range2.selectNodeContens(p1);
range2.setEndBefore(p1.lastChild);

console.log(range1.compareBoundaryPoints(Range.START_TO_START, range2)); // 0
console.log(range1.compareBoundaryPoints(Range.END_TO_END, range2)); // 1
```

在这段代码中，两个范围的起点是相等的，因为它们都是 selectNodeContents() 默认返回的值。因此，比较二者起点的方法返回 0。不过，因为 range2 的终点被使用 setEndBefore() 修改了，所以 range1 的终点位于 range2 的终点之后（下图），结果这个方法返回了 1。

![](https://front-end-1257950569.cos.ap-guangzhou.myqcloud.com/JavaScript%20%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC5%E7%89%88%EF%BC%89/%E7%AC%AC14%E7%AB%A0%EF%BC%9ADOM%20%E6%89%A9%E5%B1%95/setEndBefore%28%29%20%E7%9A%84%E6%95%88%E6%9E%9C%E8%AF%B4%E6%98%8E.png)

## 8. 复制范围

调用范围的 cloneRange() 方法可以复制范围。这个方法会创建调用它的范围的副本：

```javascript
let newRange = range.cloneRange();
```

新范围包含与原始范围一样的属性，修改其边界点不会影响原始范围。

## 9. 清理

在使用完范围之后，最好调用 detach() 方法把范围从创建它的文档中剥离。调用 detach() 之后，就可以放心解除对范围的引用，以便垃圾回收程序释放它所占用的内存。下面是一个例子：

```javascript
range.detach(); // 从文档中剥离范围
range = null; // 解除引用
```

这两步是最合理的结束使用范围的方式。剥离之后的范围就不能再使用了。

# 4. Observer API

使用 Observer API 可以监听网页不同方面的变化，并针对这些变化执行相应的架设函数。现代浏览器支持的观察者（observer）API 主要有 Mutation Observer、Resize Observer 和 Intersection Observer。

* Mutation Observer API 是 DOM 标准定义的
* Resize Observer API 是 W3C Web 应用工作组再 Intersectionin Observer 规范中定义的
* Interseciton Observer API 是 W3C Web 应用工作组在 Inotersectionin Observer 规范中定义的

尽管这些 API 不是由同一份标准定义的，但它们整体上的使用方式差不太多。

## 1. Observer API 的方法

Observer API 的初始化和使用可以说是大同小异。为此，本节用一个虚拟的观察者类 FakeOvserver 作为例子，统一介绍这些 API 的共同之处。

### 1. 初始化

要创建一个观察者的实例，使用 new 来调用相应的构造函数。构造函数接收一个回调函数，这个回调函数在每次相关事件被观察到的时候执行。以 FakeObserver 为例：

```javascript
const fakeCallback = () => {};

const fakeObserver = new FakeObserver(fakeCallback);
```

这样就会创建一个虚拟观察者的实例，每当虚拟事件发生时应该执行作为回调的空箭头函数。但现在还不会执行回调函数，因为这个观察者还没有观察任何元素。接下来我们介绍如何观察元素。

### 2. 执行回调

每当观察者检测到被观察对象以某种方式发生变化时（ResizeObserver 检测缩放事件，IntersectionObserver 检测重叠事件），就会执行回调。

```javascript
let fakeCallback = (fakeEventContext, observer) => console.log("Fake event happened!");

let fakeObserver = new FakeObserver(fakeCallback);
```

在回调函数中，fakeEventContext 参数包含触发回调的事件信息。对有的 API 来说，这是一个具有不同属性以描述不同事件的对象。对另一些 API 来说，这可能是一个数组，包含一个或多个描述相关事件的条目。另外，回调也会接收一个观察者实例的引用作为第二个参数。

回调被执行的频率取决于 API。有的回调会在渲染过程中执行，而有的作为微任务异步执行。

### 3. observe() 方法

观察者实例必须与要观察的元素建立连接才能执行回调。建立连接要使用观察者的 observe() 方法。这个方法接收的参数因 API 而异，但都会接收要观察的元素/比如，下面的代码会让虚拟观察者观察文档主体上的虚拟事件：

```javascript
fakeObserver.observe(document.body);
```

要观察多个元素，可以多次调用 observe() 方法：

```javascript
for (const div of document.querySelectorAll("div")) {
    fakeObserver.observe(div);
}
```

在回调中，多个变化的元素在接收到的条目中是可以区分的。

>注意
>
>ResizeObserver 在调用 observe() 后总会立即触发一次回调。

### 4. unobserve 和 disconnect() 方法

unobserve() 方法用于停止观察一个元素，disconnect() 方法用于停止观察所有元素。这两个方法的操作是幂等的，也就是说在已停止观察的元素上调用一次或多次这两个方法，什么都不会发生。可以根据需要观察元素或解除对元素的观察。

```javascript
// 停止观察一个元素
fakeObserver.unobserve(document.body);

// 停止观察所有元素
fakeObserver.disconnect();
```

关键在于，在回调还在队列中时，调用这两个方法会取消该回调的执行。

>注意
>
>MutationObserver 没有实现 unobserve() 方法。

### 5. 异步回调和记录队列

观察者相关的规范都很注重性能，核心是异步回调和记录队列。比如，为了在注册大量重叠事件时不影响性能，每个有效事件（由观察者实例决定）的信息都会被捕获到一个记录中，然后推入一个记录队列。这个队列对每个观察者都是唯一的，表示按顺序发生的每个事件。

每次向记录队列添加一个记录，（初始化时传入的）观察者回调只会在没有回调微任务的情况下才会安排一个微任务。这样就能确保不会记录队列的内容进行重复处理。

在回调的微任务执行时，有可能会发生更多事件。此时，被调用的回调会收到一个添加到记录队列中的记录实例的数组。回调要负责处理数组中的每个记录，因为只要函数退出，它们就不存在了。回调执行结束，每条记录都被认为已经没用了，因此记录队列会被清空，内容也会被抛弃。

>注意
>
>ResizeObserver 不使用记录队列，没有实现 takeRecords() 方法。

### 6. takeRecords() 方法

通常，记录会自动出列并传给回调。如果你想手动处理队列，可以调用 observer.takeRecords() 方法，取得所有尚未被回调处理的记录。为防止再次处理，调用这个方法也会清空队列。

```javascript
console.log(fakeObserver.takeRecords());
// [FakeObserverRecord, FakeObserverRecord, ...]
```

这个方法非常适合想调用 disconnect() 但又希望先处理记录队列中的记录的情况。

### 7. 观察者的引用

观察者与它所观察的（一个或多个）元素之间的引用关系是不对称的。观察者有指向被观察元素的弱引用。因为是弱引用，所以不会影响目标元素被作为垃圾回收。

然而，目标元素有指向观察者的强引用。如果目标元素从 DOM 中被删除，进而被作为垃圾回收，关联的观察者也会被垃圾回收。

## 2. Resize Observer

ResizeObserver API 用于跟踪 DOM 元素尺寸的变化。通过 ResizeObserver，我们可以在观察的元素尺寸（宽和高）发生变化时异步执行回调函数。这个 API 适用于响应式 Web 设计或动态布局更新。ResizeObserver 也可以让我们观察元素内容或内边距盒子的尺寸变化，因而在需要响应 Web 应用布局的变化时非常有用。

要创建 ResizeObserver 的实例，需要在调用这个构造函数时传入一个回调函数：

```javascript
let observer = new ResizeObserver(() => {
    console.log("Resized!");
});
```

observe() 方法接收两个参数：要观察的目标 DOM 节点和可选的 options 对象。下面的例子创建一个观察者实例，并配置其观察页面主体的尺寸变化：

```javascript
let observer = new ResizeObserver(() => console.log('<body> size changed'));

observer.observe(document.body);

// <body> sizse changed!
```

调用 observe() 方法后，`<body>` 元素的大小只要发生变化，都会被 ResizeObserver 实例检测到，进而异步执行回调。注意，调用 observe() 也会触发一次回调执行。利用这个机会可以在起始尺寸上进行初始化。

下面的例子展示了缩放回调的初次及后续执行：

```javascript
let observer = new ResizeObserver(() => console.log('<body> was resized'));

observer.observe(document.body);

// ResizeObserver 总会在 observe() 执行后调用一次回调
// <body> wa resized

setTimeout(() => {
    document.body.style.width = "100px";
}, 1000);

//（1000 毫秒之后）
// <body> was resized
```

目标元素的子元素缩放不会触发回调，除非导致了被观察元素的尺寸变化。

调用 unobserve() 或 disconnect() 会停止缩放事件触发回调。更重要的是，这样会导致入队的回调被取消。

```javascript
let observer = new ResizeObserver(() => console.log("<body> was resized"));

observer.observe(document.body);

// ResizeObserver 总会在 observe() 执行后调用一次回调
// <body> was resized

setTimeout(() => {
    document.body.style.width = "100px";
    observer.unobserve(document.body);
}, 1000);

// 没有输出
```

### 1. 盒模型配置

observe() 的第二个参数 options 对象用于控制以什么盒模型来计算目标节点的尺寸。这个对象的 box 属性可以是以下 3 个值。

* content-box：默认值，使用内容尺寸
* border-box：使用边框尺寸
* device-pixel-content-box：使用内容尺寸，优先于应用任何 CSS 变换。

```javascript
observer.observe(document.body, { box: "device-pixel-content-box" });
```

### 2. 回调安排及执行

ResizeObserver 在渲染过程中处理缩放事件：所有操作在布局之后、绘制之前发生。这很好理解：浏览器会等到可以度量元素尺寸的时候并确定是否发生缩放，但要在执行绘制之前运行回调，以防回调进一步修改布局。

```javascript
let observer = new ResizeObserver(() => console.log('<body> was resized'));

observer.observe(document.body);

// ResizeObserver 总会在 observe() 执行后调用一次回调
// <body> was resized

setTimeout(() => {
    document.body.style.width = "100px";
    console.log("Changed body width");
}, 1000);

//（1000 毫秒之后）
// Changed body width
// <body> was resized
```

注意，回调中的 console.log() 是后执行的，说明回调在 style.width 被赋予新值时不是同步执行的。

现实当中，缩放事件通常不会只发生一次。比如，用户会持续拖动并缩放窗口、动画会不断修改元素大小，或者逐步地渲染内容，这些都会导致连续不断地触发缩放事件。回调函数需要考虑到这一点。



















































