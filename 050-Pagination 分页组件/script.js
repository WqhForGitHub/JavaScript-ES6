const data = Array.from({ length: 96 }, (_, i) => `第 ${i + 1} 条数据，这是模拟内容项。`);
const perPage = 10;
let page = 1;
function render() {
  const start = (page - 1) * perPage;
  document.getElementById("list").innerHTML = data.slice(start, start + perPage).map((d, i) => `<li><span class="idx">${start + i + 1}</span><span>${d}</span></li>`).join("");
  renderPager();
}
function renderPager() {
  const total = Math.ceil(data.length / perPage);
  const pager = document.getElementById("pager");
  let html = `<button ${page === 1 ? "disabled" : ""} data-a="prev">上一页</button>`;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 2 && i <= page + 2)) html += `<button class="${i === page ? "active" : ""}">${i}</button>`;
    else if (i === page - 3 || i === page + 3) html += `<button disabled>...</button>`;
  }
  html += `<button ${page === total ? "disabled" : ""} data-a="next">下一页</button>`;
  pager.innerHTML = html;
  pager.querySelectorAll("button").forEach(b => b.onclick = () => {
    if (b.dataset.a === "prev") page--; else if (b.dataset.a === "next") page++; else page = parseInt(b.textContent);
    if (page < 1) page = 1; if (page > total) page = total;
    render();
  });
}
render();