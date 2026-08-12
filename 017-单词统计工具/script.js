const t = document.getElementById("text");
function calc() {
  const v = t.value;
  const raw = (v.toLowerCase().match(/[a-z']+|[\u4e00-\u9fa5]/g) || []);
  const words = raw.map(w => w.trim()).filter(Boolean);
  document.getElementById("words").textContent = words.length;
  document.getElementById("sent").textContent = v ? (v.match(/[。.!?！？\n]+/g) || []).length || 1 : 0;
  const set = new Set(words);
  document.getElementById("uniq").textContent = set.size;
  document.getElementById("avg").textContent = words.length ? (words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1) : 0;
  const map = {};
  words.forEach(w => map[w] = (map[w] || 0) + 1);
  const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  document.getElementById("freq").innerHTML = top.map(([w, c]) => `<div><b>${w}</b><span>${c}</span></div>`).join("") || "<div style='color:#999'>无数据</div>";
}
t.oninput = calc; calc();