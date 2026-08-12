document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const grid = document.getElementById("grid"); grid.innerHTML = "<p>搜索中...</p>";
  try {
    // 使用 Wikimedia Commons API（无 key）
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=300&format=json&origin=*`;
    const data = await fetch(url).then(r => r.json());
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    grid.innerHTML = pages.map(p => p.imageinfo?.[0]?.thumburl ? `<img src="${p.imageinfo[0].thumburl}" title="${p.title}" onclick="window.open('${p.imageinfo[0].url}','_blank')">` : "").join("") || "<p>未找到图片</p>";
  } catch (e) { grid.innerHTML = `<p>失败：${e.message}</p>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });