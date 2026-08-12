function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn.apply(this, args); }
  };
}
let a = 0, b = 0;
const area = document.getElementById("area");
area.onmousemove = () => { a++; document.getElementById("a").textContent = a; };
area.onmousemove = throttle(() => { b++; document.getElementById("b").textContent = b; }, 200);