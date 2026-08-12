document.getElementById("go").onclick = async () => {
  const btn = document.getElementById("go"); btn.disabled = true; btn.textContent = "测速中...";
  const fill = document.getElementById("fill"); const speed = document.getElementById("speed");
  fill.style.width = "0%"; speed.textContent = "0 Mbps";
  // 下载 Cloudflare 测速端点
  const url = "https://speed.cloudflare.com/__down?bytes=10000000";
  let lastT = performance.now(), lastB = 0;
  try {
    const r = await fetch(url, { cache: "no-store" });
    const reader = r.body.getReader();
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      const now = performance.now();
      if (now - lastT > 200) {
        const mbps = ((received - lastB) / ((now - lastT) / 1000)) * 8 / 1e6;
        speed.textContent = mbps.toFixed(2) + " Mbps";
        fill.style.width = Math.min(100, mbps / 50 * 100) + "%";
        lastT = now; lastB = received;
      }
    }
    const totalMbps = (received / ((performance.now() - lastT + 1) / 1000)) * 8 / 1e6;
    speed.textContent = totalMbps.toFixed(2) + " Mbps";
    fill.style.width = Math.min(100, totalMbps / 50 * 100) + "%";
  } catch (e) { speed.textContent = "测速失败：" + e.message; }
  btn.disabled = false; btn.textContent = "重新测速";
};