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







