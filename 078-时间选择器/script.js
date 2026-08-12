let h = 12, m = 0, pm = false;
const hEl = document.getElementById("h"), mEl = document.getElementById("m"), tg = document.getElementById("toggle");
function pad(n) { return String(n).padStart(2, "0"); }
function render() {
  hEl.textContent = pad(h); mEl.textContent = pad(m);
  tg.textContent = pm ? "PM" : "AM";
  document.getElementById("res").textContent = `${pad(h)}:${pad(m)} ${pm ? "PM" : "AM"}`;
}
function chH(d) { h = (h + d + 24) % 24; render(); }
function chM(d) { m = (m + d + 60) % 60; render(); }
document.getElementById("h+").onclick = () => chH(1);
document.getElementById("h-").onclick = () => chH(-1);
document.getElementById("m+").onclick = () => chM(1);
document.getElementById("m-").onclick = () => chM(-1);
tg.onclick = () => { pm = !pm; render(); };
render();