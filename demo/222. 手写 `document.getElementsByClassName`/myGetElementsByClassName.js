/**
 * 手写 document.getElementsByClassName
 *
 * 通过深度优先遍历 DOM 树，收集所有 className 包含指定类的元素。
 * 原生方法返回的是 HTMLCollection（动态集合），这里返回静态数组模拟。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 查找所有包含指定 class 的元素
 * @param {string} className - 一个或多个以空格分隔的类名
 * @param {Document|Element} [root=document]
 * @returns {Element[]}
 */
function myGetElementsByClassName(className, root) {
  root = root || (typeof document !== 'undefined' ? document : null);
  if (!root) return [];

  var result = [];
  // 将传入的类名拆分为数组，需要全部匹配
  var targetClasses = className.trim().split(/\s+/).filter(Boolean);

  function dfs(node) {
    if (!node) return;
    var nodeClass = node.getAttribute ? node.getAttribute('class') : null;
    if (nodeClass) {
      var nodeClasses = nodeClass.trim().split(/\s+/);
      // 检查是否包含全部目标类名
      var allMatch = targetClasses.every(function (c) {
        return nodeClasses.indexOf(c) !== -1;
      });
      if (allMatch) {
        result.push(node);
      }
    }
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      dfs(children[i]);
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
    createMockNode('div', { class: 'container' }, [
      createMockNode('div', { class: 'box active' }, []),
      createMockNode('div', { class: 'box' }, []),
      createMockNode('span', { class: 'active' }, []),
    ]),
  ]),
]);

var boxes = myGetElementsByClassName('box', mockDoc);
console.log(boxes.length); // => 2
console.log(boxes[0].attributes.class); // => 'box active'
console.log(boxes[1].attributes.class); // => 'box'

var actives = myGetElementsByClassName('active', mockDoc);
console.log(actives.length); // => 2

// 同时匹配多个类名（需要同时拥有 box 和 active）
var boxActives = myGetElementsByClassName('box active', mockDoc);
console.log(boxActives.length); // => 1
