const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 500, H = 320, path = [{x:0,y:80},{x:400,y:80},{x:400,y:240},{x:0,y:240}];
let towers = [], enemies = [], bullets = [], score = 0, frame = 0, running = true;
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function spawn() { if (frame % 120 === 0) enemies.push({ p: 0, x: path[0].x, y: path[0].y, hp: 3 }); }
function moveEnemy(e) {
  const t = path[e.p + 1]; if (!t) { enemies = enemies.filter(x => x !== e); score -= 2; return; }
  const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy); if (d < 1) e.p++; else { e.x += dx / d; e.y += dy / d; }
}
function loop() {
  ctx.fillStyle = "#2c3e50"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth = 30; ctx.beginPath(); path.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
  frame++; spawn();
  enemies.forEach(moveEnemy);
  enemies.forEach(e => { ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(e.x, e.y, 12, 0, Math.PI * 2); ctx.fill(); });
  towers.forEach(t => {
    ctx.fillStyle = "#f1c40f"; ctx.beginPath(); ctx.arc(t.x, t.y, 14, 0, Math.PI * 2); ctx.fill();
    if (frame % 30 === 0) { const target = enemies.find(e => dist(t, e) < 120); if (target) bullets.push({ x: t.x, y: t.y, tx: target.x, ty: target.y, target }); }
  });
  bullets = bullets.filter(b => Math.hypot(b.tx - b.x, b.ty - b.y) > 4);
  bullets.forEach(b => { const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy); b.x += dx / d * 6; b.y += dy / d * 6;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
    if (b.target && Math.hypot(b.target.x - b.x, b.target.y - b.y) < 8) { b.target.hp--; if (b.target.hp <= 0) { enemies = enemies.filter(e => e !== b.target); score += 10; document.getElementById("sc").textContent = score; } }
  });
  document.getElementById("sc").textContent = score;
  requestAnimationFrame(loop);
}
cv.onclick = e => {
  const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
  const onPath = path.some((p, i) => i && Math.abs(Math.hypot(x - p.x, y - p.y)) < 20);
  if (!onPath) towers.push({ x, y });
};
cv.focus(); loop();