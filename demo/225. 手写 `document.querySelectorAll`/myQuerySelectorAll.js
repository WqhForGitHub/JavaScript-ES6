/**
 * 手写 document.querySelectorAll
 *
 * 与 querySelector 类似，但返回所有匹配元素（ NodeList 形式）。
 * 支持简单选择器：tag / #id / .class，以及后代选择器。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

function parseSelector(selector) {
  selector = selector.trim();
  if (selector === '*') {
    return function (node) {
      return true;
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
  var tag = selector.toLowerCase();
  return function (node) {
    return node.tagName && node.tagName.toLowerCase() === tag;
  };
}

/**
 * 查询所有匹配选择器的元素
 * @param {string} selector - CSS 选择器
 * @param {Document|Element} [root=document]
 * @returns {Element[]}
 */
function myQuerySelectorAll(selector, root) {
  root = root || (typeof document !== 'undefined' ? document : null);
  if (!root) return [];

  var parts = selector.trim().split(/\s+/).filter(Boolean);
  var matchers = parts.map(parseSelector);
  var result = [];

  function dfs(node, depth, ancestors) {
    if (!node) return;
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      // 判断 child 是否匹配当前层级选择器
      if (matchers[depth](child)) {
        if (depth === matchers.length - 1) {
          // 最后一级，收集结果
          result.push(child);
        } else {
          // 继续向下匹配后代选择器
          dfs(child, depth + 1);
        }
      }
      // 无论是否匹配，都递归在子树中以当前 depth 搜索
      dfs(child, depth);
    }
  }

  dfs(root, 0);
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
    createMockNode('div', { class: 'box' }, [
      createMockNode('p', { class: 'text' }, []),
      createMockNode('span', { class: 'box' }, []),
    ]),
    createMockNode('div', { class: 'box' }, [
      createMockNode('p', { class: 'text' }, []),
    ]),
  ]),
]);

var boxes = myQuerySelectorAll('.box', mockDoc);
console.log(boxes.length); // => 3

var texts = myQuerySelectorAll('.text', mockDoc);
console.log(texts.length); // => 2

var divTexts = myQuerySelectorAll('div .text', mockDoc);
console.log(divTexts.length); // => 2

var all = myQuerySelectorAll('*', mockDoc);
console.log(all.length); // => 7
