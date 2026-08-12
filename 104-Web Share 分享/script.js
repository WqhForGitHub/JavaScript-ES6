const log = document.getElementById("log");
document.getElementById("share").onclick = async () => {
  const data = { title: document.getElementById("title").value, text: document.getElementById("text").value };
  if (document.getElementById("url").value) data.url = document.getElementById("url").value;
  if (!navigator.share) { log.textContent = "本环境不支持原生分享，回退到复制链接"; navigator.clipboard && navigator.clipboard.writeText(data.url || ""); return; }
  try { await navigator.share(data); log.textContent = "✓ 分享成功"; } catch (e) { log.textContent = "取消或失败：" + e.message; }
};