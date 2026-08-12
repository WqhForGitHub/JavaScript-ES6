const ua = navigator.userAgent;
function browser() {
  if (/Edg\//.test(ua)) return "Microsoft Edge"; if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox"; if (/Safari\//.test(ua)) return "Safari"; return "其他";
}
function os() {
  if (/Windows/.test(ua)) return "Windows"; if (/Mac OS/.test(ua)) return "macOS"; if (/Android/.test(ua)) return "Android"; if (/iPhone|iPad/.test(ua)) return "iOS / iPadOS"; if (/Linux/.test(ua)) return "Linux"; return "其他";
}
const items = {
  "浏览器": browser(), "操作系统": os(), "用户代理": ua, "语言": navigator.language,
  "在线": navigator.onLine ? "✓ 在线" : "✗ 离线", "Cookies": navigator.cookieEnabled ? "已启用" : "禁用",
  "触摸屏": "ontouchstart" in window ? "支持" : "不支持", "CPU 核心数": navigator.hardwareConcurrency || "未知",
  "屏幕分辨率": `${screen.width}×${screen.height}`, "视口尺寸": `${innerWidth}×${innerHeight}`,
  "像素比": devicePixelRatio, "时区": Intl.DateTimeFormat().resolvedOptions().timeZone,
  "支持 Service Worker": "serviceWorker" in navigator ? "✓" : "✗", "支持 WebSocket": "WebSocket" in window ? "✓" : "✗",
};
document.getElementById("list").innerHTML = Object.entries(items).map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
addEventListener("resize", () => { const v = document.querySelector("li:nth-child(11) b"); if (v) v.textContent = `${innerWidth}×${innerHeight}`; });