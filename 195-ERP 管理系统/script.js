const inventory = [{ sku: "A001", name: "鼠标", qty: 120 }, { sku: "A002", name: "键盘", qty: 80 }, { sku: "A003", name: "显示器", qty: 35 }, { sku: "A004", name: "主机", qty: 22 }];
const orders = [{ id: "ORD-001", item: "鼠标", qty: 5, total: 250 }, { id: "ORD-002", item: "显示器", qty: 2, total: 2000 }, { id: "ORD-003", item: "键盘", qty: 10, total: 800 }];
const pages = {
  inv: `<h3>库存列表</h3><table><thead><tr><th>SKU</th><th>名称</th><th>数量</th><th>状态</th></tr></thead><tbody>${inventory.map(i => `<tr><td>${i.sku}</td><td>${i.name}</td><td>${i.qty}</td><td style="color:${i.qty < 50 ? "#e74c3c" : "#27ae60"}">${i.qty < 50 ? "需补货" : "充足"}</td></tr>`).join("")}</tbody></table>`,
  orders: `<h3>订单</h3><table><thead><tr><th>订单号</th><th>商品</th><th>数量</th><th>金额</th></tr></thead><tbody>${orders.map(o => `<tr><td>${o.id}</td><td>${o.item}</td><td>${o.qty}</td><td>¥${o.total}</td></tr>`).join("")}</tbody></table>`,
  finance: `<div class="deals"><div class="deal"><div class="v">¥${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}</div><div class="l">本期销售额</div></div><div class="deal"><div class="v">${orders.length}</div><div class="l">订单数</div></div><div class="deal"><div class="v">¥1,420</div><div class="l">净利润</div></div></div>`
};
document.querySelectorAll("nav a").forEach(a => a.onclick = () => { document.querySelectorAll("nav a").forEach(x => x.classList.remove("active")); a.classList.add("active"); document.getElementById("title").textContent = a.textContent.trim().slice(2) + "管理"; document.getElementById("page").innerHTML = pages[a.dataset.m]; });
document.querySelector("nav a").click();