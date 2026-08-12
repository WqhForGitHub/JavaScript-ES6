document.getElementById("go").onclick = async () => {
  const q = document.getElementById("q").value.trim(); if (!q) return;
  const list = document.getElementById("list"); list.innerHTML = "<p>搜索中...</p>";
  try {
    // 使用 noEmbed 获取视频信息，但搜索 YouTube 需 key。这里使用 Invidious API（无 key）
    const data = await fetch(`https://invidious.example.com/api/v1/search?q=${encodeURIComponent(q)}&type=video`).then(r => r.json()).catch(() => null);
    if (!data) {
      // 回退：使用搜索结果提示文案（公开 YouTube 搜索需 key）
      list.innerHTML = `<p>YouTube 搜索需 API Key，这里用 noJSON 接口示范。</p>`;
      // 直接打开搜索页作为演示
      window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(q));
      return;
    }
    list.innerHTML = data.slice(0, 15).map(v => `<div class="v" data-id="${v.videoId}"><img src="${v.videoThumbnails?.[0]?.url || ""}"><div class="t">${v.title}<br><small style="color:#999">${v.author}</small></div></div>`).join("");
    list.querySelectorAll(".v").forEach(el => el.onclick = () => play(el.dataset.id));
  } catch (e) { list.innerHTML = `<p>失败：${e.message}</p>`; }
};
function play(id) { document.getElementById("player").innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`; document.getElementById("player").scrollIntoView(); }