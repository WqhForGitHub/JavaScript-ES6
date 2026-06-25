/**
 * 手写 DOM Diff 算法
 *
 * 比较新旧两棵虚拟 DOM 树，找出差异并生成补丁对象（patches）。
 * 采用同层比较策略（不跨层级比较），子节点使用 key 进行复用优化。
 *
 * 补丁类型：
 *   - REPLACE：节点替换
 *   - PROPS：属性变更
 *   - TEXT：文本变更
 *   - REORDER：子节点重排序（含插入、删除、移动）
 *   - REMOVE：节点删除
 */

var REPLACE = "REPLACE";
var PROPS = "PROPS";
var TEXT = "TEXT";
var REORDER = "REORDER";
var REMOVE = "REMOVE";

/**
 * 比较两棵虚拟 DOM 树
 * @param {Object} oldNode - 旧虚拟节点
 * @param {Object} newNode - 新虚拟节点
 * @returns {Object} patches - 补丁对象，key 为节点索引
 */
function diff(oldNode, newNode) {
  var patches = {};
  var index = { value: 0 };
  dfsWalk(oldNode, newNode, index, patches);
  return patches;
}

function dfsWalk(oldNode, newNode, index, patches) {
  var currentIndex = index.value;
  var currentPatch = [];

  // 新节点不存在 -> 删除
  if (newNode == null) {
    currentPatch.push({ type: REMOVE });
  }
  // 都是文本节点且内容不同
  else if (isTextNode(oldNode) && isTextNode(newNode)) {
    if (oldNode.text !== newNode.text) {
      currentPatch.push({ type: TEXT, content: newNode.text });
    }
  }
  // 标签名相同 -> 比较 props 和 children
  else if (oldNode.tagName === newNode.tagName) {
    // 比较属性
    var propsPatches = diffProps(oldNode.props || {}, newNode.props || {});
    if (Object.keys(propsPatches).length > 0) {
      currentPatch.push({ type: PROPS, props: propsPatches });
    }
    // 比较子节点
    diffChildren(
      oldNode.children || [],
      newNode.children || [],
      index,
      patches,
      currentIndex,
    );
  }
  // 节点类型不同 -> 替换
  else {
    currentPatch.push({ type: REPLACE, node: newNode });
  }

  if (currentPatch.length > 0) {
    patches[currentIndex] = currentPatch;
  }
}

/**
 * 比较子节点（使用 key 进行 diff）
 */
function diffChildren(oldChildren, newChildren, index, patches, currentIndex) {
  var oldKeyIndex = {};
  var newKeyIndex = {};
  var oldFree = [];
  var newFree = [];

  // 收集旧子节点的 key 映射
  oldChildren.forEach(function (child, i) {
    if (child.key != null) {
      oldKeyIndex[child.key] = i;
    } else {
      oldFree.push(child);
    }
  });

  // 收集新子节点的 key 映射
  newChildren.forEach(function (child, i) {
    if (child.key != null) {
      newKeyIndex[child.key] = i;
    } else {
      newFree.push(child);
    }
  });

  // 简化：标记子节点重排（记录新顺序对应的旧索引）
  var moves = [];
  var removed = [];
  var inserted = [];

  // 找出被删除的 key
  Object.keys(oldKeyIndex).forEach(function (key) {
    if (!(key in newKeyIndex)) {
      removed.push(oldKeyIndex[key]);
    }
  });

  // 找出新插入的 key
  Object.keys(newKeyIndex).forEach(function (key) {
    if (!(key in oldKeyIndex)) {
      inserted.push(newKeyIndex[key]);
    }
  });

  if (removed.length > 0 || inserted.length > 0) {
    patches[currentIndex] = patches[currentIndex] || [];
    patches[currentIndex].unshift({
      type: REORDER,
      removes: removed,
      inserts: inserted,
    });
  }

  // 递归比较同 key 的子节点
  index.value++;
  var oldIndex = 0;
  newChildren.forEach(function (newChild) {
    if (newChild.key != null && newChild.key in oldKeyIndex) {
      var oi = oldKeyIndex[newChild.key];
      var oldChild = oldChildren[oi];
      // 跳过中间的旧节点索引
      while (oldIndex < oi) {
        index.value++;
        oldIndex++;
      }
      dfsWalk(oldChild, newChild, index, patches);
      oldIndex++;
    } else {
      // 无 key 的新节点，作为替换处理
      var oldFreeChild = oldFree.shift();
      if (oldFreeChild) {
        dfsWalk(oldFreeChild, newChild, index, patches);
      } else {
        index.value++;
        patches[index.value] = [{ type: REPLACE, node: newChild }];
      }
    }
  });
}

/**
 * 比较属性差异
 */
function diffProps(oldProps, newProps) {
  var patches = {};
  // 新增或修改的属性
  Object.keys(newProps).forEach(function (key) {
    if (oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
    }
  });
  // 删除的属性
  Object.keys(oldProps).forEach(function (key) {
    if (!(key in newProps)) {
      patches[key] = null;
    }
  });
  return patches;
}

function isTextNode(node) {
  return node && node.tagName == null && node.text != null;
}

// ===== 测试用例 =====
function h(tag, props, children) {
  props = props || {};
  return {
    tagName: tag,
    props: props,
    key: props.key,
    children:
      children == null ? [] : Array.isArray(children) ? children : [children],
    text: null,
  };
}
function text(t) {
  return {
    tagName: null,
    props: {},
    key: undefined,
    children: [],
    text: String(t),
  };
}

// 场景1：属性变更
var old1 = h("div", { id: "app", class: "old" }, [text("hello")]);
var new1 = h("div", { id: "app", class: "new" }, [text("hello")]);
var patches1 = diff(old1, new1);
console.log("属性变更 patches:", JSON.stringify(patches1));
// => 包含 PROPS 类型补丁，class: 'new'

// 场景2：文本变更
var old2 = h("p", {}, [text("old text")]);
var new2 = h("p", {}, [text("new text")]);
var patches2 = diff(old2, new2);
console.log("文本变更 patches:", JSON.stringify(patches2));
// => 包含 TEXT 类型补丁

// 场景3：节点替换
var old3 = h("div", {}, []);
var new3 = h("span", {}, []);
var patches3 = diff(old3, new3);
console.log("节点替换 patches:", JSON.stringify(patches3));
// => 包含 REPLACE 类型补丁

// 场景4：子节点增删（带 key）
var old4 = h("ul", {}, [
  h("li", { key: "a" }, [text("A")]),
  h("li", { key: "b" }, [text("B")]),
  h("li", { key: "c" }, [text("C")]),
]);
var new4 = h("ul", {}, [
  h("li", { key: "a" }, [text("A")]),
  h("li", { key: "c" }, [text("C")]),
  h("li", { key: "d" }, [text("D")]),
]);
var patches4 = diff(old4, new4);
console.log("子节点 diff patches:", JSON.stringify(patches4));
// => 包含 REORDER 补丁：删除 b，插入 d
