/**
 * 手写 Virtual DOM 的 Diff 算法（双端对比）
 *
 * 双端对比算法（Snabbdom / Vue2 采用）：
 *   对新旧子节点数组各设置头尾两个指针：oldStart、oldEnd、newStart、newEnd
 *   每轮进行 4 次比较，命中即移动对应指针：
 *     1) 旧头 vs 新头 —— 相同则双双右移
 *     2) 旧尾 vs 新尾 —— 相同则双双左移
 *     3) 旧头 vs 新尾 —— 相同则把旧头节点移到旧尾之后，旧头右移、新尾左移
 *     4) 旧尾 vs 新头 —— 相同则把旧尾节点移到旧头之前，旧尾左移、新头右移
 *   4 种都不命中：用 key -> index 的映射表，在旧节点中查找 newStart，
 *                 找到则复用并移动，找不到则创建新节点。
 *   最后处理剩余：旧节点遍历完则新增剩余新节点；新节点遍历完则删除剩余旧节点。
 *
 * 为在 Node.js 中可运行，使用一个极简 mock DOM。
 */

// ===== 极简 mock DOM =====
class MockNode {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.parentNode = null;
    this.textContent = "";
    this._text = tag === "#text";
  }
  appendChild(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
    this.children.push(node);
    node.parentNode = this;
    return node;
  }
  insertBefore(node, ref) {
    if (node.parentNode) node.parentNode.removeChild(node);
    const idx = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(idx, 0, node);
    node.parentNode = this;
    return node;
  }
  removeChild(node) {
    const idx = this.children.indexOf(node);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      node.parentNode = null;
    }
    return node;
  }
  nextSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return this.parentNode.children[idx + 1] || null;
  }
}

// ===== VNode =====
function h(tag, props, children) {
  props = props || {};
  return { tag, props, children: children || [], key: props.key, elm: null };
}

function sameVnode(a, b) {
  return a.key === b.key && a.tag === b.tag;
}

function createTextElm(text) {
  const n = new MockNode("#text");
  n.textContent = text;
  return n;
}

function createElm(vnode) {
  if (vnode.tag === "#text") {
    vnode.elm = createTextElm(vnode.props.text || "");
  } else {
    const el = new MockNode(vnode.tag);
    if (typeof vnode.children === "string") {
      el.appendChild(createTextElm(vnode.children));
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((c) => el.appendChild(createElm(c)));
    }
    vnode.elm = el;
  }
  return vnode.elm;
}

// ===== patchVnode：在节点级别复用 DOM =====
function patchVnode(oldVnode, newVnode) {
  const elm = (newVnode.elm = oldVnode.elm);
  const oldCh = oldVnode.children;
  const newCh = newVnode.children;
  if (oldVnode === newVnode) return;
  if (typeof newCh === "string") {
    elm.children = [];
    elm.appendChild(createTextElm(newCh));
  } else if (Array.isArray(oldCh)) {
    if (Array.isArray(newCh)) {
      updateChildren(elm, oldCh, newCh);
    } else {
      elm.children = [];
    }
  } else {
    elm.children = [];
    if (Array.isArray(newCh)) {
      newCh.forEach((c) => elm.appendChild(createElm(c)));
    } else if (typeof newCh === "string") {
      elm.appendChild(createTextElm(newCh));
    }
  }
}

// ===== 核心：双端 diff =====
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  let oldStartVnode = oldCh[oldStartIdx];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[newStartIdx];
  let newEndVnode = newCh[newEndIdx];

  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 头头
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 尾尾
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 旧头 / 新尾
      patchVnode(oldStartVnode, newEndVnode);
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling());
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 旧尾 / 新头
      patchVnode(oldEndVnode, newStartVnode);
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 都不命中：用 key 映射查找
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = oldKeyToIdx[newStartVnode.key];
      if (idxInOld == null) {
        // 新节点：创建并插到 oldStart 前
        parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
      } else {
        elmToMove = oldCh[idxInOld];
        if (sameVnode(elmToMove, newStartVnode)) {
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined; // 标记已处理
          parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
        } else {
          parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // 收尾：新增或删除
  if (oldStartIdx > oldEndIdx) {
    const refElm =
      newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
    for (; newStartIdx <= newEndIdx; newStartIdx++) {
      const node = newCh[newStartIdx];
      const elm = node.elm ? node.elm : createElm(node);
      parentElm.insertBefore(elm, refElm);
    }
  } else if (newStartIdx > newEndIdx) {
    for (; oldStartIdx <= oldEndIdx; oldStartIdx++) {
      if (oldCh[oldStartIdx]) {
        parentElm.removeChild(oldCh[oldStartIdx].elm);
      }
    }
  }
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {};
  for (let i = beginIdx; i <= endIdx; i++) {
    const key = children[i] ? children[i].key : undefined;
    if (key != null) {
      map[key] = i;
    }
  }
  return map;
}

// ===== 序列化 mock DOM =====
function serialize(node) {
  if (node._text) return node.textContent;
  const inner = node.children.map(serialize).join("");
  return `<${node.tagName}>${inner}</${node.tagName}>`;
}

// ===== 测试 =====
// 旧：A B C D E  ->  新：D A B F E
const oldChildren = ["A", "B", "C", "D", "E"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);
const newChildren = ["D", "A", "B", "F", "E"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);

const container = new MockNode("div");
oldChildren.forEach((c) => container.appendChild(createElm(c)));

console.log("before:", serialize(container));
// before: <div><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div></div>

updateChildren(container, oldChildren, newChildren);

console.log("after: ", serialize(container));
// after:  <div><div>D</div><div>A</div><div>B</div><div>F</div><div>E</div></div>

// 倒序：A B C -> C B A
const oldCh2 = ["A", "B", "C"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);
const newCh2 = ["C", "B", "A"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);
const container2 = new MockNode("div");
oldCh2.forEach((c) => container2.appendChild(createElm(c)));
updateChildren(container2, oldCh2, newCh2);
console.log("reverse:", serialize(container2));
// reverse: <div><div>C</div><div>B</div><div>A</div></div>

// 纯新增 / 删除
const oldCh3 = ["A", "B"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);
const newCh3 = ["A", "B", "C", "D"].map((k) =>
  h("div", { key: k }, [h("#text", { text: k })]),
);
const container3 = new MockNode("div");
oldCh3.forEach((c) => container3.appendChild(createElm(c)));
updateChildren(container3, oldCh3, newCh3);
console.log("append:", serialize(container3));
// append: <div><div>A</div><div>B</div><div>C</div><div>D</div></div>
