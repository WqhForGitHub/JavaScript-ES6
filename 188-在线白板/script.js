const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let drawing = false, last = null, tool = "pen";
ctx.lineCap = "round"; ctx.lineJoin = "round";
function pos(t) { const r = cv.getBoundingClientRect(); return [t.clientX - r.left, t.clientY - r.top]; }
function start(e) { e.preventDefault?.(); drawing = true; last = pos(e.touches ? e.touches[0] : e); }
function move(e) {
  if (!drawing) return; e.preventDefault?.();
  const [x, y] = pos(e.touches ? e.touches[0] : e);
  ctx.strokeStyle = tool === "eraser" ? "#fff" : document.getElementById("color").value;
  ctx.lineWidth = document.getElementById("size").value;
  ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(x, y); ctx.stroke();
  last = [x, y];
}
function end() { drawing = false; }
cv.addEventListener("mousedown", start); cv.addEventListener("mousemove", move); addEventListener("mouseup", end);
cv.addEventListener("touchstart", start, { passive: false }); cv.addEventListener("touchmove", move, { passive: false }); cv.addEventListener("touchend", end);
document.getElementById("clear").onclick = () => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); };
document.querySelectorAll(".tool").forEach(b => b.onclick = () => { document.querySelectorAll(".tool").forEach(x => x.classList.remove("active")); b.classList.add("active"); tool = b.dataset.tool; });
ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);