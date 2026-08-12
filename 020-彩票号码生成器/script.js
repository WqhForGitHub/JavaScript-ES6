function pick(n, max, sorted = true) {
  const set = new Set();
  while (set.size < n) set.add(Math.floor(Math.random() * max) + 1);
  const arr = [...set];
  return sorted ? arr.sort((a, b) => a - b) : arr;
}
function ball(num, cls) {
  const d = document.createElement("div");
  d.className = "ball " + cls; d.textContent = num;
  return d;
}
document.getElementById("gen").onclick = () => {
  const t = document.getElementById("type").value;
  const out = document.getElementById("out");
  out.innerHTML = "";
  if (t === "ssq") {
    pick(6, 33).forEach(n => out.appendChild(ball(String(n).padStart(2, "0"), "red")));
    out.appendChild(ball(String(pick(1, 16, false)[0]).padStart(2, "0"), "blue"));
  } else if (t === "dlt") {
    pick(5, 35).forEach(n => out.appendChild(ball(String(n).padStart(2, "0"), "red")));
    pick(2, 12).forEach(n => out.appendChild(ball(String(n).padStart(2, "0"), "blue")));
  } else {
    pick(3, 10, false).map(x => x % 10).forEach(n => out.appendChild(ball(n, "blue")));
  }
};