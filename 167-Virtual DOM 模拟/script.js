function diff(oldNode, newNode) {
  const patches = [];
  if (!oldNode) patches.push({ type: "CREATE", node: newNode });
  else if (!newNode) patches.push({ type: "REMOVE" });
  else if (oldNode.tag !== newNode.tag || oldNode.props.nodeValue !== newNode.props.nodeValue) patches.push({ type: "REPLACE", node: newNode });
  else {
    const propPatches = {};
    for (const k in newNode.props) if (oldNode.props[k] !== newNode.props[k]) propPatches[k] = newNode.props[k];
    for (const k in oldNode.props) if (!(k in newNode.props)) propPatches[k] = undefined;
    if (Object.keys(propPatches).length) patches.push({ type: "PROPS", props: propPatches });
    const len = Math.max(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < len; i++) diff(oldNode.children[i], newNode.children[i]).forEach(p => patches.push({ ...p, path: i }));
  }
  return patches;
}
let n = 0;
function vnode(n) { return { tag: "div", props: { class: "box" }, children: [{ tag: "h2", props: {}, children: [{ tag: "TEXT", props: { nodeValue: "count = " + n }, children: [] }] }, { tag: "button", props: { onClick: () => rerender() }, children: [{ tag: "TEXT", props: { nodeValue: "rerender" }, children: [] }] }] }; }
let cur = vnode(0);
function apply(parent, patches) { patches.forEach(p => console.log(p)); }
function rerender() { n++; const next = vnode(n); const patches = diff(cur, next); document.getElementById("vdom").textContent = JSON.stringify(next, null, 2); apply(null, patches); const app = document.getElementById("app"); app.innerHTML = "<h2>count = " + n + "</h2><button id='b'>rerender</button>"; document.getElementById("b").onclick = rerender; console.log("diff patches:", patches); cur = next; }
document.getElementById("vdom").textContent = JSON.stringify(cur, null, 2);
app.innerHTML = "<h2>count = " + n + "</h2><button id='b'>rerender</button>";
document.getElementById("b").onclick = rerender;