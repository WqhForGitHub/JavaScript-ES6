let score, time, timer, moleTimer, running;
const board = document.getElementById("board"); board.innerHTML = "";
const holes = Array.from({ length: 9 }, () => { const d = document.createElement("div"); d.className = "hole"; d.onclick = () => hit(d); board.appendChild(d); return d; });
function reset() { score = 0; time = 20; running = false; document.getElementById("sc").textContent = 0; document.getElementById("time").textContent = 20; holes.forEach(h => h.textContent = ""); document.getElementById("start").textContent = "开始"; }
function pop() { if (!running) return; holes.forEach(h => h.textContent = ""); const h = holes[Math.floor(Math.random() * 9)]; h.textContent = "🐹"; h.dataset.mole = 1; moleTimer = setTimeout(pop, 700 + Math.random() * 400); }
function hit(h) { if (!running || !h.dataset.mole) return; h.textContent = ""; delete h.dataset.mole; score++; document.getElementById("sc").textContent = score; }
document.getElementById("start").onclick = () => {
  if (running) return; running = true; score = 0; time = 20;
  document.getElementById("sc").textContent = 0; document.getElementById("time").textContent = 20;
  document.getElementById("start").textContent = "游戏中...";
  pop();
  timer = setInterval(() => {
    time--; document.getElementById("time").textContent = time;
    if (time <= 0) { running = false; clearInterval(timer); clearTimeout(moleTimer); holes.forEach(h => h.textContent = ""); document.getElementById("start").textContent = "再来一次  得分 " + score; }
  }, 1000);
};
reset();