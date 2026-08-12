const v = document.getElementById("v"), res = document.getElementById("res");
let raf;
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  v.srcObject = stream; await v.play();
  scan();
}
function scan() {
  raf = requestAnimationFrame(scan);
  if (v.readyState !== v.HAVE_ENOUGH_DATA) return;
  const c = document.createElement("canvas");
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
  const data = c.getContext("2d").getImageData(0, 0, c.width, c.height);
  const code = jsQR ? jsQR(data.data, data.width, data.height) : null;
  if (code) { res.textContent = "✓ 识别到：" + code.data; res.style.color = "#2ecc71"; }
}
document.getElementById("start").onclick = start;
addEventListener("beforeunload", () => cancelAnimationFrame(raf));