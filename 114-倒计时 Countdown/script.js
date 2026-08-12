let timer;
function pad(n) { return String(n).padStart(2, "0"); }
function update() {
  const diff = new Date(document.getElementById("target").value) - Date.now();
  if (isNaN(diff)) { document.getElementById("cd").textContent = "请设置目标时间"; return; }
  if (diff <= 0) { document.getElementById("cd").innerHTML = "<b>🎉 时间到！</b>"; clearInterval(timer); return; }
  const d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000), m = Math.floor(diff % 3600000 / 60000), s = Math.floor(diff % 60000 / 1000);
  document.getElementById("cd").innerHTML = `<b>${d}</b> 天 <b>${pad(h)}</b> 时 <b>${pad(m)}</b> 分 <b>${pad(s)}</b> 秒`;
  document.title = `⏳ ${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
}
document.getElementById("start").onclick = () => { if (!document.getElementById("target").value) return alert("请选择目标时间"); clearInterval(timer); update(); timer = setInterval(update, 1000); };