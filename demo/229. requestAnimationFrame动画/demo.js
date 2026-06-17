// 229. requestAnimationFrame动画

function animate(duration, onUpdate) {
  const raf =
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame
      : (fn) => setTimeout(fn, 16);
  const start = Date.now();
  function frame() {
    const p = Math.min((Date.now() - start) / duration, 1);
    onUpdate(p);
    if (p < 1) raf(frame);
  }
  raf(frame);
}
animate(50, (p) => console.log(p.toFixed(2)));
