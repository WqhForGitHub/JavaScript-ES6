document.getElementById("go").onclick = async () => {
  const u = document.getElementById("url").value.trim(); if (!u) return;
  const res = document.getElementById("res"); res.textContent = "生成中...";
  try {
    const data = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(u)}`).then(r => r.json());
    if (data.shorturl) res.innerHTML = `短链接：<b><a href="${data.shorturl}" target="_blank" style="color:#00b09b">${data.shorturl}</a></b><br>原链接：${u}<br><button onclick="navigator.clipboard && navigator.clipboard.writeText('${data.shorturl}')" style="margin-top:8px;padding:6px 14px;background:#00b09b;color:#fff;border:none;border-radius:6px;cursor:pointer">复制短链接</button>`;
    else throw new Error(data.errormessage || "失败");
  } catch (e) { res.innerHTML = "失败：" + e.message + "<br><small>is.gd 是免费无 key 公开短链接服务。</small>"; }
};