const md = document.getElementById("md");
function calc() {
  const v = md.value;
  document.getElementById("chars").textContent = v.length;
  const plain = v.replace(/[#*_>`~\-\[\]\(\)!]/g, "").replace(/\n+/g, " ");
  const words = (plain.match(/[a-zA-Z]+|[\u4e00-\u9fa5]/g) || []).length;
  document.getElementById("words").textContent = words;
  document.getElementById("headings").textContent = (v.match(/^#{1,6}\s/gm) || []).length;
  document.getElementById("list").textContent = (v.match(/^\s*[-*+]\s/gm) || []).length;
  document.getElementById("code").textContent = (v.match(/```/g) || []).length / 2;
  document.getElementById("links").textContent = (v.match(/\[.+?\]\(.+?\)/g) || []).length;
  document.getElementById("imgs").textContent = (v.match(/!\[.+?\]\(.+?\)/g) || []).length;
  document.getElementById("read").textContent = Math.max(1, Math.round(words / 300));
}
md.oninput = calc; calc();