let files = JSON.parse(localStorage.getItem("ide") || "[]") || [{ name: "index.html", content: "<h1>Hello IDE</h1>" }];
let active = 0;
function save() { if (files[active]) files[active].content = document.getElementById("ed").value; localStorage.setItem("ide", JSON.stringify(files)); }
function render() {
  const ul = document.getElementById("files"); ul.innerHTML = "";
  files.forEach((f, i) => { const li = document.createElement("li"); li.className = i === active ? "active" : ""; li.textContent = "📄 " + f.name; li.onclick = () => { save(); active = i; render(); }; ul.appendChild(li); });
  document.getElementById("ed").value = files[active]?.content || "";
  document.getElementById("finfo").textContent = files[active]?.name || "—";
  updateStatusBar();
}
function updateStatusBar() {
  const ed = document.getElementById("ed"); const v = ed.value;
  const pos = ed.selectionStart; const before = v.slice(0, pos);
  document.getElementById("ln").textContent = before.split("\n").length;
  document.getElementById("col").textContent = pos - before.lastIndexOf("\n");
  document.getElementById("n").textContent = v.length;
}
document.getElementById("ed").oninput = () => { if (files[active]) { files[active].content = document.getElementById("ed").value; save(); document.getElementById("finfo").textContent = files[active].name + "*"; } preview(); };
document.getElementById("ed").onkeyup = updateStatusBar; document.getElementById("ed").onclick = updateStatusBar;
document.getElementById("new").onclick = () => { const n = prompt("文件名", "untitled.html"); if (n) { files.push({ name: n, content: "" }); active = files.length - 1; save(); render(); } };
document.getElementById("del").onclick = () => { if (!confirm("删除当前文件？")) return; files.splice(active, 1); active = Math.max(0, active - 1); save(); render(); };
document.getElementById("save").onclick = () => { save(); render(); alert("已保存"); };
function preview() {
  const html = files.find(f => f.name.endsWith(".html"))?.content || "";
  const css = files.find(f => f.name.endsWith(".css"))?.content || "";
  const js = files.find(f => f.name.endsWith(".js"))?.content || "";
  document.getElementById("out").srcdoc = `<!doctype html><style>${css}</style>${html}<script>${js}<\/script>`;
}
preview(); render();