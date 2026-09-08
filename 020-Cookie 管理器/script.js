function getAll() {
  return document.cookie ? document.cookie.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, decodeURIComponent(v.join("="))]; }) : [];
}
function render() {
  const list = document.getElementById("list"); list.innerHTML = "";
  getAll().forEach(([k, v]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><b>${k}</b> = ${v}</span><button>删除</button>`;
    li.querySelector("button").onclick = () => { document.cookie = `${k}=; max-age=0`; render(); };
    list.appendChild(li);
  });
}
document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  const k = document.getElementById("k").value.trim(), v = document.getElementById("v").value, days = parseInt(document.getElementById("days").value) || 1;
  if (!k) return;
  document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(v)}; max-age=${days * 86400}`;
  document.getElementById("k").value = ""; document.getElementById("v").value = ""; render();
};
document.getElementById("show").onclick = render;
document.getElementById("clear").onclick = () => { getAll().forEach(([k]) => document.cookie = `${k}=; max-age=0`); render(); };
render();