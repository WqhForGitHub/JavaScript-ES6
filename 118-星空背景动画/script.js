const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W, H, stars;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; stars = Array.from({ length: 400 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * W, s: Math.random() * 1.5 })); }
function loop() {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  stars.forEach(s => {
    s.z -= 4; if (s.z <= 0) { s.z = W; s.x = Math.random() * W; s.y = Math.random() * H; }
    const k = 128 / s.z, x = s.x * k + W / 2 * (1 - k), y = s.y * k + H / 2 * (1 - k);
    if (x >= 0 && x < W && y >= 0 && y < H) {
      const a = (1 - s.z / W); ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, s.s * (1 + a * 2), s.s * (1 + a * 2));
    }
  });
  requestAnimationFrame(loop);
}
addEventListener("resize", resize); resize(); loop();