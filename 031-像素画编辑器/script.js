const grid = document.getElementById("grid"), color = document.getElementById("color");
let painting = false;
for (let i = 0; i < 16 * 16; i++) {
  const c = document.createElement("div"); c.className = "cell";
  c.onmousedown = e => { e.preventDefault(); c.style.background = color.value; painting = true; };
  c.onmouseenter = () => { if (painting) c.style.background = color.value; };
  grid.appendChild(c);
}
addEventListener("mouseup", () => painting = false);
document.getElementById("clear").onclick = () => grid.querySelectorAll(".cell").forEach(c => c.style.background = "#fff");