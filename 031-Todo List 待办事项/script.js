let todos = JSON.parse(localStorage.getItem("todos") || "[]");
let filter = "all";
const listEl = document.getElementById("list");
function save() { localStorage.setItem("todos", JSON.stringify(todos)); }
function render() {
  listEl.innerHTML = "";
  todos.filter(t => filter === "all" || (filter === "active" && !t.done) || (filter === "done" && t.done)).forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");
    li.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""}><span></span><button>✕</button>`;
    li.querySelector("span").textContent = t.text;
    li.querySelector("input").onchange = () => { t.done = !t.done; save(); render(); };
    li.querySelector("button").onclick = () => { todos = todos.filter(x => x.id !== t.id); save(); render(); };
    listEl.appendChild(li);
  });
  document.getElementById("left").textContent = todos.filter(t => !t.done).length;
}
document.getElementById("add").onclick = () => {
  const v = document.getElementById("inp").value.trim();
  if (!v) return;
  todos.push({ id: Date.now(), text: v, done: false });
  document.getElementById("inp").value = "";
  save(); render();
};
document.getElementById("inp").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("add").click(); });
document.querySelectorAll(".filters button").forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll(".filters button").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); render();
});
document.getElementById("clear").onclick = () => { todos = todos.filter(t => !t.done); save(); render(); };
render();