const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 320, H = 480;
let plane = { x: 160, y: 420 }, bullets = [], enemies = [], score = 0, running = true, last = 0;
function shoot() { bullets.push({ x: plane.x, y: plane.y - 20 }); }
function spawn() { if (Math.random() < .03) enemies.push({ x: Math.random() * W, y: -20 }); }
function loop(t) {
  if (!running) return;
  ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, W, H);
  if (t - last > 200) { shoot(); last = t; }
  bullets = bullets.filter(b => b.y > 0); bullets.forEach(b => { b.y -= 6; ctx.fillStyle = "#f1c40f"; ctx.fillRect(b.x - 1, b.y, 2, 10); });
  spawn();
  enemies = enemies.filter(e => e.y < H); enemies.forEach(e => {
    e.y += 2; ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(e.x, e.y, 14, 0, Math.PI * 2); ctx.fill();
    bullets = bullets.filter(b => { const hit = Math.hypot(b.x - e.x, b.y - e.y) < 14; if (hit) { score++; e.dead = true; } return !hit; });
    if (Math.hypot(e.x - plane.x, e.y - plane.y) < 24) { running = false; alert("被击中！得分 " + score); }
  });
  enemies = enemies.filter(e => !e.dead);
  ctx.fillStyle = "#2ecc71"; ctx.beginPath(); ctx.arc(plane.x, plane.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif"; ctx.fillText("得分 " + score, 10, 20);
  requestAnimationFrame(loop);
}
cv.onmousemove = e => { const r = cv.getBoundingClientRect(); plane.x = Math.max(14, Math.min(W - 14, e.clientX - r.left)); plane.y = Math.max(20, Math.min(H - 14, e.clientY - r.top)); };
cv.focus(); requestAnimationFrame(loop);