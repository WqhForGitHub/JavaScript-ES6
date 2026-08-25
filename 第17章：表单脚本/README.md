JavaScript 较早的一个用途是承担一部分服务器端表单处理的责任。虽然 Web 和 JavaScript 都已经发展了很多年，但 Web 表单的变化不是很大。由于不能直接使用表单解决问题，因此开发者不得不使用 JavaScript 既做表单验证，又增强标准表单控件的默认行为。

# 17.1 表单基础

Web 表单在 HTML 中以 `<form>` 元素表示，在 JavaScript 中则以 HTMLFormElement 类型表示。HTMLFormElement 类型继承来自 HTMLElement 类型给你，因此拥有与其他 HTML 元素一样的默认属性。不过，HTMLFormElement 也有自己的属性和方法。。
- acceptCharset：服务器可以接收的字符集，等价于 HTML 的 accept-charset 属性。
- action：请求的 URL，等价于 HTML 的 action 属性
- elements：表等价于 HT单中所有空间的 HTMLCollection
- enctype：请求的编码类型，等价于 HTML 的 enctype 属性
- length：表单中控件的数量
- method：HTTP 请求的方法类型，通常是 "get" 或 "post"，等价于 HTML 的 method 属性
- name：表单的名字，等价于 HTML 的 name 属性
- reset()：把表单字段重置为各自的默认值
- submit()：提交表单
- target()：用于发送请求和接收响应的窗口的名字，ML 的 target 属性
有几种方式可以取得对 `<form>` 元素的引用。最常用的是将表单当作普通元素为它指定一个 id 属性，从而可以使用 getElementById() 来获取表单，比如：
```javascript
let form = document.getElementById("form1");
```
此外，使用 document.forms 集合可以获取页面上所有的表单元素。然后，可以进一步使用数字索引或表单的名字（name）来访问特定的表单，比如：
```javascript
// 取得页面中的第一个表单
let firstForm = document.forms[0];

// 取得名字为 "form2" 的表单
let myForm = document.form["form2"]
```
注意，表单可以同时拥有 id 和 name，而且两者可以不相同。
## 17.1.1 提交表单

表单是通过用户点击按钮或图片按钮的方式提交的。提交按钮可以使用 type 属性为 "images" 的 `<input>` 元素来定义。点击下面例子中定义的所有按钮都可以提交它们所在的表单：
```html
<!-- 通用提交按钮 -->
<input type="submit" value="Submit Form">

<!-- 自定义提交按钮 -->
<button type="submit">Submit Form</button>

<!-- 图片按钮 -->
<input type="image" src="graphic.gif">
```
如果表单中有上述任何一个按钮，且焦点在表单中某个控件上，则按回车键也可以提交表单。（textarea 控件是个例外，当焦点在它上面时，按回车键会换行。）注意，没有提交按钮的表单在按回车键时不会提交。
以这种方式提交表单会在向服务器发送请求之前触发 submit 事件。这样就提供了一些验证表单数据的机会，可以根据验证结果决定是否真的要提交。阻止这个事件的默认行为可以取消提交表单。例如，下面的代码会阻止表单提交：
```javascript
let form = document.getElementById("myForm");

form.addEventListener("submit", (event) => {
	// 阻止表单提交
	event.preventDefault();
});
```
调用 preventDefault() 方法可以阻止表单提交。通常，在表单数据无效以及不应该发送到服务器时可以这样来处理。
当然，也可以通过编程方式在 JavaScript 中调用 submit() 方法来提交表单。可以在任何时候调用这个方法来提交表单，而且表单中不存在提交按钮也不影响表单提交。下面是一个例子：
```javascript
let form = document.getElementById("myForm");

// 提交表单
form.submit();
```
通过 submit() 提交表单时，submit 事件不会触发。因此在调用这个方法前要先做数据验真。
表单提交的一个最大问题是可能会提交两次表单，如果提交表单之后没有什么反应，那么没有耐心的用户可能会多次点击提交按钮。结果是很烦人的（因为服务器要处理重复的请求），甚至可能造成损失（如果用户正在购物，则可能会多次下单）。解决这个问题主要有两种方式：在表单提交后禁用提交按钮，或者通过 onsubmit 事件处理程序取消之后的表单提交。
## 17.1.2 重置表单

用户单击重置按钮可以重置表单。重置按钮可以使用 type 属性为 "reset" 的 `<input>`或 `<button>` 元素来创建，比如：
```html
<!-- 通用重置按钮 -->
<input type="reset" value="Reset Form">

<!-- 自定义重置按钮 -->
<button type="reset">Reset Form</button>
```
这两种按钮都可以重置表单。表单重置后，所有表单字段都会重置回页面第一次渲染时各自拥有的值。如果字段原来是空的，就会变成空的。如果字段有默认值，则恢复为默认值。
用户单击重置按钮重置表单会触发 reset 事件。这个事件为取消重置提供了机会。例如，以下代码演示了如何阻止重置表单：
```javascript
let form = document.getElementById("myForm");

form.addEventListener("reset", (event) => {
	event.preventDefault();
});
```
与表单提交一样，重置表单也可以通过 JavaScript 调用 reset() 方法来完成，如下面的例子所示：
```javascript
let form = document.getElementById("myForm");

// 重置表单
form.reset();
```
与 submit() 方法的功能不同，调用 reset() 方法会像单击了重置按钮一样触发 reset 事件。
>注意
>
>表单设计中通常不提倡重置表单，因为重置表单经常会导致用户迷失方向，如果意外触发则会令人感到厌烦。实践中几乎没有重置表单的需求。一般来说，提供一个取消按钮，让用户点击返回前一个页面而不是恢复表单中所有的值来得更直观。

## 17.1.3 表单字段

表单元素可以像页面中的其他元素一样使用原生 DOM 方法来访问。此外，所有表单元素都是表单 elements 属性（元素集合）中包含的一个值。这个 elements 集合是一个有序列表，包含对表单所有字段的引用，包括所有 `<input>`、`<textarea>`、`<button>`、`<select>` 和 `fieldset>` 元素。elements 集合中的每个字段都以它们在 HTML 标记中出现的次序保存，可以通过索引位置和 name 属性来访问。
以下是几个例子：
```javascript
let form = document.getElementById("form1");

// 取得表单中的第一个字段
let fields = form.elements["textbox1"];

// 取得字段的数量
let fieldCount = form.elements.length;
```
如果多个表单控件使用了同一个 name，比如像单选按钮那样，则会返回包含所有同名元素的 HTMLCollection。比如，来看下面的 HTML 代码片段：
```html
<form method="post" id="myForm">
	<ul>
		<li><input type="radio" name="color" value="red">Red</li>
		<li><input type="radio" name="color" value="green">Green</li>
		<li><input type="radio" name="color" value="blue">Blue</li>
	</ul>
</form>
```
这个 HTML 中的表单有 3 个单选按钮的 name 是 "color"，这个名字把它们联系在了一起。在访问 elements["colors"] 时，返回的 NodeList 就包含这 3 个元素。而在访问 elements[0] 时，只会返回第一个元素。比如：
```javascript
let form = document.getElementById("myForm");

let colorFields = form.elements["color"];
console.log(colorFields.length); // 3

let firstColorField = colorFields[0];
let firstFormField = form.elements[0];
console.log(firstColorField === firstFormField); // true
```
以上代码表明，使用 form.elements[0] 获取的表单的第一个字段就是 form.elements["color"] 中包含的第一个元素。
>注意
>也可以通过表单属性的方式访问表单字段，比如 form[0] 这种使用索引和 form["color"] 这种使用字段名字的方式。访问这些属性与访问 form.elements 集合是一样的。这种方式是为向后兼容旧版本浏览器而提供的，实际开发中应该使用 elements。

### 17.1.3.1 表单字段的公共属性

除 `<fieldset>` 元素以外，所有表单字段都有一组同样的属性。由于 `<input>` 类型可以表示多种表单字段，因此某些属性只适用于特定类型的字段。除此之外的属性可以在任何表单字段上使用。以下列出了这些表单字段的公共属性和方法。
- disabled：布尔值，表示表单字段是否禁用
- form：指针，指向表单字段所属的表单。这个属性是只读的
- name：字符串，这个字段的名字
- readOnly：布尔值，表示这个字段是否只读
- tabIndex：数值，表示这个字段在按 Tab 键时的切换顺序
- type：字符串，表示字段类型，如 "checkbox"、"radio" 等
- value：要提供给服务器的字段值。对文件输入字段来说后，这个属性是只读的，仅包含计算机上某个文件的路径
这里面除了 form 属性以外，JavaScript 可以动态修法任何属性。来看下面的例子：
```javascript
let form = document.getElementById("myForm");
let field = form.elements[0];

// 修改字段的值
field.value = "Another value";

// 检查字段所属的表单
console.log(field.form === form); // true

// 给字段设置焦点
field..focus();

// 禁用字段
field.disabled = true;

// 改变字段的类型（不推荐，但对 <input> 来说是可能的）
field.type = "checkbox";
```
这种动态修改表单字段属性的能力为任何时候修改表单提供了方便。举个例子，Web 表单的一个常见问题是用户常常会点击两次提交按钮。在涉及信用卡扣款的情况下，这是个严重的问题，可能会导致重复扣款。对此，常见的解决方案是第一次点击之后禁用提交按钮。可以通过监听 submit 事件来完成。比如下面这个例子：
```javascript
// 避免多次提交表单的代码
let form = document.getElementById("myForm");

form.addEventListener("submit", (event) => {
	let target = event.target;
	
	// 取得提交按钮
	let btn = target.elements["submit-btn"];
	
	// 禁用提交按钮
	btn.disabled = true;
})
```
以上代码在表单的 submit 事件上注册了一个事件处理程序。当 submit 事件触发时，代码会取得提交按钮，然后将其 disabled 属性设置为 true。注意，这个功能不能通过直接给提交按钮添加 onclick 事件处理程序来实现，原因是不同浏览器触发事件的时机不一样。有些浏览器会在触发表单的 submit 事件前先触发提交按钮的 click 事件，有些浏览器则会后触发 click 事件。对于先触发 click 事件的浏览器，这个按钮会在表单提交前被禁用，这意味着表单就不会被提交了。因此最好使用表单的 submit 事件来禁用提交按钮。但这种方式不适用于没有使用提交按钮的表单提交。如前所述，只有提交按钮才能触发 submit 事件。
type 属性可以用于除 `<fieldset>` 之外的任何表单字段。对于 `<input>` 元素，这个值等于 HTML 的 type 属性值。对于其他元素，这个 type 属性的值按照下表设置。

| 描述       | 示例HTML                               | 类型的值              |
| -------- | ------------------------------------ | ----------------- |
| 单选列表     | `<select>...</select>`               | "select-one"      |
| 多选列表     | `<select multiple>...</select>`      | "select-multiple" |
| 自定义按钮    | `<button>...</button>`               | "submit"          |
| 自定义非提交按钮 | `<button type="button">...</buttom>` | "button"          |
| 自定义重置按钮  | `<button type="reset">...</button>`  | "reset"           |
| 自定义提交按钮  | `<button type="submit"></button>`    | "submit"          |
对于 `<input>` 和 `<button>` 元素，可以动态修改其 type 属性。但 `<select>` 元素的 type 属性是只读的。
### 17.1.3.2 表单字段的公共方法

每个表单字段都有两个公共方法：focus() 和 blur()。focus() 方法把浏览器焦点设置到表单字段，这意味着该字段会变成活动字段并可以响应键盘事件。例如，文本框在获得焦点时会在内部显示闪烁的光标，表示可以接收输入。focus() 方法主要用来引起用户对页面中某个部分的注意。比如，在页面加载后把焦点定位到表单中第一个字段就是很常见的做法。实现方法是监听 load 事件，然后在第一个字段上调用 focus()，如下所示：
```javascript
window.addEventListener("load", () => {
	document.forms[0].elements[0].focus();
})
```
注意，如果表单中第一个字符是 type 为 "hidden" 的 `<input>` 元素，或者该字符被 CSS 属性 display 或 visibilty 隐藏了，以上代码就会出错。
HTML5 为表单字段增加了 autofocus 属性，浏览器会自动为带有该属性的元素设置焦点而无须使用 JavaScript。比如：
```html
<input type="text" autofocus>
```
为了让之前的代码在使用 autofocus 时也能正常工作，必须先检测元素上是否设置了该属性。如果设置了 autofocus，就不再调用 focus()：
```javascript
window.addEventListener("load", () => {
	let element = document.forms[0].elements[0];
	
	if (element.autoFocus !== true) {
		element.focus();
		console.log("JS focus");
	}
})
```
因为 autofocus 是布尔值属性，所以在支持的浏览器中通过 JavaScript 访问表单字段的 autofocus 属性会返回 true（在不支持的浏览器中是空你字符串）。上面的代码只会在 autofocus 属性不等于 true 时调 focus() 方法，以确保向前兼容。
>注意
>
>默认情况下只能给表单元素设置焦点。不过，通过将 tabIndex 属性设置为 -1 再调用 focus()，也可以给任意元素设置焦点。

focus() 的反向操作是 blur()，其用于从元素上移除焦点。调用 blur() 时，焦点不会转移到任何特定元素，仅仅只是从调用这个方法的元素上移除了。在浏览器支持 readonly 属性之前，Web 开发者通常会使用这个方法创建只读阶段。现在很少有用例需要调用 blur()，不过如果需要是可以用的。下面是一个例子：
```javascript
document.form[0].elements[0].blur();
```



 

































```

还

input.stepUp(5); // 加 5
input.stepDown(); // 减 1
input.stepDown(10); // 减 10
```nput");
```

#### 5. 检测有效性

使用 checkValidity() 方法可以检测表单中任意给定字段是否有效。这个方法在所有表单元素上都可以使用，如果字段值有效就会返回 true，否则返回 false。判断字段是否有效的依据是本节前面提到的约束条件，因此必填字段如果没有值就会被视为无效，而字段值不匹配 pattern 属性也会被视为无效。比如：
如果一个表单中有多个提交按钮，那么可以给特定的提交按钮添加 formnovalidate 属性，指定通过该按钮无须验证即可提交表单：

```html
<form method="post" action="/foo">
    <!-- 表单元素 -->
    <input type="submit" value="Regular Submit">
    <input type="submit" formnovalidate name="btnNoValidate" value="Non-validating Submit">
</form>
```

在这个例子中，第一个提交按钮会让表单像往常一样验证数据，第二个提交按钮则禁用了验证，可以直接提交表单。我们也可以使用 JavaScript 来设置这个属性：

```javascript
// 关闭验证
document.forms[0].elements["btnNoValidate"].formNoValidate = true;
```

## 3. 选择框编程

选择框是使用 `<select>` 和 `<option>` 元素创建的。为方便交互，HTMLSelectElement 类型在所有表单字段的公共能力之外又提供了以下属性和方法。

*  add(newOption, relOption)：在 relOption 之前向控件中添加新的 `<option>`
* multiple：布尔值，表示是否允许多选，等价于 HTML 的 multiple 属性76
* options：控件中所有 `<option>` 元素的 HTMLCollection
* remove(index)：移除给定位置的选项
* selectedIndex：选中项基于 0 的索引值，如果没有选中项则为 -1。对于允许多选的列表，始终是第一个选项的索引
* size：选择框中可见的行数，等价于 HTML 的 size 属性

选择框的 type 属性可能是 "select-one" 或 "select-multiple"，具体取决于 multiple 属性是否存在。当前选中项根据以下规则决定选择框的 value 属性。

* 如果没有选中项。则选择框的值是空字符串
* 如果有一个选中项，且其 value 属性有值，则选择框的值就是选中项 value 属性的值。即使 value 属性的值是空字符串也是如此
* 如果有一个选中项，且其 value 属性没有指定值，则选择框的值是该项的文本内容
* 如果有多个选中项，则选择框的值根据前两条规则取得第一个选中项的值

来看下面的选择框：

```html
<select name="location" id="selLocation">
    <option value="Sunnyvale, CA">Sunnyvale</option>
    <option value="Los Angeles, CA">Los Angeles</option>
    <option value="Mountain View, CA">Mountain View</option>
    <option value="">China</option>
    <option>Australia</option>
</select>
```

如果选中这个选择框中的第一项，则字段的值就是 "Sunnyvale, CA"。如果文本为 "China" 的项被选中，则字段的值是一个空字符串，因为该项的 value 属性是空字符串。如果选中最后一项，那么字段的值是 "Australia"，因为该 `<option>` 元素没有指定 value 属性。

每个 `<option>` 元素在 DOM 中都由一个 HTMLOptionElement 对象表示。HTMLOptionElement 类型为方便数据存取添加了以下属性。

* index：选项在 options 集合中的索引
* label：选项的标签，等价于 HTML 的 label 属性
*  selected：布尔值，表示是否选中了当前选项。把这个属性设置为 true 会选中当前选项
* text：选项的文本
* value：选项的值（等价于 HTML 的 value 属性）

大多数 `<option>` 属性是为了方便存取选项数据。可以使用常规 DOM 功能存取这些信息，只是效率比较低，如下面的例子所示：

```javascript
let selectbox = document.forms[0].elements["location"];

// 不推荐
let text = selectbox.options[0].firstChild.nodeValue; // 选项文本
let value = selectbox.options[0].getAttribute("value"); // 选项值
```

以上代码使用标准的 DOM 技术获取了选择框中第一个选项的文本和值。下面再比较一下使用特殊选项属性的代码：

```javascript
let selectbox = document.forms[0].elements["location"];

// 推荐
let text = selectbox.options[0].text; // 选项文本
let value = selectbox.options[0].value; // 选项值
```

在操作选项时，最好使用特定于选项的属性，因为这些属性得到了跨浏览器的良好支持。在操作 DOM 节点时，与表单控制实际的交互可能会因浏览器而异。不推荐使用标准 DOM 技术修改 `<option>` 元素的文本和值。

最后强调一下，选择框的 change 事件与其他表单字段是不一样的。其他表单字段会在自己的值改变后触发 change 事件，然后字段失去焦点。而选择框会在选中一项时立即触发 change 事件。

### 1. 选项处理

对于只允许选择一项的选择框，获取选项最简单的方式是使用选择框的 selectedIndex 属性，如下面的例子所示：

```javascript
let selectedOption = selectbox.options[selectbox.selectedIndex];
```

这样可以获取关于选项的所有信息，比如：

```javascript
let selectedIndex = selectbox.selectedIndex;
let selectedOption = selectbox.options[selectedIndex];
console.log(`Selected index: ${selectedIndex}\n` + 
            `Selected text: ${selectedOption.text}\n` + 
            `Selected value: ${selectedOption.value}`);
```

以上代码打印出了选中项的索引以及文本和值。

对于允许多

























































