const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, drops;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; drops = Array.from({ length: 300 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: Math.random() * 20 + 10, s: Math.random() * 6 + 4 })); }
function loop() {
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(174,194,224,.6)"; ctx.lineWidth = 1;
  drops.forEach(d => { ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.l); ctx.stroke(); d.y += d.s; if (d.y > H) { d.y = -d.l; d.x = Math.random() * W; } });
  requestAnimationFrame(loop);
}
addEventListener("resize", resize); resize(); loop();