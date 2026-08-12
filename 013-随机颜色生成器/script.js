const history = [];
function gen() {
  const r = Math.floor(Math.random() * 256), g = Math.floor(Math.random() * 256), b = Math.floor(Math.random() * 256);
  const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  document.getElementById("swatch").style.background = hex;
  document.getElementById("hex").value = hex.toUpperCase();
  document.getElementById("rgb").value = `rgb(${r}, ${g}, ${b})`;
  history.unshift(hex);
  if (history.length > 10) history.pop();
  const box = document.getElementById("history");
  box.innerHTML = "";
  history.forEach(c => {
    const d = document.createElement("div");
    d.style.background = c;
    d.title = c;
    d.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(c); };
    box.appendChild(d);
  });
}
document.getElementById("gen").onclick = gen;
document.getElementById("copy").onclick = () => navigator.clipboard && navigator.clipboard.writeText(document.getElementById("hex").value);
gen();