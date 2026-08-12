const total = 200;
let cur = 0, loading = false;
const list = document.getElementById("list");
function load() {
  if (loading || cur >= total) return;
  loading = true;
  setTimeout(() => {
    for (let i = 0; i < 15 && cur < total; i++, cur++) {
      const div = document.createElement("div"); div.className = "card";
      div.innerHTML = `<div class="num">${cur + 1}</div><div><h4>第 ${cur + 1} 篇文章</h4><p>这是模拟数据条目，用于演示无限滚动效果。</p></div>`;
      list.appendChild(div);
    }
    loading = false;
    document.getElementById("load").textContent = cur >= total ? "—— 已到底 ——" : "向下滚动加载更多";
  }, 500);
}
const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) load(); });
ob.observe(document.getElementById("load"));
load();