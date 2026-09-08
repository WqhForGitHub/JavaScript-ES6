const rec = document.getElementById("rec"), stop = document.getElementById("stop"), timeEl = document.getElementById("time"), out = document.getElementById("out");
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let recorder, chunks = [], audioCtx, analyser, source, raf, t0, timer;
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<audio src="${url}" controls></audio><br><a href="${url}" download="audio.webm">下载录音</a>`;
  };
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser(); analyser.fftSize = 64;
  source.connect(analyser); draw();
  recorder.start(); rec.disabled = true; stop.disabled = false;
  t0 = Date.now();
  timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); timeEl.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 200);
}
function draw() {
  raf = requestAnimationFrame(draw);
  const arr = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(arr);
  ctx.clearRect(0, 0, cv.width, cv.height);
  const w = cv.width / arr.length;
  arr.forEach((v, i) => {
    ctx.fillStyle = `hsl(${i * 6},80%,60%)`;
    ctx.fillRect(i * w, cv.height - v / 255 * cv.height, w - 1, v / 255 * cv.height);
  });
}
rec.onclick = start;
stop.onclick = () => { recorder.stop(); clearInterval(timer); cancelAnimationFrame(raf); rec.disabled = false; stop.disabled = true; };