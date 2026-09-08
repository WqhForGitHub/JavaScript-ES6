const t = document.getElementById("target");
document.getElementById("fs").onclick = () => t.requestFullscreen ? t.requestFullscreen() : t.webkitRequestFullscreen();
document.getElementById("exit").onclick = () => document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
function upd() { document.getElementById("state").textContent = document.fullscreenElement ? "✓ 已进入全屏" : "非全屏状态"; document.getElementById("fs").textContent = document.fullscreenElement ? "已是全屏" : "进入全屏"; }
document.addEventListener("fullscreenchange", upd);
upd();