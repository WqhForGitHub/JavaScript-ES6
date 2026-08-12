const shortcuts = {};
function on(key, fn) { shortcuts[key] = fn; }
on("ctrl+s", e => { e.preventDefault(); log("已保存 ✓"); });
on("ctrl+b", e => { e.preventDefault(); log("已加粗"); });
on("ctrl+i", e => { e.preventDefault(); log("已斜体"); });
on("ctrl+k", e => { e.preventDefault(); log("快捷键提示面板"); });
on("alt+1", e => { e.preventDefault(); document.body.classList.toggle("dark"); document.getElementById("theme").textContent = "当前主题：" + (document.body.classList.contains("dark") ? "深色" : "浅色"); });
function log(msg) { const el = document.getElementById("log"); el.textContent = msg; el.style.background = "#2ecc71"; el.style.color = "#fff"; setTimeout(() => { el.style.background = ""; el.style.color = ""; el.textContent = "按下列组合键试试"; }, 1500); }
document.addEventListener("keydown", e => {
  const key = (e.ctrlKey || e.metaKey ? "ctrl+" : "") + (e.altKey ? "alt+" : "") + (e.shiftKey ? "shift+" : "") + e.key.toLowerCase();
  Object.keys(shortcuts).forEach(k => {
    const parts = k.split("+");
    const m = (parts.includes("ctrl") === (e.ctrlKey || e.metaKey)) && (parts.includes("alt") === e.altKey) && (parts.includes("shift") === e.shiftKey) && parts[parts.length - 1] === e.key.toLowerCase();
    if (m) shortcuts[k](e);
  });
});