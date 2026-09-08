document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const ai = document.getElementById("ai"), list = document.getElementById("list");
  ai.innerHTML = '<div class="label">🤖 AI 摘要生成中...</div>'; list.innerHTML = "";
  try {
    // DuckDuckGo Instant Answer API（无 key）
    const ddg = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`).then(r => r.json()).catch(() => ({}));
    const abstract = ddg.AbstractText || ddg.Abstract || (ddg.RelatedTopics?.[0]?.Text) || "";
    ai.innerHTML = `<div class="label">🤖 AI 摘要</div>${abstract ? abstract + (ddg.AbstractURL ? `<br><br><a href="${ddg.AbstractURL}" target="_blank" style="color:#58a6ff">来源</a>` : "") : "暂无即时摘要，下面是搜索结果。"}`;
  } catch (e) { ai.innerHTML = `<div class="label">🤖 AI 摘要</div>摘要获取失败：${e.message}`; }
  try {
    // Wikipedia 作为补充来源
    const wiki = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=8`).then(r => r.json());
    list.innerHTML = wiki.query.search.map(r => `<div class="item"><a href="https://en.wikipedia.org/?curid=${r.pageid}" target="_blank">${r.title}</a><div class="url">en.wikipedia.org</div><p>${(r.snippet || "").replace(/<[^>]+>/g, "")}</p></div>`).join("") ;
  } catch (e) { list.innerHTML = `<div class="item">搜索结果加载失败：${e.message}</div>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });