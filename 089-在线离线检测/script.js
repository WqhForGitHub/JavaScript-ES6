const dot = document.getElementById("dot"), state = document.getElementById("state"), log = document.getElementById("log");
const records = [];
function addLog(t) { records.unshift(`${new Date().toLocaleTimeString()} — ${t}`); log.innerHTML = records.slice(0, 30).map(r => `<div>${r}</div>`).join(""); }
function set(on) {
  dot.className = "dot " + (on ? "online" : "offline");
  state.textContent = on ? "🟢 在线" : "🔴 离线";
  addLog(on ? "网络恢复" : "网络断开");
}
addEventListener("online", () => set(true));
addEventListener("offline", () => set(false));
set(navigator.onLine); addLog("已连接：" + navigator.onLine);