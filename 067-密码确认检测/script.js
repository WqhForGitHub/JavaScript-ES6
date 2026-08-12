const p = document.getElementById("p"), p2 = document.getElementById("p2"), res = document.getElementById("res");
function check() {
  const a = p.value, b = p2.value;
  if (!a || !b) { res.className = "res idle"; res.textContent = "请输入两次密码"; return; }
  if (a.length < 6) { res.className = "res bad"; res.textContent = "密码至少 6 位"; return; }
  if (a !== b) { res.className = "res bad"; res.textContent = "✗ 两次密码不一致"; return; }
  res.className = "res ok"; res.textContent = "✓ 两次密码一致";
}
[p, p2].forEach(i => i.oninput = check);
document.getElementById("check").onclick = check;