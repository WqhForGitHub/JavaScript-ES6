let ws;
const status = document.getElementById("status"), msgsEl = document.getElementById("msgs");
function renderMsg(user, text, me) {
  const d = document.createElement("div"); d.className = "msg" + (me ? " me" : "");
  d.innerHTML = `<span class="u">${user}</span> <span class="t">${new Date().toLocaleTimeString()}</span><br><span>${text}</span>`;
  msgsEl.appendChild(d); msgsEl.scrollTop = msgsEl.scrollHeight;
}
function connect() {
  status.textContent = "连接中...";
  ws = new WebSocket("wss://echo.websocket.org");
  ws.onopen = () => status.textContent = "✓ 已连接 (echo server)";
  ws.onclose = () => status.textContent = "✕ 连接已关闭";
  ws.onmessage = e => {
    // 回声服务会把你的消息原样发回——在这里解析 JSON 来区分
    try { const m = JSON.parse(e.data); renderMsg(m.user + "（echo）", m.text, false); } catch { renderMsg("server", e.data, false); }
  };
}
function send() {
  const user = document.getElementById("user").value.trim() || "guest";
  const text = document.getElementById("msg").value.trim();
  if (!text || !ws || ws.readyState !== 1) return;
  renderMsg(user, text, true);
  ws.send(JSON.stringify({ user, text }));
  document.getElementById("msg").value = "";
}
document.getElementById("send").onclick = send;
document.getElementById("msg").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
connect();