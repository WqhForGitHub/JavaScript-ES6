const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 400, H = 400;
const paddle = { x: 160, y: 380, w: 80, h: 10 };
const ball = { x: 200, y: 300, r: 6, dx: 2.4, dy: -2.4 };
let bricks = [], score = 0, running = true;
function initBricks() {
  bricks = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) bricks.push({ x: c * 50, y: 30 + r * 22, w: 46, h: 18, c: `hsl(${r * 60},70%,55%)` });
}
function loop() {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  bricks.forEach(b => { ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.w, b.h); });
  if (running) {
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.x < ball.r || ball.x > W - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;
    if (ball.y > H) { running = false; alert("游戏结束！得分 " + score); }
    if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w) { ball.dy = -Math.abs(ball.dy); ball.dx += (ball.x - (paddle.x + paddle.w / 2)) / 20; }
    bricks = bricks.filter(b => { if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { score++; document.getElementById("sc").textContent = score; ball.dy *= -1; return false; } return true; });
    if (!bricks.length) { running = false; alert("胜利！得分 " + score); }
  }
  ctx.fillStyle = "#2ecc71"; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = "#f39c12"; ctx.fill();
  requestAnimationFrame(loop);
}
addEventListener("keydown", e => { if (e.key === "ArrowLeft") paddle.x = Math.max(0, paddle.x - 16); else if (e.key === "ArrowRight") paddle.x = Math.min(W - paddle.w, paddle.x + 16); });
cv.onmousemove = e => { const r = cv.getBoundingClientRect(); paddle.x = Math.max(0, Math.min(W - paddle.w, e.clientX - r.left - paddle.w / 2)); };
initBricks(); loop();