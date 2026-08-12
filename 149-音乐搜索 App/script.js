document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const list = document.getElementById("list"); list.innerHTML = "<li>搜索中...</li>";
  try {
    const data = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=20`).then(r => r.json());
    list.innerHTML = (data.results || []).map(t => `<li><img src="${t.artworkUrl60}"><div class="info"><div class="t">${t.trackName || t.collectionName}</div><div class="a">${t.artistName}</div></div>${t.previewUrl ? `<audio controls src="${t.previewUrl}"></audio>` : ""}</li>`).join("") || "<li>无结果</li>";
  } catch (e) { list.innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });