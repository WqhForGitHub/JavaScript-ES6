const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const W = 10, H = 20, S = 20;
const pieces = [{ s: [[1,1,1,1]], c: "#00f0f0" }, { s: [[1],[1],[1],[1]], c: "#00f0f0" }, { s: [[1,1],[1,1]], c: "#f0f000" }, { s: [[1,0],[1,1],[0,1]], c: "#00f000" }, { s: [[0,1],[1,1],[1,0]], c: "#f0a000" }, { s: [[1,1,1],[0,1,0]], c: "#a000f0" }, { s: [[1,1],[1,0],[1,0]], c: "#f00000" }];
let grid, p, x, y, score, timer;
function newPiece() { const pd = pieces[Math.floor(Math.random() * pieces.length)]; p = { s: pd.s.map(r => [...r]), c: pd.c }; x = 3; y = 0; }
function collide(nx, ny, s = p.s) { return s.some((row, j) => row.some((v, i) => v && (grid[ny + j] && grid[ny + j][nx + i] !== 0))); }
function merge() { p.s.forEach((r, j) => r.forEach((v, i) => v && (grid[y + j][x + i] = p.c))); }
function clear() { for (let j = H - 1; j >= 0; j--) if (grid[j].every(c => c)) { grid.splice(j, 1); grid.unshift(Array(W).fill(0)); score += 10; document.getElementById("sc").textContent = score; j++; } }
function rot() { const s = p.s[0].map((_, i) => p.s.map(r => r[i]).reverse()); if (!collide(x, y, s)) p.s = s; }
function step() { if (!collide(x, y + 1)) { y++; } else { merge(); clear(); newPiece(); if (collide(x, y)) { clearInterval(timer); alert("游戏结束，得分 " + score); init(); } } draw(); }
function draw() {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 200, 400);
  grid.forEach((r, j) => r.forEach((c, i) => { if (c) { ctx.fillStyle = c; ctx.fillRect(i * S, j * S, S - 1, S - 1); } }));
  p.s.forEach((r, j) => r.forEach((v, i) => v && (ctx.fillStyle = p.c, ctx.fillRect((x + i) * S, (y + j) * S, S - 1, S - 1))));
}
function init() { grid = Array.from({ length: H }, () => Array(W).fill(0)); score = 0; document.getElementById("sc").textContent = 0; newPiece(); clearInterval(timer); timer = setInterval(step, 400); draw(); }
addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && !collide(x - 1, y)) { x--; draw(); }
  else if (e.key === "ArrowRight" && !collide(x + 1, y)) { x++; draw(); }
  else if (e.key === "ArrowDown" && !collide(x, y + 1)) { y++; draw(); }
  else if (e.key === "ArrowUp") { rot(); draw(); }
});
init();