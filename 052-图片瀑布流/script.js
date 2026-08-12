const grads = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7", "#fa709a", "#fee140", "#30cfd0", "#330867"];
const masonry = document.getElementById("masonry");
for (let i = 0; i < 20; i++) {
  const h = 120 + Math.floor(Math.random() * 200);
  const g1 = grads[Math.floor(Math.random() * grads.length)];
  const g2 = grads[Math.floor(Math.random() * grads.length)];
  const item = document.createElement("div"); item.className = "item";
  item.innerHTML = `<div class="cap">图 ${i + 1} · ${h}px</div>`;
  item.style.background = `linear-gradient(135deg,${g1},${g2})`;
  item.style.height = h + "px";
  masonry.appendChild(item);
}