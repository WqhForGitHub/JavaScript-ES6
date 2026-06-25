/**
 * 手写简易同构应用（Isomorphic）
 *
 * 同构：服务端和客户端共用同一套组件代码。
 *   - 服务端入口：把组件 renderToString 成 HTML 返回（首屏快、SEO 友好）
 *   - 客户端入口：拿到服务端 HTML 后，不再重新创建 DOM，而是 hydrate
 *     （水合）——复用现有 DOM、只挂载事件、建立后续更新能力
 *   - 两端用「同一个 App 组件」，保证产出结构一致
 *
 * 本例：
 *   - shared.js：App 组件（两端共用）
 *   - server entry：renderToString -> HTML
 *   - client entry：把 HTML 还原成 mock DOM（无事件），再 hydrate 挂事件
 */

// ===== 共享：vnode + 组件 =====
function h(type, props, ...children) {
  const flat = children
    .flat()
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? { type: "#text", props: { nodeValue: String(c) } }
        : c,
    );
  return { type, props: { ...(props || {}), children: flat } };
}

// 共享的业务组件：一个计数器 UI
function Counter(props) {
  return h(
    "div",
    { className: "counter" },
    h("h1", null, props.title),
    h("p", null, "count = ", props.count),
    h("button", { onClick: props.onIncrement }, "+1"),
    h("button", { onClick: props.onReset }, "reset"),
  );
}

// ===== mock DOM（支持属性 / 文本 / 事件 / 序列化）=====
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
  setAttribute(k, v) {
    this.attributes[k] = v;
  }
  appendChild(c) {
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  addEventListener(type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  }
  dispatch(type) {
    (this._listeners[type] || []).forEach((fn) => fn({ type, target: this }));
  }
}
function createEl(tag) {
  return new DomNode(tag);
}

// ===== 服务端：renderToString =====
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function renderToString(vnode) {
  if (vnode == null || vnode === false) return "";
  if (typeof vnode === "string" || typeof vnode === "number")
    return escapeHtml(vnode);
  if (typeof vnode.type === "function")
    return renderToString(vnode.type(vnode.props));
  if (vnode.type === "#text") return escapeHtml(vnode.props.nodeValue);
  const tag = vnode.type;
  const attrs = [];
  for (const k in vnode.props) {
    if (k === "children") continue;
    if (k.startsWith("on")) continue; // 事件不进 HTML
    const v = vnode.props[k];
    attrs.push(`${k === "className" ? "class" : k}="${escapeHtml(v)}"`);
  }
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  const inner = (vnode.props.children || []).map(renderToString).join("");
  return `<${tag}${attrStr}>${inner}</${tag}>`;
}

// ===== 客户端：把 vnode 映射到已有 DOM（hydrate）=====
// 这里简化：根据 vnode 构建一份与服务端结构一致的 mock DOM（无事件），
// 然后 hydrate 递归挂载事件、校验结构
function buildServerDOM(vnode) {
  if (vnode == null) return null;
  if (typeof vnode.type === "function")
    return buildServerDOM(vnode.type(vnode.props));
  if (vnode.type === "#text") {
    const n = createEl("#text");
    n.text = vnode.props.nodeValue;
    return n;
  }
  const el = createEl(vnode.type);
  for (const k in vnode.props) {
    if (k === "children") continue;
    if (k.startsWith("on")) continue;
    el.setAttribute(k === "className" ? "class" : k, vnode.props[k]);
  }
  (vnode.props.children || []).forEach((c) =>
    el.appendChild(buildServerDOM(c)),
  );
  return el;
}

let hydrateLog = [];
function hydrate(vnode, dom) {
  if (vnode == null) return;
  if (typeof vnode.type === "function") {
    return hydrate(vnode.type(vnode.props), dom);
  }
  if (vnode.type === "#text") {
    if (dom.tagName !== "#text" || dom.text !== vnode.props.nodeValue) {
      hydrateLog.push(
        `text mismatch: dom="${dom.text}" vs vnode="${vnode.props.nodeValue}"`,
      );
    }
    return;
  }
  // 校验 tag
  if (dom.tagName !== vnode.type) {
    hydrateLog.push(`tag mismatch: dom=${dom.tagName} vs vnode=${vnode.type}`);
    return;
  }
  // 挂载事件（SSR 中事件没进 HTML，hydrate 时补上）
  for (const k in vnode.props) {
    if (k.startsWith("on") && typeof vnode.props[k] === "function") {
      const type = k.slice(2).toLowerCase();
      dom.addEventListener(type, vnode.props[k]);
      hydrateLog.push(`attached ${type} on <${dom.tagName}>`);
    }
  }
  // 递归子节点
  const vchildren = vnode.props.children || [];
  for (let i = 0; i < vchildren.length; i++) {
    hydrate(vchildren[i], dom.children[i]);
  }
}

// ===== 运行同构流程 =====
// 0) 共享状态
const state = { count: 0 };

// 1) 服务端：用初始 state 渲染 HTML
function ServerEntry() {
  const vnode = h(Counter, {
    title: "Isomorphic Counter",
    count: state.count,
    onIncrement: () => {}, // 服务端事件无意义，但保持 props 一致
    onReset: () => {},
  });
  return renderToString(vnode);
}
const html = ServerEntry();
console.log("=== 服务端渲染的 HTML ===");
console.log(html);
// <div class="counter"><h1>Isomorphic Counter</h1><p>count = 0</p><button>+1</button><button>reset</button></div>

// 2) 客户端：拿到 HTML 后，DOM 已存在（这里用 buildServerDOM 模拟），
//    然后用「同一个 App」hydrate 挂载事件
function ClientEntry() {
  const vnode = h(Counter, {
    title: "Isomorphic Counter",
    count: state.count,
    onIncrement: () => {
      state.count++;
      console.log("  [client] +1 -> count =", state.count);
    },
    onReset: () => {
      state.count = 0;
      console.log("  [client] reset -> count =", state.count);
    },
  });
  // 模拟浏览器中已存在的服务端 DOM
  const rootDom = buildServerDOM(vnode);
  hydrateLog = [];
  hydrate(vnode, rootDom);
  console.log("\n=== hydrate 日志 ===");
  hydrateLog.forEach((l) => console.log("  " + l));

  return rootDom;
}
const rootDom = ClientEntry();

// 3) 模拟用户交互：找到 +1 按钮并点击
function findButtons(node) {
  const result = [];
  if (node.tagName === "button") result.push(node);
  for (const c of node.children || []) result.push(...findButtons(c));
  return result;
}
const [incBtn, resetBtn] = findButtons(rootDom);

console.log("\n=== 用户交互（事件已在 hydrate 时挂好）===");
incBtn.dispatch("click"); // [client] +1 -> count = 1
incBtn.dispatch("click"); // [client] +1 -> count = 2
resetBtn.dispatch("click"); // [client] reset -> count = 0

console.log("\n最终 count =", state.count); // 0
