function pad(n) { return String(n).padStart(2, "0"); }
function fmt(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function out(s) { document.getElementById("out").textContent = s; }
document.getElementById("t2d").onclick = () => {
  let ts = parseInt(document.getElementById("ts").value);
  if (isNaN(ts)) return out("请输入有效时间戳");
  if (ts > 1e12) ts = Math.floor(ts / 1000);
  out(fmt(new Date(ts * 1000)));
};
document.getElementById("d2t").onclick = () => {
  const s = document.getElementById("dt").value.trim();
  const d = new Date(s.replace(" ", "T"));
  if (isNaN(d)) return out("日期格式无效");
  out("秒: " + Math.floor(d.getTime() / 1000) + "\n毫秒: " + d.getTime());
};
document.getElementById("now").onclick = () => {
  const d = new Date();
  document.getElementById("ts").value = Math.floor(d.getTime() / 1000);
  document.getElementById("dt").value = fmt(d);
  out(fmt(d));
};