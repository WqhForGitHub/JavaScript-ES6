/**
 * 手写简易 Hydration（水合）
 *
 * Hydration：服务端返回的 HTML 已经是完整的 DOM，客户端不再重建 DOM，
 *   而是「复用」这些 DOM 节点，只做两件事：
 *     1) 递归校验：vnode 树与现有 DOM 结构是否一致（tag / 属性 / 文本）
 *     2) 挂载事件：把 vnode 中的事件 handler 绑定到对应 DOM 节点
 *   若发现不一致（mismatch），则丢弃该子树的服务端 DOM、客户端重新创建。
 *
 * 本实现：
 *   - hydrateNode(vnode, dom, parentDom) 单节点水合
 *   - 递归 hydrateChildren
 *   - mismatch 时调用 createDOM 重建并替换
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
    this._listeners = {};
  }
  appendChild(c) {
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i >= 0) {
      this.children.splice(i, 1);
      c.parentNode = null;
    }
    return c;
  }
  replaceChild(n, o) {
    const i = this.children.indexOf(o);
    if (i >= 0) {
      n.parentNode = this;
      this.children[i] = n;
      o.parentNode = null;
    }
    return o;
  }
  setAttribute(k, v) {
    this.attributes[k] = v;
  }
  addEventListener(t, fn) {
    (this._listeners[t] = this._listeners[t] || []).push(fn);
  }
  dispatch(t) {
    (this._listeners[t] || []).forEach((fn) => fn({ type: t, target: this }));
  }
}

// ===== vnode =====
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? { type: "#text", props: { nodeValue: String(c) } }
        : c,
    );
  return { type, props: { ...(props || {}), children: flat }, el: null };
}

// ===== 从 vnode 创建 DOM（mismatch 时用）=====
function createDOM(vnode) {
  if (vnode == null) return null;
  if (vnode.type === "#text") {
    const n = new DomNode("#text");
    n.text = vnode.props.nodeValue;
    vnode.el = n;
    return n;
  }
  const el = new DomNode(vnode.type);
  for (const k in vnode.props) {
    if (k === "children") continue;
    if (k.startsWith("on")) continue;
    el.setAttribute(k === "className" ? "class" : k, vnode.props[k]);
  }
  (vnode.props.children || []).forEach((c) => el.appendChild(createDOM(c)));
  vnode.el = el;
  return el;
}

// ===== hydrate 核心 =====
const hydrationWarnings = [];
let domIndex = 0;

function hydrateNode(vnode, dom, parentDom) {
  if (vnode == null) return dom;

  // 1) 类型不匹配 -> 丢弃服务端 DOM，客户端重建
  if (!dom || !sameType(vnode, dom)) {
    hydrationWarnings.push(
      `mismatch: 期望 <${vnode.type || vnode.props.nodeValue}>，实际 <${dom ? dom.tagName : "null"}>`,
    );
    const newDom = createDOM(vnode);
    if (parentDom && dom) parentDom.replaceChild(newDom, dom);
    else if (parentDom) parentDom.appendChild(newDom);
    return newDom;
  }

  vnode.el = dom;

  if (vnode.type === "#text") {
    // 2) 文本节点：校验文本内容
    if (dom.text !== vnode.props.nodeValue) {
      hydrationWarnings.push(
        `text mismatch: 服务端="${dom.text}" 客户端="${vnode.props.nodeValue}"`,
      );
      dom.text = vnode.props.nodeValue; // 以客户端为准
    }
    return dom;
  }

  // 3) 元素节点：校验属性
  for (const k in vnode.props) {
    if (k === "children") continue;
    if (k.startsWith("on")) continue;
    const attrName = k === "className" ? "class" : k;
    const expected = String(vnode.props[k]);
    const actual = dom.attributes[attrName];
    if (actual !== expected) {
      hydrationWarnings.push(
        `attr mismatch <${vnode.type}> ${attrName}: 服务端=${actual} 客户端=${expected}`,
      );
      dom.setAttribute(attrName, expected);
    }
  }

  // 4) 挂载事件
  for (const k in vnode.props) {
    if (k.startsWith("on") && typeof vnode.props[k] === "function") {
      const type = k.slice(2).toLowerCase();
      dom.addEventListener(type, vnode.props[k]);
    }
  }

  // 5) 递归水合子节点
  hydrateChildren(vnode.props.children || [], dom);
  return dom;
}

function hydrateChildren(vchildren, parentDom) {
  let i = 0;
  for (; i < vchildren.length; i++) {
    const v = vchildren[i];
    const dom = parentDom.children[i];
    hydrateNode(v, dom, parentDom);
  }
  // 服务端 DOM 多出的子节点：删除
  while (parentDom.children.length > vchildren.length) {
    const extra = parentDom.children[vchildren.length];
    hydrationWarnings.push(`多余的服务端节点 <${extra.tagName}> 被移除`);
    parentDom.removeChild(extra);
  }
}

function sameType(vnode, dom) {
  if (vnode.type === "#text") return dom._text;
  return dom.tagName === vnode.type;
}

// ===== 测试 =====
// 1) 完全匹配的水合
console.log("=== 场景1：结构完全匹配 ===");
const v1 = h(
  "div",
  { id: "app" },
  h("h1", null, "Title"),
  h("button", { onClick: () => console.log("  clicked!") }, "ok"),
);
const serverDom1 = createDOM(v1); // 模拟服务端产出的 DOM（无事件）
// 清空事件模拟（createDOM 本就不挂事件，但 el 引用已建立，重置）
v1.el = null;
function stripEls(vnode) {
  vnode.el = null;
  (vnode.props.children || []).forEach(stripEls);
}
stripEls(v1);
hydrationWarnings.length = 0;
hydrateNode(v1, serverDom1, null);
console.log("warnings:", hydrationWarnings.length); // 0
serverDom1.children[1].dispatch("click"); // clicked!

// 2) 文本不匹配
console.log("\n=== 场景2：文本不匹配（以客户端为准）===");
const v2 = h("p", null, "client text");
const serverP = createDOM(h("p", null, "server text"));
stripEls(v2);
hydrationWarnings.length = 0;
hydrateNode(v2, serverP, null);
console.log(warnings0(hydrationWarnings)); // text mismatch...
console.log("修正后文本:", serverP.children[0].text); // client text

// 3) tag 不匹配：丢弃重建
console.log("\n=== 场景3：tag 不匹配，重建子树 ===");
const v3 = h("div", null, h("span", null, "ok"));
const serverDiv = createDOM(h("div", null, h("p", null, "ok"))); // 服务端是 <p>
stripEls(v3);
hydrationWarnings.length = 0;
hydrateNode(v3, serverDiv, null);
console.log(warnings0(hydrationWarnings)); // mismatch: 期望 <span>，实际 <p>
console.log("重建后子节点:", serverDiv.children[0].tagName); // span

// 4) 属性不匹配
console.log("\n=== 场景4：属性不匹配 ===");
const v4 = h("a", { href: "/new", target: "_blank" }, "link");
const serverA = createDOM(h("a", { href: "/old" }, "link"));
stripEls(v4);
hydrationWarnings.length = 0;
hydrateNode(v4, serverA, null);
console.log("warnings:", hydrationWarnings.length); // 2（href + target）
console.log("修正后 href:", serverA.attributes.href); // /new
console.log("修正后 target:", serverA.attributes.target); // _blank

// 5) 服务端多出节点
console.log("\n=== 场景5：服务端多出节点被移除 ===");
const v5 = h("ul", null, h("li", null, "a"));
const serverUl = createDOM(
  h("ul", null, h("li", null, "a"), h("li", null, "b")),
);
stripEls(v5);
hydrationWarnings.length = 0;
hydrateNode(v5, serverUl, null);
console.log("children count after hydrate:", serverUl.children.length); // 1
console.log(warnings0(hydrationWarnings)); // 多余的服务端节点 <li> 被移除

function warnings0(arr) {
  return arr[0] || "(none)";
}
