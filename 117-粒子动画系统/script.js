const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, particles;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; init(); }
function init() {
  particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8,
    r: Math.random() * 2 + 1, c: `hsl(${Math.random() * 360},80%,60%)`
  }));
}
function loop() {
  ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
  });
  for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) { ctx.strokeStyle = `rgba(108,92,231,${(1 - dist / 120) * .3})`; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
  }
  requestAnimationFrame(loop);
}
cv.onmousemove = e => { particles.sort((a, b) => 0); particles[0] && (particles[0].x += (e.clientX - particles[0].x) * .05, particles[0].y += (e.clientY - particles[0].y) * .05); };
addEventListener("resize", resize); resize(); loop();