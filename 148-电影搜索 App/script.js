document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const grid = document.getElementById("grid"); grid.innerHTML = "<p>搜索中...</p>";
  try {
    const data = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=8265bd1677f2f9e91a2b8c124fd9d3f9&query=${encodeURIComponent(q)}&language=zh-CN`).then(r => r.json());
    grid.innerHTML = (data.results || []).slice(0, 20).map(m => `<div class="item"><img src="${m.poster_path ? "https://image.tmdb.org/t/p/w200" + m.poster_path : "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300'><rect fill='%23333'/></svg>"}"><div class="t">${m.title}</div><div class="m">${m.release_date?.slice(0,4) || "—"} · ⭐ ${m.vote_average?.toFixed(1) || "—"}</div></div>`).join("") || "<p>无结果</p>";
  } catch (e) { grid.innerHTML = `<p>失败：${e.message}</p>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });