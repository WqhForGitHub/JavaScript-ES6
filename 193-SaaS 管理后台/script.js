const users = [
  { name: "Alice", email: "alice@x.com", plan: "Pro", status: "active" },
  { name: "Bob", email: "bob@x.com", plan: "Free", status: "active" },
  { name: "Charlie", email: "charlie@x.com", plan: "Pro", status: "churn" },
  { name: "Dan", email: "dan@x.com", plan: "Team", status: "active" }
];
const pages = {
  dash: () => `
    <div class="cards">
      <div class="card"><div class="v">${users.length}</div><div class="l">总用户数</div></div>
      <div class="card"><div class="v">${users.filter(u => u.plan === "Pro").length}</div><div class="l">付费用户</div></div>
      <div class="card"><div class="v">$4,820</div><div class="l">本月 MRR</div></div>
      <div class="card"><div class="v">12.3%</div><div class="l">月增长率</div></div>
    </div>
    <h3>近期收入趋势</h3>
    <pre style="background:#fff;padding:16px;border-radius:8px;border:1px solid #eee">▮▮▮▮▮▮▮▮▮▮▮▮  每月美元收入柱状</pre>`,
  users: () => `<table><thead><tr><th>姓名</th><th>邮箱</th><th>套餐</th><th>状态</th></tr></thead><tbody>${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.plan}</td><td><span class="badge ${u.status === "active" ? "active" : "bad-p"}">${u.status}</span></td></tr>`).join("")}</tbody></table>`,
  billing: () => `<table><thead><tr><th>客户</th><th>套餐</th><th>金额</th><th>状态</th></tr></thead><tbody>${users.map(u => `<tr><td>${u.name}</td><td>${u.plan}</td><td>$${u.plan === "Pro" ? 29 : u.plan === "Team" ? 99 : 0}</td><td><span class="badge active">已支付</span></td></tr>`).join("")}</tbody></table>`,
  settings: () => `<div class="card"><h3>站点设置</h3><p style="margin-top:10px">站点名：<input value="Apex SaaS" /></p><p style="margin-top:10px">开启 2FA：<input type="checkbox" checked /></p><button style="margin-top:14px;padding:8px 18px;background:#1f2a44;color:#fff;border:none;border-radius:6px">保存</button></div>`
};
document.querySelectorAll("nav a").forEach(a => a.onclick = () => { document.querySelectorAll("nav a").forEach(x => x.classList.remove("active")); a.classList.add("active"); document.getElementById("title").textContent = a.textContent.trim().slice(2); document.getElementById("page").innerHTML = pages[a.dataset.p](); });
document.querySelector('nav a').click();