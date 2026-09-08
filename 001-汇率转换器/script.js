const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 152, CNY: 7.24, HKD: 7.81, KRW: 1360, AUD: 1.52, CAD: 1.36, CHF: 0.90 };
const names = { USD: "美元", EUR: "欧元", GBP: "英镑", JPY: "日元", CNY: "人民币", HKD: "港币", KRW: "韩元", AUD: "澳元", CAD: "加元", CHF: "瑞郎" };
const from = document.getElementById("from");
const to = document.getElementById("to");
Object.keys(rates).forEach(k => {
  from.add(new Option(`${k} ${names[k]}`, k));
  to.add(new Option(`${k} ${names[k]}`, k));
});
from.value = "USD"; to.value = "CNY";
function calc() {
  const amt = parseFloat(document.getElementById("amount").value) || 0;
  const r = rates[to.value] / rates[from.value];
  const out = (amt * r).toFixed(2);
  document.getElementById("result").textContent = `${amt} ${from.value} = ${out} ${to.value}`;
}
document.getElementById("calc").onclick = calc;
document.getElementById("swap").onclick = () => {
  const t = from.value; from.value = to.value; to.value = t; calc();
};
calc();