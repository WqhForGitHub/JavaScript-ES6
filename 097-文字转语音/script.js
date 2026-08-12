const synth = window.speechSynthesis;
const voiceSel = document.getElementById("voice");
function load() {
  const vs = synth.getVoices();
  voiceSel.innerHTML = vs.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("");
}
load(); synth.onvoiceschanged = load;
document.getElementById("say").onclick = () => {
  synth.cancel();
  const u = new SpeechSynthesisUtterance(document.getElementById("txt").value);
  u.rate = +document.getElementById("rate").value;
  u.pitch = +document.getElementById("pitch").value;
  const v = synth.getVoices().find(x => x.name === voiceSel.value);
  if (v) u.voice = v;
  synth.speak(u);
};
document.getElementById("stop").onclick = () => synth.cancel();