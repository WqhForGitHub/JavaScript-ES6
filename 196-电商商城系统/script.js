const products = [
  { id: 1, name: "蓝牙耳机", price: 199, img: "https://picsum.photos/id/0/200" },
  { id: 2, name: "机械键盘", price: 599, img: "https://picsum.photos/id/180/200" },
  { id: 3, name: "智能手表", price: 999, img: "https://picsum.photos/id/1015/200" },
  { id: 4, name: "游戏鼠标", price: 399, img: "https://picsum.photos/id/1025/200" },
  { id: 5, name: "显示器", price: 1599, img: "https://picsum.photos/id/1078/200" },
  { id: 6, name: "移动电源", price: 149, img: "https://picsum.photos/id/84/200" },
  { id: 7, name: "无线充电板", price: 99, img: "https://picsum.photos/id/119/200" },
  { id: 8, name: "笔记本支架", price: 89, img: "https://picsum.photos/id/24/200" }
];
let cart = [];
function renderProducts() { document.getElementById("grid").innerHTML = products.map(p => `<div class="item"><img src="${p.img}"><div class="info"><div class="name">${p.name}</div><div class="price">¥${p.price}</div><button onclick="add(${p.id})">加入购物车</button></div></div>`).join(""); }
function add(id) { const p = products.find(x => x.id === id); const it = cart.find(c => c.id === id); if (it) it.qty++; else cart.push({ ...p, qty: 1 }); renderCart(); }
function renderCart() {
  document.getElementById("cart").textContent = "🛒 " + cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById("cartList").innerHTML = cart.map((c, i) => `<li><span>${c.name} × ${c.qty}</span><span>¥${c.price * c.qty}</span><button onclick="remove(${i})" style="background:none;border:none;color:#e74c3c;cursor:pointer">✕</button></li>`).join("");
  document.getElementById("total").textContent = "¥" + cart.reduce((s, c) => s + c.price * c.qty, 0);
}
function remove(i) { cart.splice(i, 1); renderCart(); }
document.getElementById("cart").onclick = () => document.getElementById("cartPanel").classList.add("show");
document.getElementById("checkout").onclick = () => { if (cart.length) { alert("下单成功！合计 ¥" + cart.reduce((s, c) => s + c.price * c.qty, 0)); cart = []; renderCart(); document.getElementById("cartPanel").classList.remove("show"); } };
renderProducts(); renderCart();