# 4.1 标记







# 4.2 JavaScript





## 2. 最终的函数代码清单

```javascript
function showPic() {
    var source = whichpic.getAttribute("href");
    var placeholder = document.getElementById("placeholder");
    placeholder.setAttribute("src", source);
} 
```



​                                                                                                         







# 4.3 应用这个 JavaScript 函数







# 4.4 对这个函数进行扩展



## 1. childNodes 属性

**`Node.childNodes 属性用于访问指定节点的子节点列表。它返回一个 NodeList 对象，其中包含了该节点的所有子节点，包括元素节点、文本节点和注释节点。`**

```                                                                    javascript
const element = document.getElementById("myElement");

const children = element.childNodes;

for(let i = 0; i < children.length; i++) {
    const child = children[i];
}
```





## 2. nodeType 属性

**`nodeType 属性用于确定 DOM 节点（Node）的类型。它返回一个整数值，表示节点的类型。`**

**`nodeType 属性值`**

**`以下是一些常见的 nodeType 属性值及其对应的节点类型：`** 

* **`1：Node.ELEMENT_NODE - 元素节点，例如 <p> 或 <div>`** 
* **`2：Node.ATTRIBUTE_NODE - 属性节点，例如元素的属性`** 
* **`3：Node.TEXT_NODE - 文本节点，表示元素或属性中的文本内容`** 
* **`8：Node.COMMENT_NODE - 注释节点，表示 HTML 中的注释`** 
* **`9：Node.DOCUMENT_NODE - 文档节点，表示整个 HTML 文档`** 
* **`10：Node.DOCUMENT_TYPE_NODE - 文档类型节点，表示文档的 DOCTYPE`** 
* **`11：Node.DOCUMENT_FRAGMENT_NODE - 文档片段节点`** 



```html
<div id="myElement">
    <p>这是一个段落。</p>
    <!-- 这是一个注释 -->
    文本节点
</div>

<script>
    const element = document.getElementById("myElement");
    const firstChild = element.firstChild;
    const commentNode = element.childNodes[1];
    const textNode = element.childNodes[2];
    
    console.log(element.nodeType); // 输出 1 (Node.ELEMENT_NODE)
    console.log(firstChild.nodeType); // 输出 1 (Node.ELEMENT_NODE)
    console.log(commentNode.nodeType); // 输出 8 (Node.COMMENT_NODE)
    console.log(textNode.nodeType); // 输出 3 (Node.TEXT_NODE)
    console.log(document.nodeType); // 输出 9 (Node.DOCUMENT_NODE)
</script>
```







## 3. 在标记里增加一段描述





## 4. 用 JavaScript 改变这段描述

```javascript
function showPic(whichpic) {
    var source = whichpic.getAttribute("href");
    var placeholder = document.getElementById("placeholder");
    placeholder.setAttribute("src", source);
    var text = whichpic.getAttribute("title");
    var description = document.getElementById("description");
}
```









## 5. nodeValue 属性

**`nodeValue 属性用于获取或设置节点的值，具体取决于节点的类型。`**

**`适用节点类型及返回值`**

* **`文本节点（Text Node）：返回文本节点的内容`** 
* **`注释节点（Comment Node）：返回注释节点的内容`** 
* **`属性节点（Attribute Node）：返回属性的值`** 
* **`其他节点类型：对于文档节点（Document）、元素节点（Element）等，nodeValue 返回 null。`** 



**`示例`**

```html
<div id="myElement" title="Hello">
    <p>这是一个段落。</p>
    <!-- 这是一个注释 -->
    文本节点
</div>

<script>
    const element = document.getElementById("myElement");
    const paragraph = element.querySelector("p");
    const commentNode = element.childNodes[3];
    const attributeNode = element.getAttributeNode("title");
    
    console.log(element.nodeValue); // null 
    console.log(paragraph.firstChild.nodeValue); // 这是一个段落
    console.log(commentNode.nodeValue); // 这是一个注释
    console.log(attributeNode.nodeValue); // Hello
    
    paragraph.firstChild.nodeValue = "新的段落内容。";
    console.log(paragraph.firstChild.nodeValue); // 新的段落内容
    
    commentNode.nodeValue = "新的注释内容";
    console.log(commentNode.nodeValue); // 新的注释内容
</script>
```













## 6. firstChild 和 lastChild 属性

**`node.firstChild`**

**`这种写法与下面的写法完全等价：`** 

**`node.childNodes[0]`**



**`node.lastChild`**

**`DOM 还提供了一个与之对应的 lastChild 属性：`**

**`node.childNodes[node.childNodes.length - 1]`**



**`firstChild 和 lastChild 属性用于访问指定节点的第一个和最后一个子节点。`** 

**`基本用法`**

* **`firstChild：返回节点的第一个子节点。如果节点没有子节点，则返回 null`** 
* **`lastChild：返回节点的最后一个子节点。如果节点没有子节点，则返回 null`** 



**`示例`**

```html
<div id="myElement">
    <p>第一个段落。</p>
    <!-- 这是一个注释 -->
    文本节点
    <span>最后一个 span。</span>
</div>

<script>
    const element = document.getElementById("myElement");
    
    const firstChild = element.firstChild;
    const lastChild = element.lastChild;
    
    console.log(firstChild); // <p>第一个段落。</p>
    console.log(lastChild); // <span>最后一个 span。</span>
</script>
```





## 7. 利用 nodeValue 属性刷新这段描述

```javascript
function showPic(whichpic) {
    var source = whichpic.getAttribute("href");
    var placeholder = document.getElementById("placeholder");
    placeholder.setAttribute("src", source);
    var text = whichpic.getAttribute("title");
    var description = document.getElementById("description");
    description.firstChild.nodeValue = text;                  
}
```









​            





​                                                                                                                                                                                                                                   