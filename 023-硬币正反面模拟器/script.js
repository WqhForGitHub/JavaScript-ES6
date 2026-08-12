let h = 0, t = 0;
const coin = document.getElementById("coin");
document.getElementById("flip").onclick = () => {
  coin.classList.remove("flip"); void coin.offsetWidth; coin.classList.add("flip");
  setTimeout(() => {
    if (Math.random() < 0.5) { coin.textContent = "正"; h++; } else { coin.textContent = "反"; t++; }
    document.getElementById("h").textContent = h;
    document.getElementById("t").textContent = t;
    document.getElementById("c").textContent = h + t;
  }, 600);
};
document.getElementById("reset").onclick = () => { h = t = 0; ["h", "t", "c"].forEach(i => document.getElementById(i).textContent = "0"); coin.textContent = "正"; };