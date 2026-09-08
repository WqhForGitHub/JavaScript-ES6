const map = { 13: "中国电信", 14: "中国电信/虚拟", 15: "中国移动/联通", 16: "中国联通", 17: "中国虚拟/移动", 18: "中国移动/联通/电信", 19: "中国广电/电信" };
const input = document.getElementById("ph"), res = document.getElementById("res"), info = document.getElementById("info");
input.oninput = () => {
  input.value = input.value.replace(/\D/g, "");
  const v = input.value;
  if (!v) { res.className = "res idle"; res.textContent = "请输入"; info.innerHTML = ""; return; }
  if (v.length < 11) { res.className = "res idle"; res.textContent = `已输入 ${v.length}/11`; info.innerHTML = ""; return; }
  if (!/^1[3-9]\d{9}$/.test(v)) { res.className = "res bad"; res.textContent = "号码格式不正确"; info.innerHTML = ""; return; }
  const pre = v.substr(0, 2), op = map[+pre[0]] || map[+pre[1]] || "未知";
  res.className = "res ok"; res.textContent = "✓ 号码有效";
  info.innerHTML = `归属：中国大陆<br>前缀：<b>${pre}</b><br>可能运营商：${op}`;
};