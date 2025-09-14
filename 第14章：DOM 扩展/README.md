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

