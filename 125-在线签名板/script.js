const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let drawing = false, last = null;
ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#222";
function p(t) { const r = cv.getBoundingClientRect(); return [t.clientX - r.left, t.clientY - r.top]; }
function start(t) { drawing = true; last = p(t); }
function move(t) { if (!drawing) return; const [x, y] = p(t); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(x, y); ctx.stroke(); last = [x, y]; t.preventDefault?.(); }
function end() { drawing = false; }
cv.addEventListener("mousedown", e => start(e)); cv.addEventListener("mousemove", e => move(e)); addEventListener("mouseup", end);
cv.addEventListener("touchstart", e => start(e.touches[0]), { passive: false });
cv.addEventListener("touchmove", e => move(e.touches[0]), { passive: false });
cv.addEventListener("touchend", end);
document.getElementById("clear").onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);
document.getElementById("save").onclick = () => { const a = document.createElement("a"); a.download = "signature.png"; a.href = cv.toDataURL(); a.click(); };