document.getElementById("go").onclick = async () => {
  let url = document.getElementById("url").value.trim();
  if (!/^https?:\/\//.test(url)) url = "https://" + url;
  const res = document.getElementById("res"); res.textContent = "检测中...";
  try {
    const u = new URL(url);
    const start = performance.now();
    const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { method: "GET" });
    const elapsed = (performance.now() - start).toFixed(0);
    let dnsTxt = "";
    try { const dns = await fetch(`https://dns.google/resolve?name=${u.hostname}&type=A`).then(r => r.json()); dnsTxt = dns.Answer ? dns.Answer.map(a => a.data).join(", ") : "无 A 记录"; } catch {}
    res.innerHTML = `<span class="${"ok"}">状态：<b style="color:#2ecc71">${r.status} ✓ 可达</b></span><br>响应耗时：<b>${elapsed} ms</b><br>主机：<b>${u.hostname}</b><br>解析 IP：<b>${dnsTxt}</b><br>协议：<b>${u.protocol.slice(0, -1).toUpperCase()}</b>`;
  } catch (e) {
    res.innerHTML = `<span class="bad">状态：<b style="color:#e74c3c">✗ 不可达</b></span><br>原因：${e.message}<br><small>可能因 CORS 或网络；可先用 url 直接在浏览器打开验证。</small>`;
  }
};