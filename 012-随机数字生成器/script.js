document.getElementById("gen").onclick = () => {
  let min = parseInt(document.getElementById("min").value);
  let max = parseInt(document.getElementById("max").value);
  const count = parseInt(document.getElementById("count").value);
  const unique = document.getElementById("unique").checked;
  if (isNaN(min) || isNaN(max) || min > max) { alert("范围错误"); return; }
  if (unique && max - min + 1 < count) { alert("范围内数量不足用于不重复生成"); return; }
  const picked = new Set();
  const res = [];
  let guard = 0;
  while (res.length < count && guard++ < 100000) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (unique) { if (!picked.has(n)) { picked.add(n); res.push(n); } }
    else res.push(n);
  }
  res.sort((a, b) => a - b);
  document.getElementById("result").textContent = res.join("  ");
};