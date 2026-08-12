const fill = document.getElementById("fill"), level = document.getElementById("level"), info = document.getElementById("info");
if (navigator.getBattery) {
  navigator.getBattery().then(b => {
    function upd() {
      fill.style.width = (b.level * 100) + "%";
      fill.style.background = b.level < 0.2 ? "#e74c3c" : b.charging ? "#f39c12" : "linear-gradient(90deg,#00b894,#6dd5fa)";
      level.textContent = `${Math.round(b.level * 100)}% ${b.charging ? "⚡ 充电中" : ""}`;
      info.innerHTML = [
        ["充电状态", b.charging ? "✓ 充电中" : "✗ 未充电"],
        ["剩余电量", Math.round(b.level * 100) + "%"],
        ["充满还需", b.chargingTime !== Infinity ? Math.round(b.chargingTime / 60) + " 分钟" : "—"],
        ["续航剩余", b.dischargingTime !== Infinity ? Math.round(b.dischargingTime / 60) + " 分钟" : "—"],
      ].map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
    }
    ["levelchange", "chargingchange", "chargingtimechange", "dischargingtimechange"].forEach(ev => b.addEventListener(ev, upd));
    upd();
  });
} else {
  level.textContent = "不支持";
  document.getElementById("note").textContent = "你的浏览器不支持 Battery Status API，请用 Chrome / 旧版 Edge 试。";
}