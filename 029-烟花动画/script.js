const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, parts = [];
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
function explode(x, y) {
  const hue = Math.random() * 360, count = 80;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2, v = Math.random() * 5 + 2;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: `hsl(${hue + Math.random() * 40},100%,60%)` });
  }
}
function loop() {
  ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(0, 0, W, H);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .06; p.life -= .012; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); });
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
cv.onclick = e => explode(e.clientX, e.clientY);
setInterval(() => explode(Math.random() * W, Math.random() * H * .7), 1500);
addEventListener("resize", resize); resize(); loop();