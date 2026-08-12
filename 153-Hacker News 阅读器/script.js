let cat = "topstories";
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => { document.querySelectorAll(".tabs button").forEach(x => x.classList.remove("active")); b.classList.add("active"); cat = b.dataset.c; load(); });
async function load() {
  document.getElementById("list").innerHTML = "<li>加载中...</li>";
  try {
    const ids = await fetch(`https://hacker-news.firebaseio.com/v0/${cat}.json`).then(r => r.json());
    const items = await Promise.all(ids.slice(0, 30).map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())));
    document.getElementById("list").innerHTML = items.map(i => `<li><a href="${i.url || "https://news.ycombinator.com/item?id=" + i.id}" target="_blank">${i.title}</a><small>by ${i.by} · ⭐ ${i.score} · 💬 ${i.descendants || 0}</small></li>`).join("");
  } catch (e) { document.getElementById("list").innerHTML = `<li>失败：${e.message}</li>`; }
}
load();