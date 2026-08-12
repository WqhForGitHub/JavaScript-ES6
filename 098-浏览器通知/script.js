if (!("Notification" in window)) { document.getElementById("status").textContent = "浏览器不支持通知"; }
function sync() { document.getElementById("status").textContent = "当前权限：" + (Notification.permission === "granted" ? "已开启" : Notification.permission === "denied" ? "已拒绝" : "未询问"); }
sync();
document.getElementById("req").onclick = () => Notification.requestPermission().then(sync);
document.getElementById("send").onclick = () => {
  if (Notification.permission !== "granted") return alert("请先请求权限并允许");
  const n = new Notification(document.getElementById("title").value, { body: document.getElementById("body").value, icon: "data:image/svg+xml;base64,PHN2Zy8+" });
  n.onclick = () => alert("通知被点击");
};