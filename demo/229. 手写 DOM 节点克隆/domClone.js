/**
 * 手写 DOM 节点克隆
 *
 * 实现：
 *   - cloneNode：浅克隆（只复制节点本身）和深克隆（递归复制所有子节点）
 *   - 深克隆时递归复制 children，并复制属性
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 克隆 DOM 节点
 * @param {Node} node - 要克隆的节点
 * @param {boolean} [deep=false] - 是否深克隆
 * @returns {Node} 克隆后的节点
 */
function myCloneNode(node, deep) {
  deep = deep || false;

  // 使用 document.createElement 创建新节点
  var clone;
  if (node.nodeType === 1) {
    // 元素节点
    clone = document.createElement(node.tagName);
    // 复制所有属性
    for (var i = 0; i < node.attributes.length; i++) {
      var attr = node.attributes[i];
      clone.setAttribute(attr.name, attr.value);
    }
    // 复制文本内容（浅克隆也复制直接文本）
    // 注意：原生 cloneNode 浅克隆不复制子节点，但会复制文本？实际上浅克隆不复制子节点
    if (deep) {
      // 深克隆：递归克隆所有子节点
      for (var j = 0; j < node.childNodes.length; j++) {
        clone.appendChild(myCloneNode(node.childNodes[j], true));
      }
    }
  } else if (node.nodeType === 3) {
    // 文本节点
    clone = document.createTextNode(node.textContent);
  } else if (node.nodeType === 8) {
    // 注释节点
    clone = document.createComment(node.textContent);
  } else {
    clone = node.cloneNode(deep);
  }
  return clone;
}

/**
 * 深克隆元素的便捷方法
 * @param {Node} node
 * @returns {Node}
 */
function deepClone(node) {
  return myCloneNode(node, true);
}

// ===== 测试用例（需浏览器环境） =====
// <div id="original" class="box">
//   <p>Hello</p>
//   <span>World</span>
// </div>
//
// var original = document.getElementById('original');
// var shallow = myCloneNode(original, false);
// // shallow: <div class="box"></div> （无子节点）
// console.log(shallow.children.length); // => 0
// console.log(shallow.className);       // => 'box'
//
// var deep = myCloneNode(original, true);
// // deep: <div class="box"><p>Hello</p><span>World</span></div>
// console.log(deep.children.length);    // => 2
// console.log(deep !== original);       // => true
// console.log(deep.children[0] !== original.children[0]); // => true

// 模拟测试：用对象模拟节点克隆
function mockNode(tag, attrs, children) {
  return {
    tagName: tag,
    attributes: attrs || {},
    children: children || [],
    cloneNode: function (deep) {
      var cloned = mockNode(
        this.tagName,
        Object.assign({}, this.attributes),
        [],
      );
      if (deep) {
        cloned.children = this.children.map(function (c) {
          return c.cloneNode(true);
        });
      }
      return cloned;
    },
  };
}

var original = mockNode("div", { class: "box" }, [
  mockNode("p", {}, []),
  mockNode("span", {}, []),
]);

var shallow = original.cloneNode(false);
console.log(shallow.children.length); // => 0
console.log(shallow.attributes.class); // => 'box'

var deep = original.cloneNode(true);
console.log(deep.children.length); // => 2
console.log(deep !== original); // => true
console.log(deep.children[0] !== original.children[0]); // => true
