let t0 = 0, elapsed = 0, running = false, raf;
function fmt(ms) { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), cs = Math.floor((ms % 1000) / 10); return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`; }
function loop() { if (!running) return; document.getElementById("time").textContent = fmt(Date.now() - t0 + elapsed); raf = requestAnimationFrame(loop); }
document.getElementById("start").onclick = () => {
  const btn = document.getElementById("start");
  if (running) { elapsed += Date.now() - t0; running = false; btn.textContent = "继续"; btn.classList.remove("primary"); }
  else { t0 = Date.now(); running = true; btn.textContent = "暂停"; btn.classList.add("primary"); loop(); }
};
document.getElementById("lap").onclick = () => { if (running || elapsed) { const li = document.createElement("li"); li.textContent = `#${document.querySelectorAll("#laps li").length + 1}  ` + fmt(running ? Date.now() - t0 + elapsed : elapsed); document.getElementById("laps").prepend(li); } };
document.getElementById("reset").onclick = () => { running = false; elapsed = 0; document.getElementById("time").textContent = "00:00.00"; document.getElementById("laps").innerHTML = ""; document.getElementById("start").textContent = "开始"; document.getElementById("start").classList.add("primary"); };