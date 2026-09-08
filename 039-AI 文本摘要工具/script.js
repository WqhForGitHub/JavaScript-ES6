const stop = new Set("的 了 和 是 在 我 有 与 及 或 等 以 与之 之 也 着 过 这 那 这那 个 些 中 而 其 上 下 不 都 又 才 一 个 这 些 可".split(" "));
document.getElementById("ratio").oninput = e => document.getElementById("rv").textContent = e.target.value + "%";
function summarize(text, ratio) {
  const sentences = text.match(/[^。！？\n]+[。！？]?/g) || [];
  if (sentences.length <= 3) return text;
  const words = sentences.map(s => s.replace(/[，。！？、,.!?]/g, " ").match(/[\u4e00-\u9fa5]|[a-zA-Z]+(?:\s+[a-zA-Z]+)?/g) || []);
  const wordWeight = {};
  words.flat().forEach(w => wordWeight[w] = (wordWeight[w] || 0) + 1);
  const scores = sentences.map((s, i) => ({ i, s, score: (words[i].filter(w => !stop.has(w)).reduce((a, w) => a + (wordWeight[w] || 0), 0)) / (words[i].length || 1) }));
  const n = Math.max(1, Math.round(sentences.length * ratio / 100));
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, n).sort((a, b) => a.i - b.i);
  return top.map(t => t.s.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]+/, "")).join("");
}
document.getElementById("go").onclick = () => {
  const text = document.getElementById("src").value.trim();
  const ratio = parseInt(document.getElementById("ratio").value);
  document.getElementById("res").textContent = text ? summarize(text, ratio) : "请输入文本";
};