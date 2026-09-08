const status = document.getElementById("status"), list = document.getElementById("list");
function info() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  list.innerHTML = [
    ["网络类型", c.effectiveType || "未知"],
    ["下行速度", c.downlink ? c.downlink + " Mbps" : "未知"],
    ["RTT RTT", c.rtt ? c.rtt + " ms" : "未知"],
    ["节省流量模式", c.saveData ? "开启" : "关闭"],
  ].map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
}
function upd() {
  const on = navigator.onLine;
  status.textContent = on ? "✓ 在线 Online" : "✗ 离线 Offline";
  status.className = "status " + (on ? "online" : "offline");
  info();
}
addEventListener("online", upd); addEventListener("offline", upd);
navigator.connection && navigator.connection.addEventListener("change", info);
upd();