/**
 * 手写 document.getElementById
 *
 * 通过递归遍历 DOM 树，查找 id 属性等于指定值的元素。
 * 原生 getElementById 是 O(1) 级别（浏览器内部用 id 索引），
 * 这里用深度优先遍历模拟其行为。
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

/**
 * 在指定根节点下查找 id 为指定值的元素
 * @param {string} id - 要查找的元素 id
 * @param {Document|Element} [root=document] - 查找的根节点
 * @returns {Element | null}
 */
function myGetElementById(id, root) {
  root = root || (typeof document !== "undefined" ? document : null);
  if (!root) return null;

  // 使用深度优先遍历
  function dfs(node) {
    if (!node) return null;
    // 检查当前节点
    if (node.getAttribute && node.getAttribute("id") === id) {
      return node;
    }
    // 遍历子节点
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      var result = dfs(children[i]);
      if (result) return result;
    }
    return null;
  }

  return dfs(root);
}

// ===== 测试用例（需浏览器环境） =====
// 假设有如下结构：
// <div id="app">
//   <div id="header">Header</div>
//   <div id="content">
//     <p id="title">Hello</p>
//   </div>
// </div>
//
// myGetElementById('title') // => <p id="title">Hello</p>
// myGetElementById('header') // => <div id="header">Header</div>
// myGetElementById('not-exist') // => null

// 模拟 DOM 节点进行测试
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

var mockDoc = createMockNode("html", {}, [
  createMockNode("body", {}, [
    createMockNode("div", { id: "app" }, [
      createMockNode("div", { id: "header" }, []),
      createMockNode("div", { id: "content" }, [
        createMockNode("p", { id: "title" }, []),
      ]),
    ]),
  ]),
]);

console.log(
  myGetElementById("title", mockDoc) ===
    mockDoc.children[0].children[0].children[1].children[0],
); // => true
console.log(
  myGetElementById("app", mockDoc) === mockDoc.children[0].children[0],
); // => true
console.log(myGetElementById("not-exist", mockDoc)); // => null
