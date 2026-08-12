// --- Mini React ---
function h(tag, props = {}, ...children) {
  return { tag, props: props || {}, children: children.flat().map(c => typeof c === "object" ? c : { tag: "TEXT", props: { nodeValue: String(c) }, children: [] }) };
}
function create(vnode) {
  if (vnode.tag === "TEXT") { const t = document.createTextNode(vnode.props.nodeValue); vnode.el = t; return t; }
  const el = document.createElement(vnode.tag);
  for (const k in vnode.props) { if (k === "style") Object.assign(el.style, vnode.props[k]); else if (k.startsWith("on")) el[k.toLowerCase()] = vnode.props[k]; else el.setAttribute(k, vnode.props[k]); }
  vnode.children.forEach(c => el.appendChild(create(c)));
  vnode.el = el; return el;
}
function render(vnode, container) { container.innerHTML = ""; container.appendChild(create(vnode)); }
// --- 使用 ---
let n = 0;
function App() {
  return h("div", { style: { textAlign: "center" } },
    h("h1", null, "Mini React counter"),
    h("p", null, "已点击：" + n),
    h("button", { onClick: () => { n++; rerender(); } }, "+1"),
    h("button", { onClick: () => { n = 0; rerender(); } }, "reset")
  );
}
function rerender() { render(App(), document.getElementById("app")); }
rerender();