/**
 * 手写虚拟 DOM（简单版）
 *
 * 虚拟 DOM 是用普通 JavaScript 对象描述真实 DOM 结构。
 * 包含：
 *   - createElement：创建虚拟节点（VNode）
 *   - render：将 VNode 渲染为真实 DOM
 *   - mount：挂载到容器
 *
 * 注意：render 部分需要在浏览器环境中运行。
 */

/**
 * 创建虚拟节点
 * @param {string} tagName - 标签名
 * @param {Object} [props] - 属性对象（含 key、class、style 等）
 * @param {Array|string} [children] - 子节点或文本
 * @returns {Object} VNode
 */
function createElement(tagName, props, children) {
  props = props || {};
  var key = props.key != null ? String(props.key) : undefined;
  return {
    tagName: tagName,
    props: props,
    key: key,
    children:
      children == null ? [] : Array.isArray(children) ? children : [children],
    text: null,
  };
}

/**
 * 创建文本节点
 * @param {string} text
 * @returns {Object}
 */
function createTextVNode(text) {
  return {
    tagName: null,
    props: {},
    key: undefined,
    children: [],
    text: String(text),
  };
}

/**
 * 判断是否为 VNode
 */
function isVNode(node) {
  return node && typeof node === "object" && "tagName" in node;
}

/**
 * 将虚拟节点渲染为真实 DOM
 * @param {Object} vnode - 虚拟节点
 * @returns {Node} 真实 DOM 节点
 */
function render(vnode) {
  if (vnode == null) return null;

  // 文本节点
  if (vnode.tagName == null) {
    return document.createTextNode(vnode.text);
  }

  // 元素节点
  var el = document.createElement(vnode.tagName);

  // 设置属性
  var props = vnode.props || {};
  Object.keys(props).forEach(function (key) {
    if (key === "key") return;
    if (key === "class" || key === "className") {
      el.className = props[key];
    } else if (key === "style" && typeof props[key] === "object") {
      Object.assign(el.style, props[key]);
    } else if (key.startsWith("on") && typeof props[key] === "function") {
      var eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, props[key]);
    } else {
      el.setAttribute(key, props[key]);
    }
  });

  // 渲染子节点
  var children = vnode.children || [];
  children.forEach(function (child) {
    var childNode = render(child);
    if (childNode) el.appendChild(childNode);
  });

  return el;
}

/**
 * 将虚拟 DOM 挂载到容器
 * @param {Object} vnode
 * @param {Element} container
 */
function mount(vnode, container) {
  var el = render(vnode);
  container.appendChild(el);
  return el;
}

// ===== 测试用例 =====
// 构建虚拟 DOM
var vnode = createElement("div", { id: "app", class: "container" }, [
  createElement("h1", { style: { color: "red" } }, ["Hello Virtual DOM"]),
  createElement("p", null, ["这是一段文本"]),
  createElement("ul", null, [
    createElement("li", { key: "1" }, ["item 1"]),
    createElement("li", { key: "2" }, ["item 2"]),
  ]),
]);

console.log(JSON.stringify(vnode, null, 2));
// 输出虚拟 DOM 结构：
// {
//   "tagName": "div",
//   "props": { "id": "app", "class": "container" },
//   "key": undefined,
//   "children": [ ... ],
//   "text": null
// }

console.log(vnode.tagName); // => 'div'
console.log(vnode.children.length); // => 3
console.log(vnode.children[0].tagName); // => 'h1'
console.log(vnode.children[2].children[0].children[0]); // => 'item 1'

// 文本节点测试
var textVNode = createTextVNode("纯文本");
console.log(textVNode.text); // => '纯文本'
console.log(textVNode.tagName); // => null

// 在浏览器中可执行：
// mount(vnode, document.getElementById('root'));
