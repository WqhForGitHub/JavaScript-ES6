/**
 * 手写 DOM 节点替换
 *
 * 实现：
 *   - replaceChild：用新节点替换父节点的指定子节点
 *   - replaceWith：节点自替换（现代浏览器）
 *   - outerHTML 替换：用 HTML 字符串替换整个节点
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 用新节点替换旧的子节点（模拟 replaceChild）
 * @param {Node} parent - 父节点
 * @param {Node} newChild - 新节点
 * @param {Node} oldChild - 旧节点
 * @returns {Node} 被替换掉的旧节点
 */
function myReplaceChild(parent, newChild, oldChild) {
  if (oldChild.parentNode !== parent) {
    throw new Error('The node to be replaced is not a child of this node.');
  }
  // 如果新节点已在其他位置，先移除
  if (newChild.parentNode) {
    newChild.parentNode.removeChild(newChild);
  }
  parent.replaceChild(newChild, oldChild);
  return oldChild;
}

/**
 * 节点自替换（模拟 replaceWith，兼容旧浏览器）
 * @param {Node} node - 要被替换的节点
 * @param {...Node} nodes - 替换的新节点
 */
function myReplaceWith(node) {
  var nodes = Array.prototype.slice.call(arguments, 1);
  if (node.replaceWith) {
    node.replaceWith.apply(node, nodes);
  } else if (node.parentNode) {
    var parent = node.parentNode;
    for (var i = nodes.length - 1; i >= 0; i--) {
      parent.insertBefore(nodes[i], node);
    }
    parent.removeChild(node);
  }
}

/**
 * 用 HTML 字符串替换整个节点（通过 outerHTML）
 * @param {Element} element - 要替换的元素
 * @param {string} html - HTML 字符串
 */
function myReplaceWithHTML(element, html) {
  element.outerHTML = html;
}

// ===== 测试用例（需浏览器环境） =====
// <ul id="list">
//   <li id="item1">1</li>
//   <li id="item2">2</li>
//   <li id="item3">3</li>
// </ul>
//
// var list = document.getElementById('list');
// var item2 = document.getElementById('item2');
// var newItem = document.createElement('li');
// newItem.textContent = 'new';
// myReplaceChild(list, newItem, item2);
// // list 变为：1, new, 3
//
// var item1 = document.getElementById('item1');
// var replacement = document.createElement('li');
// replacement.textContent = 'replaced';
// myReplaceWith(item1, replacement);
// // list 变为：replaced, new, 3

// 模拟测试
var children = [{ id: 'item1', val: 1 }, { id: 'item2', val: 2 }, { id: 'item3', val: 3 }];

function replaceChild(arr, newChild, oldChild) {
  var idx = arr.indexOf(oldChild);
  if (idx === -1) throw new Error('not a child');
  arr[idx] = newChild;
  return oldChild;
}
var old = replaceChild(children, { id: 'new', val: 'new' }, children[1]);
console.log(old.val); // => 2
console.log(children.map(function (c) { return c.val; })); // => [1, 'new', 3]
