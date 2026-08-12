const tree = {
  "首页": { "产品": { "手机": {}, "电脑": { "笔记本": {}, "台式机": {} } }, "服务": { "咨询": {}, "支持": {} } }
};
let path = [];
function render() {
  const crumb = document.getElementById("crumb");
  crumb.innerHTML = `<a>首页</a>`;
  let node = tree["首页"];
  path.forEach((p, i) => {
    node = node[p];
    crumb.innerHTML += `<span class="sep">/</span>` + (i === path.length - 1 ? `<span class="cur">${p}</span>` : `<a>${p}</a>`);
  });
  crumb.querySelectorAll("a").forEach((a, i) => a.onclick = () => { path = path.slice(0, i - 0 + (i === 0 ? 0 : 0)); if (i === 0) path = []; else path = path.slice(0, i); render(); });
  const c = document.getElementById("content");
  const keys = Object.keys(node);
  if (!keys.length) { c.innerHTML = `<h3>${path[path.length - 1] || "首页"}</h3><p>这是叶子节点，无更多子目录。</p>`; return; }
  c.innerHTML = `<h3>${path.length ? path[path.length - 1] : "首页"}</h3><ul>` + keys.map(k => `<li>📁 ${k}</li>`).join("") + "</ul>";
  c.querySelectorAll("li").forEach(li => li.onclick = () => { path.push(li.textContent.replace("📁 ", "")); render(); });
}
render();