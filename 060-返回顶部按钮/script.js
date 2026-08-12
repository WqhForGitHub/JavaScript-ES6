for (let i = 0; i < 20; i++) {
  const p = document.createElement("p");
  p.textContent = `段落 ${i + 1}：这是一段填充文字，用来体现页面足够长，可以滚动测试「返回顶部」按钮的显隐动画与平滑滚动效果。JavaScript 与浏览器原生 API 让小功能也能变得优雅。`;
  document.querySelector(".content").appendChild(p);
}
const top = document.getElementById("top");
window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 300));
top.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });