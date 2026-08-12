let list = JSON.parse(localStorage.getItem("signup") || "[]");
function save() { localStorage.setItem("signup", JSON.stringify(list)); }
const phoneRe = /^1[3-9]\d{9}$/;
function render() {
  document.getElementById("list").innerHTML = list.map(r => `<li><span><b>${r.name}</b> · ${r.course} · ${r.phone}</span><span class="del">✕</span></li>`).join("");
  document.querySelectorAll(".del").forEach((d, i) => d.onclick = () => { list.splice(i, 1); save(); render(); });
}
document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  const n = document.getElementById("n").value.trim();
  const ph = document.getElementById("ph").value.trim();
  if (!n) return alert("请输入姓名");
  if (!phoneRe.test(ph)) return alert("手机号格式错误");
  list.push({ name: n, phone: ph, course: document.getElementById("c").value, msg: document.getElementById("m").value });
  ["n", "ph", "m"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
render();