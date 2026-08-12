let curSeed = "" + Date.now();
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rnd(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; }; }
function draw(ctx, seed, size) {
  const r = rnd(seed || Math.random() * 1e9 | 0);
  const bg = `hsl(${Math.floor(r() * 360)},70%,60%)`;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);
  const cell = size / 7;
  ctx.fillStyle = "#fff";
  for (let y = 0; y < 7; y++) for (let x = 0; x < 4; x++) {
    if (r() > 0.5) {
      ctx.fillRect(x * cell, y * cell, cell, cell);
      if (x < 3) ctx.fillRect((6 - x) * cell, y * cell, cell, cell);
    }
  }
}
function genGrid() {
  const grid = document.getElementById("grid"); grid.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    draw(c.getContext("2d"), Math.random() * 1e9 | 0, 64);
    c.onclick = () => { const main = document.getElementById("canvas"); draw(main.getContext("2d"), Math.random() * 1e9 | 0, 200); };
    grid.appendChild(c);
  }
}
document.getElementById("gen").onclick = () => {
  const s = document.getElementById("seed").value;
  curSeed = s ? hash(s) : Math.random() * 1e9 | 0;
  draw(document.getElementById("canvas").getContext("2d"), curSeed, 200);
  genGrid();
};
document.getElementById("dl").onclick = () => {
  const a = document.createElement("a"); a.download = "avatar.png";
  a.href = document.getElementById("canvas").toDataURL(); a.click();
};
document.getElementById("gen").click();