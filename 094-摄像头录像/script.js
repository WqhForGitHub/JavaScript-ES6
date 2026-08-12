const v = document.getElementById("v"), rec = document.getElementById("rec"), time = document.getElementById("time"), out = document.getElementById("out");
let recorder, chunks = [], t0, timer;
document.getElementById("start").onclick = async () => {
  v.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  rec.disabled = false;
};
rec.onclick = () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop(); rec.textContent = "开始录制"; rec.className = ""; clearInterval(timer); return;
  }
  chunks = [];
  recorder = new MediaRecorder(v.srcObject);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<video src="${url}" controls></video><br><a href="${url}" download="record.webm">下载录像</a>`;
  };
  recorder.start(); rec.textContent = "停止录制"; rec.className = "rec";
  t0 = Date.now();
  timer = setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    time.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }, 200);
};