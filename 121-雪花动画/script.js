const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, flakes;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; flakes = Array.from({ length: 150 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 3 + 1, s: Math.random() * 2 + .5, d: Math.random() * 2 })); }
function loop() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  flakes.forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); f.y += f.s; f.x += Math.sin(f.d) * .5; if (f.y > H) { f.y = -5; f.x = Math.random() * W; } });
  requestAnimationFrame(loop);
}
addEventListener("resize", resize); resize(); loop();