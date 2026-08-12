function tokenize(s) { return s.toLowerCase().match(/[\u4e00-\u9fa5]|[a-zA-Z]+/g) || []; }
function splitSentences(s) { return s.split(/\n+/).filter(Boolean); }
function retrieve(query, kb, topN = 2) {
  const q = new Set(tokenize(query));
  const docs = splitSentences(kb).map(doc => ({ doc, score: tokenize(doc).filter(t => q.has(t)).length }));
  return docs.sort((a, b) => b.score - a.score).slice(0, topN).filter(d => d.score > 0).map(d => d.doc);
}
function generate(answer, ctxs) {
  if (!ctxs.length) return "未在知识库中找到相关信息。";
  // 本地"生成"：把找到的文档拼接 + 解读
  return [`根据知识库：\n\n${ctxs.map(c => "• " + c).join("\n")}\n\n基于上述信息，你可得到答案。`];
}
document.getElementById("ask").onclick = () => {
  const q = document.getElementById("q").value.trim();
  const kb = document.getElementById("kb").value;
  if (!q) return;
  const ctxs = retrieve(q, kb);
  document.getElementById("ctx").innerHTML = "检索上下文：<br>" + (ctxs.map(c => c.slice(0, 60) + "...").join("<br>") || "无");
  document.getElementById("ans").textContent = generate(q, ctxs)[0];
};