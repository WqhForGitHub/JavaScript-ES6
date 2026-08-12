let scores = JSON.parse(localStorage.getItem("scores") || "[]");
function save() { localStorage.setItem("scores", JSON.stringify(scores)); }
function grade(s) { return s >= 90 ? "A" : s >= 80 ? "B" : s >= 60 ? "C" : "D"; }
function render() {
  const body = document.getElementById("body"); body.innerHTML = "";
  scores.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.name}</td><td>${r.sub}</td><td>${r.score}</td><td class="${grade(r.score)}">${grade(r.score)}</td><td class="del">✕</td>`;
    tr.querySelector(".del").onclick = () => { scores = scores.filter(x => x.id !== r.id); save(); render(); };
    body.appendChild(tr);
  });
  const arr = scores.map(s => s.score);
  document.getElementById("cnt").textContent = arr.length;
  document.getElementById("avg").textContent = arr.length ? (arr.reduce((a, b) => a + b) / arr.length).toFixed(1) : 0;
  document.getElementById("max").textContent = arr.length ? Math.max(...arr) : 0;
  document.getElementById("min").textContent = arr.length ? Math.min(...arr) : 0;
}
document.getElementById("add").onclick = () => {
  const name = document.getElementById("name").value.trim();
  const sub = document.getElementById("sub").value.trim();
  const score = parseFloat(document.getElementById("score").value);
  if (!name || isNaN(score)) return alert("请填写姓名和分数");
  scores.push({ id: Date.now(), name, sub, score });
  ["name", "score"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
render();