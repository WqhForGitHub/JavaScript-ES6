const msgs = ["今日宜出行✈️", "宜表白❤️", "宜投资💰", "宜学习📚", "宜交友🤝", "宜休息😴", "宜运动🏃", "宜shopping🛍️"];
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
document.getElementById("gen").onclick = () => {
  const name = document.getElementById("name").value.trim() || "guest";
  const h = hashStr(name + new Date().toDateString());
  const nums = [];
  for (let i = 0; i < 5; i++) nums.push(h % 49 + 1), h = (h * 1103515245 + 12345) >>> 0;
  const box = document.getElementById("lucky");
  box.innerHTML = "";
  nums.forEach((n, i) => {
    const b = document.createElement("div");
    b.className = "ball"; b.textContent = n; b.style.animationDelay = (i * .1) + "s";
    box.appendChild(b);
  });
  document.getElementById("msg").textContent = "✨ " + msgs[h % msgs.length];
};