document.getElementById("go").onclick = async () => {
  const d = document.getElementById("domain").value.trim(); const t = document.getElementById("type").value;
  const body = document.getElementById("body"); body.innerHTML = "<tr><td colspan='4'>查询中...</td></tr>";
  try {
    const data = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${t}`).then(r => r.json());
    body.innerHTML = data.Answer ? data.Answer.map(a => `<tr><td>${a.name}</td><td>${a.TTL}</td><td>${a.type}</td><td>${a.data}</td></tr>`).join("") : "<tr><td colspan='4'>无记录</td></tr>";
  } catch (e) { body.innerHTML = `<tr><td colspan='4'>失败：${e.message}</td></tr>`; }
};
document.getElementById("go").click();