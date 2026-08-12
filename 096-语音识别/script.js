const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) { document.getElementById("text").textContent = "你的浏览器不支持 Speech Recognition API，请使用 Chrome。"; }
else {
  const r = new SR();
  r.lang = "zh-CN"; r.continuous = true; r.interimResults = true;
  const btn = document.getElementById("btn"), status = document.getElementById("status"), text = document.getElementById("text");
  let finalText = "";
  r.onresult = e => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) interim += e.results[i][0].transcript;
    text.textContent = finalText + interim;
    if (e.results[e.results.length - 1].isFinal) finalText += e.results[e.results.length - 1][0].transcript;
  };
  r.onstart = () => { status.textContent = "正在聆听..."; btn.textContent = "⏹ 停止识别"; btn.classList.add("listening"); };
  r.onend = () => { status.textContent = "已停止"; btn.textContent = "🎤 开始识别"; btn.classList.remove("listening"); };
  r.onerror = e => { status.textContent = "错误：" + e.error; };
  btn.onclick = () => { if (r.recording !== false && btn.classList.contains("listening")) r.stop(); else r.start(); };
}