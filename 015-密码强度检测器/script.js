const pwd = document.getElementById("pwd");
const fill = document.getElementById("fill");
const label = document.getElementById("label");
function check() {
  const v = pwd.value;
  const c1 = v.length >= 8, c2 = /[A-Z]/.test(v), c3 = /[a-z]/.test(v), c4 = /[0-9]/.test(v), c5 = /[^A-Za-z0-9]/.test(v);
  [["c1", c1], ["c2", c2], ["c3", c3], ["c4", c4], ["c5", c5]].forEach(([id, ok]) => {
    document.getElementById(id).classList.toggle("ok", ok);
  });
  let score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0) + (c4 ? 1 : 0) + (c5 ? 1 : 0) + (v.length >= 12 ? 1 : 0);
  const levels = [{ w: 20, c: "#e74c3c", t: "很弱" }, { w: 40, c: "#e67e22", t: "弱" }, { w: 60, c: "#f1c40f", t: "中等" }, { w: 80, c: "#2ecc71", t: "强" }, { w: 100, c: "#27ae60", t: "非常强" }];
  const idx = Math.min(Math.floor(score / 1.5), 4);
  if (!v) { fill.style.width = 0; label.textContent = "请输入密码"; return; }
  fill.style.width = levels[idx].w + "%";
  fill.style.background = levels[idx].c;
  label.textContent = levels[idx].t;
}
pwd.oninput = check;