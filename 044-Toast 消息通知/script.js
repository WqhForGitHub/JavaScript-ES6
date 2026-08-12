const icons = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
const msgs = { info: "这是一条信息提示", success: "操作成功完成", warning: "请注意潜在风险", error: "操作出现错误" };
function toast(type) {
  const wrap = document.getElementById("wrap");
  const t = document.createElement("div"); t.className = "toast " + type;
  t.innerHTML = `<span>${icons[type]}</span><span>${msgs[type]}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = 0; t.style.transition = "opacity .3s"; setTimeout(() => t.remove(), 300); }, 2500);
}
document.querySelectorAll(".btn").forEach(b => b.onclick = () => toast(b.dataset.t));