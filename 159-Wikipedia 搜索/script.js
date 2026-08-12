document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  document.getElementById("list").innerHTML = "<li>搜索中...</li>";
  try {
    const data = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(q)}&utf8=1&origin=*&srlimit=15`).then(r => r.json());
    document.getElementById("list").innerHTML = data.query.search.map(r => `<li><a href="https://en.wikipedia.org/?curid=${r.pageid}" target="_blank">${r.title}</a><p>${(r.snippet || "").replace(/<[^>]+>/g, "")}</p></li>`).join("");
  } catch (e) { document.getElementById("list").innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });