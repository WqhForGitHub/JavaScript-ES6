let step = 0;
const panels = document.querySelectorAll(".panel"), labels = document.querySelectorAll(".labels span"), total = 3;
function render() {
  panels.forEach((p, i) => p.classList.toggle("active", i === step));
  labels.forEach((l, i) => l.classList.toggle("active", i <= step));
  document.getElementById("prog").style.width = ((step + 1) / total * 100) + "%";
  document.getElementById("prev").disabled = step === 0;
  document.getElementById("next").textContent = step === total - 1 ? "完成" : "下一步";
}
document.getElementById("next").onclick = () => { if (step < total - 1) { step++; render(); } else alert("提交成功"); };
document.getElementById("prev").onclick = () => { if (step > 0) { step--; render(); } };
render();