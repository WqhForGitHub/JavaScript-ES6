document.getElementById("go").onclick = async () => {
  const url = document.getElementById("url").value.trim(); if (!url) return;
  document.getElementById("list").innerHTML = "<li>加载中...</li>";
  try {
    const data = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`).then(r => r.text());
    const doc = new DOMParser().parseFromString(data, "text/xml");
    const items = [...doc.querySelectorAll("entry, item")].slice(0, 12);
    document.getElementById("list").innerHTML = items.map(i => {
      const title = i.querySelector("title")?.textContent || "无标题";
      const link = i.querySelector("link")?.textContent || i.querySelector("link")?.getAttribute("href") || "";
      const desc = (i.querySelector("summary, description, content")?.textContent || "").replace(/<[^>]+>/g, "").slice(0, 200);
      return `<li><h3><a href="${link}" target="_blank">${title}</a></h3><p>${desc}...</p></li>`;
    }).join("") || "<li>未解析到条目</li>";
  } catch (e) { document.getElementById("list").innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("go").click();