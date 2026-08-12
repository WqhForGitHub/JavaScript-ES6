const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const N = 15, S = 28, PAD = 14;
let board, cur, win;
function init() { board = Array.from({ length: N }, () => Array(N).fill(0)); cur = 1; win = 0; document.getElementById("info").textContent = "轮到黑棋"; draw(); }
function draw() {
  ctx.fillStyle = "#e6c79c"; ctx.fillRect(0, 0, 420, 420);
  ctx.strokeStyle = "#5b3a29"; ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) {
    ctx.beginPath(); ctx.moveTo(PAD + i * S, PAD); ctx.lineTo(PAD + i * S, PAD + (N - 1) * S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD, PAD + i * S); ctx.lineTo(PAD + (N - 1) * S, PAD + i * S); ctx.stroke();
  }
  board.forEach((r, i) => r.forEach((v, j) => { if (v) { ctx.fillStyle = v === 1 ? "#000" : "#fff"; ctx.beginPath(); ctx.arc(PAD + i * S, PAD + j * S, 12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#5b3a29"; ctx.stroke(); } }));
}
cv.onclick = e => {
  if (win) return;
  const r = cv.getBoundingClientRect(), x = Math.round((e.clientX - r.left - PAD) / S), y = Math.round((e.clientY - r.top - PAD) / S);
  if (x < 0 || x >= N || y < 0 || y >= N || board[x][y]) return;
  board[x][y] = cur;
  if (check(x, y, cur)) { win = cur; document.getElementById("info").textContent = `${cur === 1 ? "黑" : "白"}棋获胜！`; }
  else { cur = cur === 1 ? 2 : 1; document.getElementById("info").textContent = "轮到" + (cur === 1 ? "黑" : "白") + "棋"; }
  draw();
};
function check(x, y, v) {
  return [[1, 0], [0, 1], [1, 1], [1, -1]].some(([dx, dy]) => {
    let c = 1;
    for (let k = 1; k < 5; k++) { if (board[x + dx * k]?.[y + dy * k] === v) c++; else break; }
    for (let k = 1; k < 5; k++) { if (board[x - dx * k]?.[y - dy * k] === v) c++; else break; }
    return c >= 5;
  });
}
document.getElementById("reset").onclick = init;
init();