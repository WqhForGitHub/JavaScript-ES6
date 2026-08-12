const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
function roll() {
  const n = Math.min(parseInt(document.getElementById("n").value) || 1, 6);
  const big = document.getElementById("dice");
  big.classList.remove("roll"); void big.offsetWidth; big.classList.add("roll");
  big.textContent = faces[Math.floor(Math.random() * 6)];
  const out = document.getElementById("out"); out.innerHTML = "";
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = Math.floor(Math.random() * 6) + 1;
    sum += v;
    out.appendChild(Object.assign(document.createElement("div"), { textContent: faces[v - 1] }));
  }
  document.getElementById("sum").textContent = "总和: " + sum;
}
document.getElementById("roll").onclick = roll;