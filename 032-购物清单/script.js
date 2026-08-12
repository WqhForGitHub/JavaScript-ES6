let items = JSON.parse(localStorage.getItem("shop") || "[]");
function save() { localStorage.setItem("shop", JSON.stringify(items)); }
function render() {
  const body = document.getElementById("body"); body.innerHTML = "";
  let total = 0;
  items.forEach(it => {
    const sub = it.qty * it.price;
    if (!it.done) total += sub;
    const tr = document.createElement("tr");
    if (it.done) tr.classList.add("done");
    tr.innerHTML = `<td><input type="checkbox" ${it.done ? "checked" : ""}></td><td class="name"></td><td>${it.qty}</td><td>¥${it.price}</td><td>¥${sub.toFixed(2)}</td><td><button class="del">✕</button></td>`;
    tr.querySelector(".name").textContent = it.name;
    tr.querySelector("input").onchange = e => { it.done = e.target.checked; save(); render(); };
    tr.querySelector(".del").onclick = () => { items = items.filter(x => x.id !== it.id); save(); render(); };
    body.appendChild(tr);
  });
  document.getElementById("total").textContent = "¥" + total.toFixed(2);
}
document.getElementById("add").onclick = () => {
  const n = document.getElementById("name").value.trim();
  const q = parseFloat(document.getElementById("qty").value) || 1;
  const p = parseFloat(document.getElementById("price").value) || 0;
  if (!n) return;
  items.push({ id: Date.now(), name: n, qty: q, price: p, done: false });
  ["name", "price"].forEach(i => document.getElementById(i).value = "");
  document.getElementById("qty").value = 1;
  save(); render();
};
render();