const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 640, H = 200, G = 0.6, GY = 170;
let dino = { y: GY, vy: 0 }, obstacles = [], score = 0, running = true, frame = 0;
function jump() { if (dino.y >= GY) dino.vy = -12; }
function spawn() { if (frame % 100 === 0 && Math.random() > .4) obstacles.push({ x: W, w: 18 + Math.random() * 20 }); }
function loop() {
  ctx.fillStyle = "#2c3e50"; ctx.fillRect(0, 0, W, H);
  if (running) {
    frame++;
    dino.vy += G; dino.y = Math.min(GY, dino.y + dino.vy);
    spawn();
    obstacles = obstacles.filter(o => o.x > -50);
    obstacles.forEach(o => {
      o.x -= 4;
      if (60 > o.x - 14 && 60 < o.x + o.w + 14 && dino.y > H - 40 - 30) { running = false; alert("撞上！得分 " + Math.floor(score)); }
    });
    if (Math.random() < .02);  score += .15;
  }
  ctx.fillStyle = "#2ecc71"; ctx.fillRect(40, dino.y - 30, 24, 30);
  ctx.fillStyle = "#34495e"; ctx.fillRect(0, GY + 4, W, 26);
  ctx.fillStyle = "#e74c3c"; obstacles.forEach(o => ctx.fillRect(o.x, GY - 26, o.w, 26));
  ctx.fillStyle = "#fff"; ctx.font = "16px monospace"; ctx.fillText("得分 " + Math.floor(score), W - 100, 25);
  requestAnimationFrame(loop);
}
addEventListener("keydown", e => { if (e.key === " " || e.key === "ArrowUp") { if (!running) { running = true; dino.y = GY; obstacles = []; score = 0; frame = 0; } jump(); } });
cv.onclick = () => { if (!running) { running = true; dino.y = GY; obstacles = []; score = 0; frame = 0; } jump(); };
cv.focus(); requestAnimationFrame(loop);