document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const res = document.getElementById("res"); res.innerHTML = "<p>查询中...</p>";
  try {
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`).then(r => r.json());
    if (!Array.isArray(data)) throw new Error(data.message || "未找到");
    const d = data[0];
    res.innerHTML = `<h3>${d.word}</h3>${d.phonetic ? `<div class="phonetic">${d.phonetic}</div>` : ""}` +
      (d.meanings || []).map(m => `<div class="def"><span class="pos">${m.partOfSpeech || ""}</span> ${(m.definitions || []).map(def => `${def.definition}${def.example ? `<div class="ex">例：${def.example}</div>` : ""}`).join("<br>")}</div>`).join("");
  } catch (e) { res.innerHTML = `<p>查询失败：${e.message}</p>`; }
};
document.getElementById("q").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("go").click(); });