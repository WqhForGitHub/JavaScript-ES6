document.getElementById("load").onclick = async () => {
  const list = document.getElementById("list"); list.innerHTML = "<li>加载中...</li>";
  try {
    const ids = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then(r => r.json());
    const top = ids.slice(0, 20);
    const items = await Promise.all(top.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())));
    list.innerHTML = items.map(i => `<li><a href="${i.url || "https://news.ycombinator.com/item?id=" + i.id}" target="_blank">${i.title}</a><small>来自 ${i.by} · ⭐ ${i.score} · 💬 ${i.descendants || 0}</small></li>`).join("");
  } catch (e) { list.innerHTML = "<li>加载失败：" + e.message + "（可能因网络或 CORS）</li>"; }
};