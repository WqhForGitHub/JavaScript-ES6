/**
 * 手写 DOM 节点删除
 *
 * 实现：
 *   - removeChild：通过父节点删除子节点
 *   - remove：节点自删除（现代浏览器支持）
 *   - 兼容写法：判断 remove 是否存在，不存在则用 removeChild
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 通过父节点删除子节点（模拟 removeChild）
 * @param {Node} parent - 父节点
 * @param {Node} child - 要删除的子节点
 * @returns {Node} 被删除的节点
 */
function myRemoveChild(parent, child) {
  if (child.parentNode !== parent) {
    throw new Error("The node to be removed is not a child of this node.");
  }
  parent.removeChild(child);
  return child;
}

/**
 * 节点自删除（模拟 remove，兼容旧浏览器）
 * @param {Node} node - 要删除的节点
 */
function myRemove(node) {
  if (node.remove) {
    node.remove();
  } else if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

/**
 * 删除元素的所有子节点
 * @param {Node} parent - 父节点
 */
function myRemoveAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * 删除元素的所有子节点（更高效的方式，直接清空 innerHTML）
 * @param {Node} parent - 父节点
 */
function myEmpty(parent) {
  parent.innerHTML = "";
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
// myRemoveChild(list, item2);   // 删除 item2，list 变为 1, 3
//
// var item3 = document.getElementById('item3');
// myRemove(item3);              // 删除 item3，list 变为 1
//
// myRemoveAllChildren(list);    // 清空所有子节点

// 模拟测试：用数组模拟子节点删除逻辑
var children = [
  { id: "item1", val: 1 },
  { id: "item2", val: 2 },
  { id: "item3", val: 3 },
];

// 模拟 removeChild
function removeChild(arr, child) {
  var idx = arr.indexOf(child);
  if (idx === -1) throw new Error("not a child");
  return arr.splice(idx, 1)[0];
}
var removed = removeChild(children, children[1]);
console.log(removed.val); // => 2
console.log(
  children.map(function (c) {
    return c.val;
  }),
); // => [1, 3]

// 模拟 removeAllChildren
function removeAllChildren(arr) {
  arr.length = 0;
}
removeAllChildren(children);
console.log(children.length); // => 0
