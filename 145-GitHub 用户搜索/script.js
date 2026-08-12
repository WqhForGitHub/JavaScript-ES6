document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim();
  if (!q) return; const list = document.getElementById("list"); list.innerHTML = "<li>搜索中...</li>";
  try {
    const r = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=20`).then(r => r.json());
    list.innerHTML = r.items.map(u => `<li><img src="${u.avatar_url}"><div><div class="n"><a href="${u.html_url}" target="_blank" style="color:#fff;text-decoration:none">${u.login}</a></div><div class="b">${u.type}</div></div></li>`).join("");
  } catch (e) { list.innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });