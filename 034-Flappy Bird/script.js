const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 320, H = 480, G = 0.5, J = -8, P = 130, G2 = 60;
let bird = { y: H / 2, vy: 0 }, pipes = [], score = 0, running = true, frame = 0;
function spawn() { const gap = 100 + Math.random() * 60; pipes.push({ x: W, gap: gap, passed: false }); }
function jump() { if (!running) return; bird.vy = J; }
function loop() {
  ctx.fillStyle = "#70c5ce"; ctx.fillRect(0, 0, W, H);
  if (running) {
    bird.vy += G; bird.y += bird.vy;
    frame++;
    if (frame % 90 === 0) spawn();
    pipes = pipes.filter(p => p.x > -P);
    pipes.forEach(p => {
      p.x -= 2.5;
      if (!p.passed && p.x + P < 60) { p.passed = true; score++; }
      ctx.fillStyle = "#27ae60"; ctx.fillRect(p.x, 0, P, p.gap - G2); ctx.fillRect(p.x, p.gap + G2, P, H);
      if (60 + 13 > p.x && 60 - 13 < p.x + P && (bird.y - 13 < p.gap - G2 || bird.y + 13 > p.gap + G2)) { running = false; alert("游戏结束！得分 " + score); }
    });
    if (bird.y > H - 13 || bird.y < 13) { running = false; alert("撞地/撞顶！得分 " + score); }
  }
  ctx.fillStyle = "#f1c40f"; ctx.beginPath(); ctx.arc(60, bird.y, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "20px sans-serif"; ctx.fillText(score, W / 2 - 5, 50);
  requestAnimationFrame(loop);
}
function reset() { bird = { y: H / 2, vy: 0 }; pipes = []; score = 0; running = true; frame = 0; }
addEventListener("keydown", e => { if (e.key === " " || e.key === "ArrowUp") { if (!running) reset(); jump(); } });
cv.onclick = () => { if (!running) reset(); jump(); };
cv.focus(); loop();