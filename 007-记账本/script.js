const cats = { expense: ["餐饮", "交通", "购物", "娱乐", "住房", "其他"], income: ["工资", "奖金", "投资", "其他"] };
const sel = document.getElementById("cat");
function fillCat() {
  sel.innerHTML = "";
  cats[document.getElementById("type").value].forEach(c => sel.add(new Option(c, c)));
}
document.getElementById("type").onchange = fillCat; fillCat();
let recs = JSON.parse(localStorage.getItem("ledger") || "[]");
function save() { localStorage.setItem("ledger", JSON.stringify(recs)); }
function money(n) { return "¥" + Number(n).toFixed(2); }
function render() {
  let inc = 0, exp = 0;
  const list = document.getElementById("list"); list.innerHTML = "";
  [...recs].reverse().forEach(r => {
    if (r.type === "income") inc += r.amount; else exp += r.amount;
    const li = document.createElement("li");
    li.innerHTML = `<div class="left"><span>${r.cat}</span><small>${r.note || ""}</small></div><div class="amt ${r.type === "income" ? "in" : "out"}">${r.type === "income" ? "+" : "-"}${money(r.amount)}</div><span class="del">✕</span>`;
    li.querySelector(".del").onclick = () => { recs = recs.filter(x => x.id !== r.id); save(); render(); };
    list.appendChild(li);
  });
  document.getElementById("inc").textContent = money(inc);
  document.getElementById("exp").textContent = money(exp);
  document.getElementById("bal").textContent = money(inc - exp);
}
document.getElementById("add").onclick = () => {
  const amt = parseFloat(document.getElementById("amount").value);
  if (!amt || amt <= 0) return alert("请输入金额");
  recs.push({ id: Date.now(), type: document.getElementById("type").value, cat: sel.value, amount: amt, note: document.getElementById("note").value, time: Date.now() });
  ["amount", "note"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
render();