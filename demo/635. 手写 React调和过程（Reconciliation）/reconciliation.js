/**
 * 手写 React 调和过程（Reconciliation）
 *
 * Reconciliation 是 React 比较新旧两棵虚拟 DOM 树、决定如何用最小代价更新真实 DOM 的过程。
 * 核心规则（启发式）：
 *   1) 不同类型的元素（tag 不同）直接销毁旧树、创建新树
 *   2) 同类型 DOM 元素：保留 DOM 节点，diff 属性（props），递归 diff 子节点
 *   3) 同类型组件：复用实例，更新 props 后重新渲染
 *   4) 列表 diff：借助 key 复用节点，减少创建/销毁
 *
 * 本实现：reconcile(oldVnode, newVnode, container) 在 mock DOM 上做最小更新，
 *   包含 mount / patchProps / diffKeyedChildren / unmount。
 */

// ===== mock DOM =====
class DomNode {
  constructor(tag) {
    this.tagName = tag;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this._text = tag === "#text";
    this.text = "";
  }
  appendChild(n) {
    if (n.parentNode) n.parentNode.removeChild(n);
    this.children.push(n);
    n.parentNode = this;
    return n;
  }
  insertBefore(n, ref) {
    if (n.parentNode) n.parentNode.removeChild(n);
    const idx = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(idx, 0, n);
    n.parentNode = this;
    return n;
  }
  removeChild(n) {
    const i = this.children.indexOf(n);
    if (i >= 0) {
      this.children.splice(i, 1);
      n.parentNode = null;
    }
    return n;
  }
}

function createElement(tag) {
  return new DomNode(tag);
}
function createTextNode(text) {
  const n = new DomNode("#text");
  n.text = text;
  return n;
}

// ===== VNode =====
function h(type, props, ...children) {
  props = props || {};
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? { type: "#text", props: { nodeValue: String(c) }, key: null }
        : c,
    );
  return { type, props: { ...props, children: flat }, key: props.key ?? null };
}

// ===== 创建 DOM =====
function createInstance(vnode) {
  if (vnode.type === "#text") {
    const t = createTextNode(vnode.props.nodeValue);
    vnode.el = t;
    return t;
  }
  const el = createElement(vnode.type);
  vnode.el = el; // 关键：每个 vnode 都要记录对应的 DOM 节点
  // 设置属性
  for (const k in vnode.props) {
    if (k === "children" || k === "key") continue;
    setProp(el, k, vnode.props[k]);
  }
  vnode.props.children.forEach((c) => el.appendChild(createInstance(c)));
  return el;
}

function setProp(el, key, value) {
  if (key === "className") {
    el.attributes.class = value;
  } else if (key === "style" && typeof value === "object") {
    el.attributes.style = Object.entries(value)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  } else {
    el.attributes[key] = value;
  }
}

function removeProp(el, key) {
  delete el.attributes[key === "className" ? "class" : key];
}

// ===== patchProps：属性 diff =====
function patchProps(el, oldProps, newProps) {
  // 移除旧有新无
  for (const k in oldProps) {
    if (k === "children" || k === "key") continue;
    if (!(k in newProps)) removeProp(el, k);
  }
  // 设置新增/变更
  for (const k in newProps) {
    if (k === "children" || k === "key") continue;
    if (oldProps[k] !== newProps[k]) setProp(el, k, newProps[k]);
  }
}

// ===== 核心：reconcile =====
function reconcile(container, oldVnode, newVnode) {
  // 1. 旧节点不存在 —— 挂载
  if (oldVnode == null) {
    const el = createInstance(newVnode);
    container.appendChild(el);
    newVnode.el = el;
    return newVnode;
  }
  // 2. 新节点不存在 —— 卸载
  if (newVnode == null) {
    container.removeChild(oldVnode.el);
    return null;
  }
  // 3. 类型不同 —— 替换
  if (!sameType(oldVnode, newVnode)) {
    const el = createInstance(newVnode);
    container.replaceChild
      ? container.replaceChild(el, oldVnode.el)
      : (container.removeChild(oldVnode.el), container.appendChild(el));
    newVnode.el = el;
    return newVnode;
  }
  // 4. 同类型 —— 复用 DOM，diff 属性 + 子节点
  newVnode.el = oldVnode.el;
  if (newVnode.type === "#text") {
    if (oldVnode.props.nodeValue !== newVnode.props.nodeValue) {
      newVnode.el.text = newVnode.props.nodeValue;
    }
    return newVnode;
  }
  patchProps(newVnode.el, oldVnode.props, newVnode.props);
  reconcileChildren(
    newVnode.el,
    oldVnode.props.children,
    newVnode.props.children,
  );
  return newVnode;
}

function sameType(a, b) {
  return a.type === b.type;
}

// 主动补一个 replaceChild 给 mock DOM
DomNode.prototype.replaceChild = function (newChild, oldChild) {
  const idx = this.children.indexOf(oldChild);
  if (idx >= 0) {
    if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
    this.children.splice(idx, 1, newChild);
    newChild.parentNode = this;
    oldChild.parentNode = null;
  }
  return oldChild;
};

// ===== 子节点 diff（带 key）=====
function reconcileChildren(parentEl, oldChildren, newChildren) {
  let i = 0;
  let oldEnd = oldChildren.length - 1;
  let newEnd = newChildren.length - 1;

  // 头部同步
  while (
    i <= oldEnd &&
    i <= newEnd &&
    sameKey(oldChildren[i], newChildren[i])
  ) {
    reconcile(parentEl, oldChildren[i], newChildren[i]);
    i++;
  }
  // 尾部同步
  while (
    i <= oldEnd &&
    i <= newEnd &&
    sameKey(oldChildren[oldEnd], newChildren[newEnd])
  ) {
    reconcile(parentEl, oldChildren[oldEnd], newChildren[newEnd]);
    oldEnd--;
    newEnd--;
  }
  // 旧节点遍历完 —— 新增
  if (i > oldEnd) {
    const ref =
      newEnd + 1 < newChildren.length ? newChildren[newEnd + 1].el : null;
    while (i <= newEnd) {
      reconcile(parentEl, null, newChildren[i]);
      i++;
    }
    return;
  }
  // 新节点遍历完 —— 卸载
  if (i > newEnd) {
    while (i <= oldEnd) {
      reconcile(parentEl, oldChildren[i], null);
      i++;
    }
    return;
  }
  // 中间未知序列：用 key 映射
  const oldMap = {};
  for (let j = i; j <= oldEnd; j++) oldMap[keyOf(oldChildren[j])] = j;
  let maxIdx = -1;
  for (let j = i; j <= newEnd; j++) {
    const k = keyOf(newChildren[j]);
    const oldIdx = oldMap[k];
    if (oldIdx == null) {
      // 新增
      reconcile(parentEl, null, newChildren[j]);
    } else {
      reconcile(parentEl, oldChildren[oldIdx], newChildren[j]);
      if (oldIdx > maxIdx) {
        maxIdx = oldIdx;
      } else {
        // 相对顺序变了，需要移动到 newChildren[j+1] 之前
        const ref = j + 1 < newChildren.length ? newChildren[j + 1].el : null;
        parentEl.insertBefore(newChildren[j].el, ref);
      }
    }
  }
  // 卸载旧节点中未匹配的
  for (let j = i; j <= oldEnd; j++) {
    const k = keyOf(oldChildren[j]);
    if (newChildren.slice(i, newEnd + 1).every((n) => keyOf(n) !== k)) {
      reconcile(parentEl, oldChildren[j], null);
    }
  }
}

function keyOf(vnode) {
  return vnode.key != null
    ? vnode.key
    : vnode.type + ":" + (vnode.props.nodeValue ?? "");
}
function sameKey(a, b) {
  return keyOf(a) === keyOf(b);
}

// ===== 序列化 =====
function serialize(node) {
  if (node._text) return node.text;
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const inner = node.children.map(serialize).join("");
  return `<${node.tagName}${attrs}>${inner}</${node.tagName}>`;
}

// ===== 测试 =====
const root = createElement("#root");

// 1) 首次挂载
const v1 = h(
  "ul",
  null,
  h("li", { key: "a" }, "A"),
  h("li", { key: "b" }, "B"),
  h("li", { key: "c" }, "C"),
);
reconcile(root, null, v1);
console.log("mount:", serialize(root));
// mount: <#root><ul><li>A</li><li>B</li><li>C</li></ul></#root>

// 2) 顺序调整 + 删除 + 新增
const v2 = h(
  "ul",
  null,
  h("li", { key: "c" }, "C"),
  h("li", { key: "a" }, "A"),
  h("li", { key: "d" }, "D"),
);
reconcile(root, v1, v2);
console.log("update:", serialize(root));
// update: <#root><ul><li>C</li><li>A</li><li>D</li></ul></#root>

// 3) 属性 diff
const v3 = h("div", { className: "box", style: { color: "red" } }, "hello");
const v4 = h("div", { className: "box2", style: { color: "blue" } }, "hi");
const container2 = createElement("#root");
reconcile(container2, null, v3);
console.log("props1:", serialize(container2));
reconcile(container2, v3, v4);
console.log("props2:", serialize(container2));
// props2: <#root><div class="box2" style="color:blue">hi</div></#root>
