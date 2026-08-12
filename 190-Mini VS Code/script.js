let files = JSON.parse(localStorage.getItem("vscode") || '[]') || [{ name: "main.js", content: "// Welcome to Mini VS Code\nconsole.log(42);" }, { name: "index.html", content: "<h1>Hello</h1>" }];
let active = 0;
function save() { if (files[active]) files[active].content = document.getElementById("ed").value; localStorage.setItem("vscode", JSON.stringify(files)); }
function render() {
  const ul = document.getElementById("files"); ul.innerHTML = "";
  files.forEach((f, i) => {
    const li = document.createElement("li"); li.className = i === active ? "active" : ""; li.textContent = "📄 " + f.name;
    li.onclick = () => { save(); active = i; render(); };
    ul.appendChild(li);
  });
  document.getElementById("ed").value = files[active]?.content || "";
  document.getElementById("info").textContent = (files[active]?.name || "") + " · " + (document.getElementById("ed").value.length) + " chars";
}
document.getElementById("ed").oninput = e => { if (files[active]) { files[active].content = e.target.value; document.getElementById("info").textContent = files[active].name + " · " + e.target.value.length + " chars"; save(); render(); } };
document.getElementById("new").onclick = () => { const n = prompt("文件名", "untitled.txt"); if (n) { files.push({ name: n, content: "" }); active = files.length - 1; save(); render(); } };
render();