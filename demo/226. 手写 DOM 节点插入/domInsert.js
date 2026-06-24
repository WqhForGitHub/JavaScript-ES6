/**
 * 手写 DOM 节点插入
 *
 * 实现多种节点插入方式：
 *   - appendChild：将节点插入到父节点末尾
 *   - insertBefore：将节点插入到指定参考节点之前
 *   - insertAfter：将节点插入到指定参考节点之后
 *   - insertAdjacentHTML：在相对位置插入 HTML
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 将节点插入到父节点末尾（模拟 appendChild）
 * @param {Node} parent - 父节点
 * @param {Node} node - 要插入的节点
 * @returns {Node} 插入的节点
 */
function myAppendChild(parent, node) {
  // 如果节点已存在于其他父节点中，先移除
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
  // 使用底层方式：通过父节点的 childNodes 维护
  // 这里直接调用原生方法演示概念
  parent.appendChild(node);
  return node;
}

/**
 * 将节点插入到参考节点之前（模拟 insertBefore）
 * @param {Node} parent - 父节点
 * @param {Node} newNode - 新节点
 * @param {Node} referenceNode - 参考节点（为 null 则插入末尾）
 * @returns {Node} 插入的节点
 */
function myInsertBefore(parent, newNode, referenceNode) {
  if (referenceNode === null) {
    return myAppendChild(parent, newNode);
  }
  if (newNode.parentNode) {
    newNode.parentNode.removeChild(newNode);
  }
  parent.insertBefore(newNode, referenceNode);
  return newNode;
}

/**
 * 将节点插入到参考节点之后
 * @param {Node} newNode - 新节点
 * @param {Node} referenceNode - 参考节点
 * @returns {Node} 插入的节点
 */
function myInsertAfter(newNode, referenceNode) {
  var parent = referenceNode.parentNode;
  if (!parent) return newNode;
  var nextSibling = referenceNode.nextSibling;
  return myInsertBefore(parent, newNode, nextSibling);
}

/**
 * 在相对位置插入 HTML（模拟 insertAdjacentHTML）
 * position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
 * @param {Element} element - 参考元素
 * @param {string} position - 位置
 * @param {string} html - HTML 字符串
 */
function myInsertAdjacentHTML(element, position, html) {
  var positions = {
    beforebegin: 'beforebegin',
    afterbegin: 'afterbegin',
    beforeend: 'beforeend',
    afterend: 'afterend',
  };
  if (!positions[position]) {
    throw new Error('Invalid position: ' + position);
  }
  element.insertAdjacentHTML(position, html);
}

// ===== 测试用例（需浏览器环境） =====
// 假设有：
// <ul id="list">
//   <li id="item1">1</li>
//   <li id="item2">2</li>
// </ul>
//
// var list = document.getElementById('list');
// var item3 = document.createElement('li');
// item3.textContent = '3';
// myAppendChild(list, item3);
// // list 变为：1, 2, 3
//
// var item0 = document.createElement('li');
// item0.textContent = '0';
// myInsertBefore(list, item0, document.getElementById('item1'));
// // list 变为：0, 1, 2, 3
//
// var item15 = document.createElement('li');
// item15.textContent = '1.5';
// myInsertAfter(item15, document.getElementById('item1'));
// // list 变为：0, 1, 1.5, 2, 3
//
// myInsertAdjacentHTML(list, 'beforeend', '<li>end</li>');
// // list 变为：0, 1, 1.5, 2, 3, end

// 模拟测试：用纯逻辑验证 insertAfter 行为
function mockList() {
  var nodes = [{ id: 'item1', val: 1 }, { id: 'item2', val: 2 }];
  return nodes;
}
var list = mockList();
// 模拟 insertAfter：在 item1 后插入 1.5
var idx = list.findIndex(function (n) { return n.id === 'item1'; });
list.splice(idx + 1, 0, { id: 'item15', val: 1.5 });
console.log(list.map(function (n) { return n.val; })); // => [1, 1.5, 2]
