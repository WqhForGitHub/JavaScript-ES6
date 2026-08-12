let minutes = 25, secs = 0, timer = null, running = false, count = parseInt(localStorage.getItem("pomo") || "0");
document.getElementById("count").textContent = count;
function render() {
  document.getElementById("time").textContent = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  document.title = `🍅 ${minutes}:${String(secs).padStart(2, "0")}`;
}
function tick() {
  if (secs === 0) {
    if (minutes === 0) { stop(); if (timer === null || running) { count++; localStorage.setItem("pomo", count); document.getElementById("count").textContent = count; } alert("时间到！"); reset(25); return; }
    minutes--; secs = 59;
  } else secs--;
  render();
}
function start() {
  if (running) { running = false; clearInterval(timer); timer = null; document.getElementById("start").textContent = "继续"; return; }
  running = true; timer = setInterval(tick, 1000);
  document.getElementById("start").textContent = "暂停";
}
function stop() { running = false; clearInterval(timer); timer = null; document.getElementById("start").textContent = "开始"; }
function reset(m) { stop(); minutes = m; secs = 0; render(); }
document.getElementById("start").onclick = start;
document.getElementById("reset").onclick = () => reset(parseInt(document.querySelector(".modes .active").dataset.m));
document.querySelectorAll(".modes button").forEach(b => b.onclick = () => {
  document.querySelectorAll(".modes button").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); reset(parseInt(b.dataset.m));
});
render();