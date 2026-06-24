/**
 * 手写 document.querySelector
 *
 * 支持基本的 CSS 选择器：
 *   - 标签选择器：div
 *   - id 选择器：#id
 *   - class 选择器：.class
 *   - 组合选择器：div.box、#id .child、div > p 等（简单版）
 *
 * 这里实现一个简化版本，支持单选择器（tag / #id / .class）
 * 以及后代选择器（空格分隔）。返回第一个匹配的元素。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 解析简单选择器，返回匹配函数
 * @param {string} selector
 * @returns {Function}
 */
function parseSelector(selector) {
  selector = selector.trim();
  if (selector === '*') {
    return function (node) {
      return node.nodeType !== undefined ? node.nodeType === 1 : true;
    };
  }
  if (selector[0] === '#') {
    var id = selector.slice(1);
    return function (node) {
      return node.getAttribute && node.getAttribute('id') === id;
    };
  }
  if (selector[0] === '.') {
    var cls = selector.slice(1);
    return function (node) {
      var nodeClass = node.getAttribute ? node.getAttribute('class') : null;
      if (!nodeClass) return false;
      return nodeClass.split(/\s+/).indexOf(cls) !== -1;
    };
  }
  // 标签选择器
  var tag = selector.toLowerCase();
  return function (node) {
    return node.tagName && node.tagName.toLowerCase() === tag;
  };
}

/**
 * 查询第一个匹配选择器的元素
 * @param {string} selector - CSS 选择器
 * @param {Document|Element} [root=document]
 * @returns {Element | null}
 */
function myQuerySelector(selector, root) {
  root = root || (typeof document !== 'undefined' ? document : null);
  if (!root) return null;

  // 按空格拆分为后代选择器序列
  var parts = selector.trim().split(/\s+/).filter(Boolean);
  var matchers = parts.map(parseSelector);

  function dfs(node, depth) {
    if (!node) return null;
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (matchers[depth](child)) {
        // 如果是最后一个选择器，匹配成功
        if (depth === matchers.length - 1) {
          return child;
        }
        // 否则继续在子树中找下一个选择器
        var found = dfs(child, depth + 1);
        if (found) return found;
      }
      // 当前节点不匹配当前选择器，但在其子树中可能匹配当前选择器
      var foundInChild = dfs(child, depth);
      if (foundInChild) return foundInChild;
    }
    return null;
  }

  return dfs(root, 0);
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
    createMockNode('div', { id: 'app', class: 'container' }, [
      createMockNode('div', { class: 'box' }, [
        createMockNode('p', { class: 'text' }, []),
      ]),
      createMockNode('span', { class: 'box' }, []),
    ]),
  ]),
]);

console.log(myQuerySelector('#app', mockDoc) === mockDoc.children[0].children[0]); // => true
console.log(myQuerySelector('.box', mockDoc) === mockDoc.children[0].children[0].children[0]); // => true
console.log(myQuerySelector('span', mockDoc) === mockDoc.children[0].children[0].children[1]); // => true
console.log(myQuerySelector('div .text', mockDoc) === mockDoc.children[0].children[0].children[0].children[0]); // => true
console.log(myQuerySelector('.not-exist', mockDoc)); // => null
