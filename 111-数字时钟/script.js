const w = ["日", "一", "二", "三", "四", "五", "六"];
function pad(n) { return String(n).padStart(2, "0"); }
function tick() {
  const d = new Date();
  document.getElementById("time").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  document.getElementById("date").textContent = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${w[d.getDay()]}`;
  document.title = "🕐 " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}
tick(); setInterval(tick, 1000);