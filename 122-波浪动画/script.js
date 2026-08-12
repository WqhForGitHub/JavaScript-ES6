const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, t = 0;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
function wave(amp, len, color, off) {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) { ctx.lineTo(x, H / 2 + Math.sin(x / len + t + off) * amp + H / 4); }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function loop() {
  ctx.clearRect(0, 0, W, H); t += .02;
  wave(60, 200, "rgba(255,255,255,.2)", 0);
  wave(50, 150, "rgba(255,255,255,.3)", 1);
  wave(40, 120, "rgba(255,255,255,.4)", 2);
  requestAnimationFrame(loop);
}
addEventListener("resize", resize); resize(); loop();