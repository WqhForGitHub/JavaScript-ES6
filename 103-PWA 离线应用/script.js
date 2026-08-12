const off = document.getElementById("off");
function netStat() { off.textContent = navigator.onLine ? "🟢 在线 - 全功能可用" : "🔴 离线 - 仍可访问缓存内容"; off.style.background = navigator.onLine ? "#e7f6ee" : "#fde8da"; }
addEventListener("online", netStat); addEventListener("offline", netStat); netStat();

// 动态注入 manifest
const manifest = {
  name: "PWA Demo", short_name: "PWA", start_url: ".", display: "standalone", background_color: "#00b09b", theme_color: "#96c93d",
  icons: [{ src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg"><rect width="192" height="192" fill="#00b09b"/></svg>'), sizes: "192x192", type: "image/svg+xml" }]
};
const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
const link = document.createElement("link"); link.rel = "manifest"; link.href = URL.createObjectURL(blob);
document.head.appendChild(link);

let deferred;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; document.getElementById("install").textContent = "💾 点击安装到桌面"; });
document.getElementById("install").onclick = () => { if (deferred) { deferred.prompt(); deferred.userChoice.then(() => deferred = null); } else alert("浏览器暂未提供安装提示，可在地址栏菜单中选择"); };

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});