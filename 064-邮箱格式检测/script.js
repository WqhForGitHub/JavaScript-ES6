const re = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const input = document.getElementById("em"), res = document.getElementById("res");
input.oninput = () => {
  const v = input.value.trim();
  if (!v) { res.className = "res idle"; res.textContent = "等待输入..."; return; }
  if (re.test(v)) { res.className = "res ok"; res.textContent = "✓ 邮箱格式正确：" + v; }
  else { res.className = "res bad"; res.textContent = "✗ 邮箱格式不规范"; }
};
document.querySelectorAll(".list span").forEach(s => s.onclick = () => { if (!input.value.includes("@")) input.value += s.textContent; input.focus(); input.dispatchEvent(new Event("input")); });