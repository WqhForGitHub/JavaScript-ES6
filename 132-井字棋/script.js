let cur = "X", cells, over;
const win = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function init() {
  cur = "X"; over = false;
  const board = document.getElementById("board"); board.innerHTML = "";
  cells = Array.from({ length: 9 }, (_, i) => {
    const d = document.createElement("div"); d.className = "cell";
    d.onclick = () => play(i); board.appendChild(d); return d;
  });
  document.getElementById("stat").textContent = "轮到 X";
}
function play(i) {
  if (over || cells[i].textContent) return;
  cells[i].textContent = cur; cells[i].classList.add(cur);
  const line = win.find(l => l.every(j => cells[j].textContent === cur));
  if (line) { over = true; line.forEach(j => cells[j].classList.add("win")); document.getElementById("stat").textContent = `${cur} 获胜！`; return; }
  if (cells.every(c => c.textContent)) { over = true; document.getElementById("stat").textContent = "平局！"; return; }
  cur = cur === "X" ? "O" : "X";
  document.getElementById("stat").textContent = "轮到 " + cur;
}
document.getElementById("reset").onclick = init; init();