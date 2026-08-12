const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let drawing = false;
ctx.lineCap = "round"; ctx.lineJoin = "round";
function pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
cv.addEventListener("mousedown", e => { drawing = true; ctx.beginPath(); const [x, y] = pos(e); ctx.moveTo(x, y); });
cv.addEventListener("mousemove", e => { if (!drawing) return; const [x, y] = pos(e); ctx.strokeStyle = document.getElementById("color").value; ctx.lineWidth = document.getElementById("size").value; ctx.lineTo(x, y); ctx.stroke(); });
["mouseup", "mouseleave"].forEach(ev => cv.addEventListener(ev, () => drawing = false));
// touch
cv.addEventListener("touchstart", e => { drawing = true; const t = e.touches[0]; const r = cv.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); e.preventDefault(); });
cv.addEventListener("touchmove", e => { if (!drawing) return; const t = e.touches[0]; const r = cv.getBoundingClientRect(); ctx.strokeStyle = document.getElementById("color").value; ctx.lineWidth = document.getElementById("size").value; ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke(); e.preventDefault(); });
cv.addEventListener("touchend", () => drawing = false);
document.getElementById("clear").onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);