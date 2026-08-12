function render() {
  const list = document.getElementById("list"); list.innerHTML = "";
  let n = 0, sz = 0;
  Object.keys(localStorage).forEach(k => {
    n++; sz += (k + localStorage[k]).length * 2;
    const li = document.createElement("li");
    li.innerHTML = `<b></b><span></span><button>✕</button>`;
    li.querySelector("b").textContent = k;
    li.querySelector("span").textContent = localStorage[k];
    li.querySelector("button").onclick = () => { localStorage.removeItem(k); render(); };
    list.appendChild(li);
  });
  document.getElementById("n").textContent = n;
  document.getElementById("sz").textContent = sz;
}
document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  const k = document.getElementById("k").value.trim();
  if (!k) return;
  localStorage.setItem(k, document.getElementById("v").value);
  document.getElementById("k").value = ""; document.getElementById("v").value = "";
  render();
};
document.getElementById("clear").onclick = () => { if (confirm("确定清空？")) { localStorage.clear(); render(); } };
render();