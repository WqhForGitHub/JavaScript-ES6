// 241. DOM动画系统

function moveTo(el, x, duration = 300) {
  const start = parseFloat(el.style.left) || 0,
    begin = Date.now();
  function tick() {
    const p = Math.min((Date.now() - begin) / duration, 1);
    el.style.left = `${start + (x - start) * p}px`;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
console.log("moveTo ready");
