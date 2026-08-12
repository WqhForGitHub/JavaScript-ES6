const inp = document.getElementById("inp"), cal = document.getElementById("cal");
let view = new Date(), sel = new Date();
function pad(n) { return String(n).padStart(2, "0"); }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function render() {
  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const last = new Date(y, m - 1, 0).getDate();
  let cells = "";
  ["日", "一", "二", "三", "四", "五", "六"].forEach(w => cells += `<span class="wk">${w}</span>`);
  for (let i = first; i > 0; i--) cells += `<span class="nm">${last - i + 1}</span>`;
  const today = new Date();
  for (let d = 1; d <= days; d++) {
    const cur = new Date(y, m, d);
    const cls = sameDay(cur, sel) ? "sel" : sameDay(cur, today) ? "cur" : "";
    cells += `<span class="${cls}" data-d="${d}">${d}</span>`;
  }
  const total = first + days, remain = (7 - total % 7) % 7;
  for (let i = 1; i <= remain; i++) cells += `<span class="nm">${i}</span>`;
  cal.innerHTML = `<div class="hd"><button id="prev">‹</button><b>${y} 年 ${m + 1} 月</b><button id="next">›</button></div><div class="grid">${cells}</div>`;
  document.getElementById("prev").onclick = () => { view = new Date(y, m - 1, 1); render(); };
  document.getElementById("next").onclick = () => { view = new Date(y, m + 1, 1); render(); };
  cal.querySelectorAll(".grid span[data-d]").forEach(s => s.onclick = () => {
    sel = new Date(y, m, +s.dataset.d);
    inp.value = `${sel.getFullYear()}-${pad(m + 1)}-${pad(+s.dataset.d)}`;
    cal.classList.remove("show"); render();
  });
}
inp.onclick = e => { e.stopPropagation(); cal.classList.toggle("show"); if (cal.classList.contains("show")) render(); };
document.addEventListener("click", e => { if (!e.target.closest(".wrap")) cal.classList.remove("show"); });