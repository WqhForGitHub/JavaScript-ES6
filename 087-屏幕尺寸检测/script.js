function upd() {
  document.getElementById("vp").textContent = `${innerWidth} × ${innerHeight}`;
  document.getElementById("sc").textContent = `${screen.width} × ${screen.height}`;
  document.getElementById("ava").textContent = `${screen.availWidth} × ${screen.availHeight}`;
  document.getElementById("dpr").textContent = devicePixelRatio.toFixed(2);
  const w = innerWidth;
  document.getElementById("badge").textContent = w < 768 ? "📱 移动端" : w < 1024 ? "平板端" : "🖥️ 桌面端";
}
addEventListener("resize", upd); upd();