JavaScript 较早的一个用途是承担一部分服务器端表单处理的责任。虽然 Web 和 JavaScript 都已经发展了很多年，但 Web 表单的变化不是很大。由于不能直接使用表单解决问题，因此开发者不得不使用 JavaScript 既做表单验证，又增强标准表单控件的默认行为。

# 1. 表单基础

Web 表单在 HTML 中以 `<form>` 元素显示，在 JavaScript 中则以 HTMLFormElement 类型表示。HTMLFormElement 类型继承自 HTMLElement 类型，因此拥有与其他 HTML 元素一样的默认属性。不过，HTMLFormElement 也有自己的属性和方法。

* acceptCharset：服务器可以接收的字符集，等价于 HTML 的 accept-charset 属性
* action：请求的 URL，等价于 HTML 的 action 属性
* elements：表单中所有控件的 HTMLCollection
* encytpe：请求的编码类型，等价于 HTML 的 enctype 属性
* length：表单中控件的数量
* method：HTTP 请求的方法类型，通常是 "get" 或 "post"，等价于 HTML 的 method 属性
* name：表单的名字，等价于 HTML 的 name 属性
* reset()：把表单字段重置为各自的默认值
* submit()：提交表单
* target：用于发送请求和接收响应的窗口的名字，等价于 HTML 的 target 属性

有几种方式可以取得对 `<form>` 元素的引用。最常用的是将表单当作普通元素为它指定一个 id 属性，从而可以利用 getElementById() 来获取表单，比如：

```javascript
let form = document.getElementById("form1");
```

此外，使用 document.forms 集合可以获取页面上所有的表单元素。然后，可以进一步使用数字索引或表单的名字（name）来访问特定的表单。比如：

```javascript
// 取得页面中的第一个表单
let firstForm = document.forms[0];

// 取得名字为 "form2" 的表单
let myForm = document.forms["form2"];
```

注意，表单可以同时拥有 id 和 name，而且两者可以不相同。

## 1. 提交表单

表单是通过用户点击提交按钮或图片按钮的方式提交的。提交按钮可以使用 type 属性为 "submit" 的 `<input>` 元素或 `<button>` 元素来定义，图片按钮可以使用 type 属性为 "image" 的 `<input>` 元素来定义。点击下面例子中定义的所有按钮都可以提交它们所在的表单：

```html
<!-- 通用提交按钮 -->
<input type="submit" value="Submit Form">

<!-- 自定义提交按钮 -->
<button type="submit">Submit Form</button>

<!-- 图片按钮 -->
<input type="image" src="graphic.gif">
```

如果表单中有上述任何一个按钮，且焦点在表单中某个控件上，则按回车键也可以提交表单。（textarea 控制是个例外，当焦点在它上面时，按回车键会换行。）注意，没有提交按钮的表单在按回车键时不会提交。























