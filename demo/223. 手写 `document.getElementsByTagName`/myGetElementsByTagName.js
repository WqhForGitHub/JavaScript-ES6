/**
 * 手写 document.getElementsByTagName
 *
 * 通过深度优先遍历 DOM 树，收集所有标签名匹配的元素。
 * 标签名匹配不区分大小写。传入 '*' 返回所有元素。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 查找所有指定标签名的元素
 * @param {string} tagName - 标签名，'*' 表示所有
 * @param {Document|Element} [root=document]
 * @returns {Element[]}
 */
function myGetElementsByTagName(tagName, root) {
  root = root || (typeof document !== 'undefined' ? document : null);
  if (!root) return [];

  var result = [];
  var target = tagName.toLowerCase();

  function dfs(node) {
    if (!node) return;
    // 跳过根节点本身（document），从其子节点开始
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (target === '*' || (child.tagName && child.tagName.toLowerCase() === target)) {
        result.push(child);
      }
      dfs(child);
    }
  }

  dfs(root);
  return result;
}

// ===== 模拟 DOM 测试 =====
function createMockNode(tag, attrs, children) {
  return {
    tagName: tag,
    attributes: attrs || {},
    children: children || [],
    getAttribute: function (key) {
      return this.attributes[key] || null;
    },
  };
}

var mockDoc = createMockNode('html', {}, [
  createMockNode('body', {}, [
    createMockNode('div', {}, [
      createMockNode('p', {}, []),
      createMockNode('span', {}, []),
    ]),
    createMockNode('p', {}, []),
    createMockNode('P', {}, []), // 大写标签名也应匹配
  ]),
]);

var divs = myGetElementsByTagName('div', mockDoc);
console.log(divs.length); // => 1

var ps = myGetElementsByTagName('p', mockDoc);
console.log(ps.length); // => 3 （不区分大小写）

var all = myGetElementsByTagName('*', mockDoc);
console.log(all.length); // => 6 （body, div, p, span, p, P）
