const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let img = null, sx = 40, sy = 40, sw = 200, sh = 200, dragging = null;
function draw() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (img) ctx.drawImage(img, 0, 0, cv.width, cv.height);
  ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(0, 0, cv.width, cv.height);
  if (img) { ctx.clearRect(sx, sy, sw, sh); ctx.drawImage(img, sx / cv.width * img.naturalWidth, sy / cv.height * img.naturalHeight, sw / cv.width * img.naturalWidth, sh / cv.height * img.naturalHeight, sx, sy, sw, sh); }
  ctx.strokeStyle = "#fff"; ctx.strokeRect(sx, sy, sw, sh);
}
document.getElementById("file").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  img = new Image(); img.onload = draw; img.src = URL.createObjectURL(f);
};
function pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
cv.onmousedown = e => { const [x, y] = pos(e); if (x > sx && x < sx + sw && y > sy && y < sy + sh) dragging = { dx: x - sx, dy: y - sy }; };
cv.onmousemove = e => {
  if (!dragging || !img) return;
  const [x, y] = pos(e);
  sx = Math.max(0, Math.min(cv.width - sw, x - dragging.dx));
  sy = Math.max(0, Math.min(cv.height - sh, y - dragging.dy));
  draw();
};
cv.onmouseup = () => { dragging = null; crop(); };
function crop() {
  const c = document.createElement("canvas"); c.width = sw; c.height = sh;
  c.getContext("2d").drawImage(cv, sx, sy, sw, sh, 0, 0, sw, sh);
  document.getElementById("result").src = c.toDataURL();
}
document.getElementById("dl").onclick = () => { const a = document.createElement("a"); a.href = document.getElementById("result").src; a.download = "crop.png"; a.click(); };