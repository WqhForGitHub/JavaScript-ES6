document.getElementById("go").onclick = async () => {
  const url = document.getElementById("url").value.trim(); if (!url) return;
  document.getElementById("list").innerHTML = "<li>加载中...</li>";
  try {
    const data = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`).then(r => r.json());
    if (data.status !== "ok") throw new Error(data.message || "解析失败");
    document.getElementById("list").innerHTML = data.items.map(i => `<li><a href="${i.link}" target="_blank">${i.title}</a><small>${i.author || ""} · ${new Date(i.pubDate || Date.now()).toLocaleString()}</small><p>${(i.description || "").replace(/<[^>]+>/g, "").slice(0, 160)}...</p></li>`).join("");
  } catch (e) { document.getElementById("list").innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("go").click();