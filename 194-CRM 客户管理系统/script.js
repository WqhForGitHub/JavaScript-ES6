let customers = JSON.parse(localStorage.getItem("crm") || '[{"id":1,"name":"Alice","company":"Acme","phone":"13800000001","amount":5000,"stage":"线索"},{"id":2,"name":"Bob","company":"Globex","phone":"13800000002","amount":12000,"stage":"跟进"},{"id":3,"name":"Carol","company":"Initech","phone":"13800000003","amount":28000,"stage":"成交"}]');
function save() { localStorage.setItem("crm", JSON.stringify(customers)); }
const stages = ["线索", "跟进", "成交", "流失"];
function render() {
  const kw = document.getElementById("search").value.toLowerCase();
  const stage = document.getElementById("stage").value;
  document.getElementById("body").innerHTML = customers.filter(c => (!stage || c.stage === stage) && (c.name + c.company + c.phone).toLowerCase().includes(kw)).map((c, i) => `<tr><td>${c.name}</td><td>${c.company}</td><td>${c.phone}</td><td>¥${c.amount}</td><td><span class="badge s${stages.indexOf(c.stage)}">${c.stage}</span></td><td><button onclick="move(${i})" style="padding:4px 10px;background:#3498db">→</button></td></tr>`).join("");
}
function move(i) { const c = customers[i]; stages.indexOf(c.stage) < stages.length - 1 && (c.stage = stages[stages.indexOf(c.stage) + 1]); save(); render(); }
document.getElementById("add").onclick = () => { const name = prompt("姓名"), company = prompt("公司"), phone = prompt("电话"), amount = +(prompt("金额", 1000) || 0); if (!name) return; customers.push({ id: Date.now(), name, company, phone, amount, stage: "线索" }); save(); render(); };
document.getElementById("search").oninput = render;
document.getElementById("stage").onchange = render;
render();