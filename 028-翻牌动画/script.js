const flip = document.getElementById("flip");
let cur = 0;
function show(n) {
  flip.innerHTML = `<span class="num flip">${String(n).padStart(2, "0")}</span>`;
}
function flipNum() {
  cur = (cur + 1) % 100;
  const span = document.createElement("span"); span.className = "num"; span.style.transform = "rotateX(-90deg)";
  flip.innerHTML = `<span class="num">${String((cur - 1 + 100) % 100).padStart(2, "0")}</span>`;
  flip.firstChild.classList.add("flip");
  setTimeout(() => { show(cur); }, 250);
}
show(0);
setInterval(flipNum, 1000);