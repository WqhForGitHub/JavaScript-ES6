let board, score;
function init() { board = Array.from({ length: 4 }, () => Array(4).fill(0)); score = 0; add(); add(); draw(); }
function add() {
  const e = [];
  board.forEach((r, i) => r.forEach((v, j) => v === 0 && e.push([i, j])));
  if (!e.length) return;
  const [i, j] = e[Math.floor(Math.random() * e.length)];
  board[i][j] = Math.random() < .9 ? 2 : 4;
}
function draw() {
  const grid = document.getElementById("board"); grid.innerHTML = "";
  board.forEach(r => r.forEach(v => {
    const c = document.createElement("div"); c.className = "cell";
    if (v) { c.textContent = v; c.dataset.v = v; }
    grid.appendChild(c);
  }));
  document.getElementById("sc").textContent = score;
}
function slide(row) {
  let arr = row.filter(x => x), gained = 0;
  for (let i = 0; i < arr.length - 1; i++) if (arr[i] === arr[i + 1]) { arr[i] *= 2; gained += arr[i]; arr.splice(i + 1, 1); }
  while (arr.length < 4) arr.push(0);
  return { arr, gained };
}
function rotate() {
  const n = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) n[i][j] = board[j][3 - i];
  board = n;
}
function move(dir) {
  for (let r = 0; r < dir; r++) rotate();
  const before = JSON.stringify(board);
  let total = 0;
  board = board.map(row => { const { arr, gained } = slide(row); total += gained; return arr; });
  score += total;
  for (let r = 0; r < (4 - dir) % 4; r++) rotate();
  if (JSON.stringify(board) !== before) { add(); draw(); check(); }
}
function check() {
  if (board.some(r => r.includes(2048))) { alert("🎉 你达成了 2048！"); return; }
  if (board.every(r => r.every(x => x))) {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      if (i < 3 && board[i][j] === board[i + 1][j]) return;
      if (j < 3 && board[i][j] === board[i][j + 1]) return;
    }
    alert("游戏结束！得分 " + score);
  }
}
addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move(0);
  else if (e.key === "ArrowUp") move(1);
  else if (e.key === "ArrowRight") move(2);
  else if (e.key === "ArrowDown") move(3);
});
document.getElementById("restart").onclick = init;
init();