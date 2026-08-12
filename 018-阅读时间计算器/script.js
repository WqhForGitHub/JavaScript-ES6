document.getElementById("calc").onclick = () => {
  const v = document.getElementById("text").value;
  const wpm = parseInt(document.getElementById("wpm").value) || 300;
  const cn = (v.match(/[\u4e00-\u9fa5]/g) || []).length;
  const en = (v.match(/[a-zA-Z]+/g) || []).length;
  const total = cn + en;
  const totalSec = Math.round(total / wpm * 60);
  document.getElementById("words").textContent = total;
  document.getElementById("mins").textContent = Math.floor(totalSec / 60);
  document.getElementById("seconds").textContent = totalSec % 60;
};