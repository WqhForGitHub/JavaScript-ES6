const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const cx = 200, cy = 200, size = 80;
const verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[0,3,7,4]];
let ax = .5, ay = .5, dragging = null;
function rot(v, ax, ay) {
  let [x, y, z] = v;
  let t = y * Math.cos(ax) - z * Math.sin(ax); z = y * Math.sin(ax) + z * Math.cos(ax); y = t;
  t = x * Math.cos(ay) + z * Math.sin(ay); z = -x * Math.sin(ay) + z * Math.cos(ay); x = t;
  return [x, y, z];
}
function draw() {
  ctx.clearRect(0, 0, 400, 400);
  const p = verts.map(v => { const r = rot(v, ax, ay); const s = 300 / (300 + r[2] * size); return [cx + r[0] * size * s, cy + r[1] * size * s, r[2]]; });
  faces.sort((a, b) => (p[a[0]][2] + p[a[1]][2] + p[a[2]][2] + p[a[3]][2]) / 4 - (p[b[0]][2] + p[b[1]][2] + p[b[2]][2] + p[b[3]][2]) / 4);
  faces.forEach((f, i) => {
    ctx.beginPath(); ctx.moveTo(p[f[0]][0], p[f[0]][1]);
    [1, 2, 3].forEach(k => ctx.lineTo(p[f[k]][0], p[f[k]][1])); ctx.closePath();
    ctx.fillStyle = `hsla(${i * 60},70%,55%,.7)`; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.stroke();
  });
  ax += .005; ay += .005;
  requestAnimationFrame(draw);
}
cv.onmousedown = e => dragging = { x: e.clientX, y: e.clientY };
document.onmousemove = e => { if (!dragging) return; ax += (e.clientY - dragging.y) / 100; ay += (e.clientX - dragging.x) / 100; dragging = { x: e.clientX, y: e.clientY }; };
document.onmouseup = () => dragging = null;
draw();