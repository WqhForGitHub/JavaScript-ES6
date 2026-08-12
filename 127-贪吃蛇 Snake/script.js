const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const N = 16, S = 20;
let snake, dir, food, score, dead, timer;
function init() {
  snake = [{ x: 8, y: 8 }]; dir = { x: 1, y: 0 }; food = rand(); score = 0; dead = false;
  document.getElementById("score").textContent = 0;
  clearInterval(timer); timer = setInterval(step, 130);
  cv.focus();
}
function rand() { let p; do p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; while (snake.some(s => s.x === p.x && s.y === p.y)); return p; }
function step() {
  if (dead) return;
  const h = { x: (snake[0].x + dir.x + N) % N, y: (snake[0].y + dir.y + N) % N };
  if (snake.some(s => s.x === h.x && s.y === h.y)) { dead = true; alert("游戏结束！得分 " + score); return; }
  snake.unshift(h);
  if (h.x === food.x && h.y === food.y) { score++; document.getElementById("score").textContent = score; food = rand(); }
  else snake.pop();
  draw();
}
function draw() {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 320, 320);
  ctx.fillStyle = "#e74c3c"; ctx.fillRect(food.x * S, food.y * S, S, S);
  snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? "#2ecc71" : "#27ae60"; ctx.fillRect(s.x * S, s.y * S, S - 1, S - 1); });
}
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if ((k === "arrowup" || k === "w") && dir.y === 0) dir = { x: 0, y: -1 };
  else if ((k === "arrowdown" || k === "s") && dir.y === 0) dir = { x: 0, y: 1 };
  else if ((k === "arrowleft" || k === "a") && dir.x === 0) dir = { x: -1, y: 0 };
  else if ((k === "arrowright" || k === "d") && dir.x === 0) dir = { x: 1, y: 0 };
});
document.getElementById("restart").onclick = init;
init();