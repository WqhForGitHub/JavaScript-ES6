const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const cx = 150, cy = 150, r = 130;
function draw() {
  ctx.clearRect(0, 0, 300, 300);
  ctx.save(); ctx.translate(cx, cy);
  ctx.strokeStyle = "#ecf0f1"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#ecf0f1";
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate(i * Math.PI / 6);
    ctx.fillRect(-2, -r + 10, 4, i % 3 === 0 ? 16 : 10);
    if (i % 3 === 0) { ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.rotate(-i * Math.PI / 6); ctx.fillText(i || 12, 0, -r + 38); }
    ctx.restore();
  }
  const d = new Date(), s = d.getSeconds(), m = d.getMinutes(), h = d.getHours() % 12;
  drawHand((h + m / 60) * Math.PI / 6, r * .5, 5, "#f1c40f");
  drawHand((m + s / 60) * Math.PI / 30, r * .75, 3, "#ecf0f1");
  drawHand(s * Math.PI / 30, r * .85, 1.5, "#e74c3c");
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  requestAnimationFrame(draw);
}
function drawHand(angle, len, w, color) { ctx.save(); ctx.rotate(angle); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -len); ctx.stroke(); ctx.restore(); }
draw();