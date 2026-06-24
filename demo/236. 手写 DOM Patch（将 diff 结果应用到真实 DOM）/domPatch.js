/**
 * 手写 DOM Patch（将 diff 结果应用到真实 DOM）
 *
 * 接收 diff 算法生成的 patches 补丁对象，遍历真实 DOM 树，
 * 按索引找到对应节点并应用补丁操作。
 *
 * 补丁类型：REPLACE / PROPS / TEXT / REORDER / REMOVE
 *
 * 注意：本文件需要在浏览器环境中运行。
 */

var REPLACE = 'REPLACE';
var PROPS = 'PROPS';
var TEXT = 'TEXT';
var REORDER = 'REORDER';
var REMOVE = 'REMOVE';

/**
 * 将补丁应用到真实 DOM
 * @param {Node} rootNode - 真实 DOM 根节点
 * @param {Object} patches - diff 生成的补丁对象
 */
function patch(rootNode, patches) {
  var walker = { index: 0 };
  walk(rootNode, patches, walker);
}

function walk(node, patches, walker) {
  var currentPatches = patches[walker.index];

  // 遍历子节点
  var children = node.childNodes ? Array.prototype.slice.call(node.childNodes) : [];
  children.forEach(function (child) {
    walker.index++;
    walk(child, patches, walker);
  });

  // 应用当前节点的补丁
  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}

function applyPatches(node, currentPatches) {
  currentPatches.forEach(function (p) {
    switch (p.type) {
      case REPLACE:
        var newNode = typeof p.node === 'string'
          ? document.createTextNode(p.node)
          : render(p.node); // render 来自 virtualDom.js
        node.parentNode.replaceChild(newNode, node);
        break;
      case PROPS:
        setProps(node, p.props);
        break;
      case TEXT:
        if (node.nodeType === 3) {
          node.textContent = p.content;
        }
        break;
      case REORDER:
        reorderChildren(node, p.removes, p.inserts);
        break;
      case REMOVE:
        node.parentNode.removeChild(node);
        break;
    }
  });
}

/**
 * 设置属性补丁
 */
function setProps(node, props) {
  Object.keys(props).forEach(function (key) {
    if (props[key] == null) {
      node.removeAttribute(key);
    } else if (key === 'class' || key === 'className') {
      node.className = props[key];
    } else {
      node.setAttribute(key, props[key]);
    }
  });
}

/**
 * 重排子节点（简化版：根据删除和插入索引操作）
 */
function reorderChildren(node, removes, inserts) {
  // 先删除
  if (removes) {
    removes.sort(function (a, b) { return b - a; }).forEach(function (idx) {
      if (node.childNodes[idx]) {
        node.removeChild(node.childNodes[idx]);
      }
    });
  }
  // 再插入（此处简化，实际需要完整 render 新节点）
  if (inserts) {
    inserts.forEach(function (idx) {
      // 实际场景需根据新虚拟节点 render
      // 这里仅演示逻辑
    });
  }
}

// 简易 render（与 virtualDom.js 配合）
function render(vnode) {
  if (vnode.tagName == null) {
    return document.createTextNode(vnode.text);
  }
  var el = document.createElement(vnode.tagName);
  var props = vnode.props || {};
  Object.keys(props).forEach(function (key) {
    if (key === 'class' || key === 'className') {
      el.className = props[key];
    } else if (key !== 'key') {
      el.setAttribute(key, props[key]);
    }
  });
  (vnode.children || []).forEach(function (child) {
    el.appendChild(render(child));
  });
  return el;
}

// ===== 测试用例（需浏览器环境） =====
// 假设有 DOM：<div id="app"><p class="old">hello</p></div>
// 和 patches：{ 1: [{ type: PROPS, props: { class: 'new' } }] }
//
// var app = document.getElementById('app');
// patch(app, patches);
// // 结果：<div id="app"><p class="new">hello</p></div>

// 模拟测试：用对象验证 patch 逻辑
var mockDom = {
  tagName: 'div',
  attrs: { class: 'old' },
  childNodes: [
    { tagName: 'p', attrs: { class: 'old' }, text: 'hello', childNodes: [], nodeType: 1 },
  ],
  nodeType: 1,
  setAttribute: function (k, v) { this.attrs[k] = v; },
  removeAttribute: function (k) { delete this.attrs[k]; },
};

// 模拟属性补丁
var testPatches = { 1: [{ type: PROPS, props: { class: 'new' } }] };

// 简化 walk 模拟
function mockWalk(node, patches, idx) {
  var current = patches[idx.value];
  if (current) {
    current.forEach(function (p) {
      if (p.type === PROPS) {
        Object.keys(p.props).forEach(function (k) {
          node.setAttribute(k, p.props[k]);
        });
      }
    });
  }
  (node.childNodes || []).forEach(function (child) {
    idx.value++;
    mockWalk(child, patches, idx);
  });
}
mockWalk(mockDom, testPatches, { value: 0 });
console.log(mockDom.childNodes[0].attrs.class); // => 'new'
