const N = 9, M = 10;
let grid, cells, over;
function init() {
  grid = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ mine: false, open: false, n: 0 })));
  let placed = 0; while (placed < M) { const i = Math.floor(Math.random() * N), j = Math.floor(Math.random() * N); if (!grid[i][j].mine) { grid[i][j].mine = true; placed++; } }
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) grid[i][j].n = neighbors(i, j).filter(([a, b]) => grid[a][b].mine).length;
  const board = document.getElementById("board"); board.innerHTML = ""; cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const c = document.createElement("div"); c.className = "cell";
    c.oncontextmenu = e => { e.preventDefault(); if (over || grid[i][j].open) return; c.textContent = c.textContent === "🚩" ? "" : "🚩"; };
    c.onclick = () => open(i, j);
    board.appendChild(c); cells.push({ i, j, el: c });
  }
  over = false; document.getElementById("status").textContent = "进行中";
}
function neighbors(i, j) { const arr = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (a || b) { const x = i + a, y = j + b; if (x >= 0 && x < N && y >= 0 && y < N) arr.push([x, y]); } return arr; }
function cell(i, j) { return cells[N * i + j].el; }
function open(i, j) {
  if (over || grid[i][j].open) return; const c = cell(i, j);
  grid[i][j].open = true; c.classList.add("open"); c.textContent = "";
  if (grid[i][j].mine) { c.classList.add("mine"); c.textContent = "💣"; over = true; document.getElementById("status").textContent = "失败！"; return; }
  if (grid[i][j].n > 0) { c.textContent = grid[i][j].n; c.classList.add("n" + grid[i][j].n); }
  else neighbors(i, j).forEach(([a, b]) => open(a, b));
  if (cells.every(({ i, j }) => grid[i][j].mine || grid[i][j].open)) { over = true; document.getElementById("status").textContent = "胜利！"; }
}
document.getElementById("reset").onclick = init; init();