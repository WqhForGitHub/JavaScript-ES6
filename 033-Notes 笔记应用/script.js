let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let cur = null;
function save() { localStorage.setItem("notes", JSON.stringify(notes)); }
function tsFmt(t) { return new Date(t).toLocaleString("zh-CN"); }
function render() {
  const list = document.getElementById("list"); list.innerHTML = "";
  notes.forEach(n => {
    const d = document.createElement("div");
    d.className = "item" + (n.id === cur ? " active" : "");
    d.innerHTML = `<span class="del">✕</span><h4></h4><small>${tsFmt(n.updated)}</small>`;
    d.querySelector("h4").textContent = n.title || "未命名";
    d.querySelector(".del").onclick = e => { e.stopPropagation(); notes = notes.filter(x => x.id !== n.id); if (cur === n.id) cur = null; save(); load(); render(); };
    d.onclick = () => { cur = n.id; load(); render(); };
    list.appendChild(d);
  });
}
function load() {
  const n = notes.find(x => x.id === cur);
  if (!n) { document.getElementById("title").value = ""; document.getElementById("body").value = ""; document.getElementById("meta").textContent = ""; return; }
  document.getElementById("title").value = n.title;
  document.getElementById("body").value = n.body;
  document.getElementById("meta").textContent = "更新于 " + tsFmt(n.updated);
}
function update() {
  const n = notes.find(x => x.id === cur); if (!n) return;
  n.title = document.getElementById("title").value;
  n.body = document.getElementById("body").value;
  n.updated = Date.now(); save(); render(); load();
}
document.getElementById("new").onclick = () => {
  const n = { id: Date.now(), title: "", body: "", updated: Date.now() };
  notes.unshift(n); cur = n.id; save(); load(); render();
  document.getElementById("title").focus();
};
document.getElementById("title").oninput = update;
document.getElementById("body").oninput = update;
if (!notes.length) document.getElementById("new").click(); else { cur = notes[0].id; load(); }
render();