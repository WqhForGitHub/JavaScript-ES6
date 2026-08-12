const data = [
  ["什么是 HTML？", "HTML 是用来描述网页结构的标记语言，由一系列标签组成。"],
  ["什么是 CSS？", "CSS 用于控制网页的展现样式，包括布局、颜色、字体等。"],
  ["什么是 JavaScript？", "JavaScript 是一门动态脚本语言，能在浏览器中操作 DOM、处理事件。"],
  ["什么是 DOM？", "DOM 是文档对象模型，将 HTML 解析为可被脚本操作的树形结构。"],
];
const acc = document.getElementById("acc");
data.forEach(([q, a]) => {
  const item = document.createElement("div"); item.className = "item";
  item.innerHTML = `<div class="head"></div><div class="body"></div>`;
  item.querySelector(".head").textContent = q;
  item.querySelector(".body").textContent = a;
  item.querySelector(".head").onclick = () => item.classList.toggle("open");
  acc.appendChild(item);
});