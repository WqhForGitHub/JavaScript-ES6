function debounce(fn, wait) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}
let a = 0, b = 0;
const inp = document.getElementById("in");
const na = document.getElementById("a"), nb = document.getElementById("b");
inp.addEventListener("input", () => { a++; na.textContent = a; });
inp.addEventListener("input", debounce(() => { b++; nb.textContent = b; }, 500));
document.getElementById("reset").onclick = () => { a = b = 0; na.textContent = nb.textContent = 0; inp.value = ""; };