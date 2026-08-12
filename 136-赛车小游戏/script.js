const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 320, H = 480;
let car = { x: 140, w: 40, h: 60 }, obstacles = [], speed = 4, score = 0, running = true, roadY = 0;
function spawn() { if (Math.random() < .04) { const x = Math.floor(Math.random() * 4) * 80 + 20; obstacles.push({ x, y: -80, w: 40, h: 60 }); } }
function loop() {
  if (!running) return;
  ctx.fillStyle = "#2d3436"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#6c5ce7"; ctx.fillRect(20, 0, 280, H);
  roadY = (roadY + speed) % 40;
  ctx.strokeStyle = "#fff"; ctx.setLineDash([20, 20]); ctx.beginPath(); ctx.moveTo(W / 2, -40 + roadY); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#2ecc71"; ctx.fillRect(car.x, 400, car.w, car.h);
  spawn();
  obstacles = obstacles.filter(o => o.y < H);
  obstacles.forEach(o => {
    o.y += speed; ctx.fillStyle = "#e74c3c"; ctx.fillRect(o.x, o.y, o.w, o.h);
    if (o.x < car.x + car.w && o.x + o.w > car.x && o.y < 400 + car.h && o.y + o.h > 400) { running = false; alert("碰撞！得分 " + Math.floor(score)); }
  });
  score += .1;
  requestAnimationFrame(loop);
}
addEventListener("keydown", e => { if (e.key === "ArrowLeft") car.x = Math.max(20, car.x - 24); else if (e.key === "ArrowRight") car.x = Math.min(260, car.x + 24); });
cv.focus(); loop();